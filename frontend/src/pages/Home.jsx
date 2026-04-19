import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, MapPin, Wind, Droplets, Thermometer, Eye, AlertCircle,
  Sunrise, Sunset, ShieldCheck, ShieldAlert, ShieldX, Clock
} from 'lucide-react';
import {
  getWeatherByLocation, getWeatherByCity, getAqiByCoords,
  getForecastByLocation, getForecastByCity
} from '../api/weatherApi';
import { getWeatherTheme, isNightTime } from '../utils/weatherBackgrounds';
import { useSettings } from '../context/SettingsContext';
import './Home.css';

/* ── AQI meta ─────────────────────────────────────────────────────────── */
const AQI_INFO = [
  null,
  { label: 'Good',      color: '#22c55e', bg: 'rgba(34,197,94,0.15)'   },
  { label: 'Fair',      color: '#a3e635', bg: 'rgba(163,230,53,0.15)'  },
  { label: 'Moderate',  color: '#facc15', bg: 'rgba(250,204,21,0.15)'  },
  { label: 'Poor',      color: '#fb923c', bg: 'rgba(251,146,60,0.15)'  },
  { label: 'Very Poor', color: '#f87171', bg: 'rgba(248,113,113,0.15)' },
];

const AQI_SAFETY = [
  null,
  { msg: 'Safe to go outside',          Icon: ShieldCheck,  cls: 'alert-safe'     },
  { msg: 'Generally safe – take breaks',Icon: ShieldCheck,  cls: 'alert-safe'     },
  { msg: 'Moderate – limit long exposure',Icon: ShieldAlert,cls: 'alert-moderate' },
  { msg: 'Unhealthy – avoid going outside',Icon: ShieldX,   cls: 'alert-danger'   },
  { msg: 'Very Poor – stay indoors',    Icon: ShieldX,      cls: 'alert-danger'   },
];

/* ── Forecast helpers ──────────────────────────────────────────────────── */
const FORECAST_OFFSETS = [3, 5, 7, 9]; // hours ahead

/** Pick forecast entry closest to (now + offsetHours) */
const pickForecastEntry = (list, nowTs, offsetHours) => {
  const targetTs = nowTs + offsetHours * 3600;
  return list.reduce((best, cur) =>
    Math.abs(cur.dt - targetTs) < Math.abs(best.dt - targetTs) ? cur : best
  );
};

const fmt12h = (unixTs, tzOffsetSec) => {
  const d = new Date((unixTs + tzOffsetSec) * 1000);
  let h = d.getUTCHours();
  const m = d.getUTCMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
};

/* ── Weather icon CSS class ────────────────────────────────────────────── */
const getIconClass = (main = '') => {
  const m = main.toLowerCase();
  if (m.includes('clear')) return 'icon-sun';
  if (m.includes('cloud') || m.includes('mist')) return 'icon-cloud';
  if (m.includes('rain') || m.includes('drizzle') || m.includes('thunder')) return 'icon-rain';
  return '';
};

/* ════════════════════════════════════════════════════════════════════════ */
const Home = ({ setBgClass }) => {
  const { formatTemp, formatWind } = useSettings();
  const [weather, setWeather]       = useState(null);
  const [aqi, setAqi]               = useState(null);
  const [forecast, setForecast]     = useState(null);   // OWM forecast list
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);
  const [locationDenied, setLocationDenied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  /* ── apply background theme ── */
  const applyTheme = (data) => {
    if (!data?.weather) return;
    const night = isNightTime(data.dt, data.timezone);
    const theme = getWeatherTheme(data.weather[0].main, data.main.temp, night);
    setBgClass(theme.bgClass);
  };

  /* ── fetch by coords ── */
  const fetchByCoords = useCallback(async (lat, lon) => {
    try {
      setLoading(true);
      setError(null);
      const [data, aqiIndex, fcData] = await Promise.all([
        getWeatherByLocation(lat, lon),
        getAqiByCoords(lat, lon).catch(() => null),
        getForecastByLocation(lat, lon).catch(() => null),
      ]);
      setWeather(data);
      setAqi(aqiIndex);
      setForecast(fcData?.list ?? null);
      applyTheme(data);
      sessionStorage.setItem('homeWeather', JSON.stringify(data));
    } catch {
      setError('Could not fetch weather for your location. Try searching a city.');
    } finally {
      setLoading(false);
    }
  }, []);

  /* ── geolocation with IP fallback ── */
  const runGeolocation = (freshRequest = false) => {
    setLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => fetchByCoords(pos.coords.latitude, pos.coords.longitude),
      async (err) => {
        try {
          const res = await fetch('https://ipapi.co/json/');
          const ipData = await res.json();
          if (ipData?.latitude && ipData?.longitude) {
            fetchByCoords(ipData.latitude, ipData.longitude);
            return;
          }
        } catch {}
        setLoading(false);
        if (err.code === 1)      setLocationDenied(true);
        else if (err.code === 3) setError('Location timed out. Try searching a city.');
        else                     setError('Could not determine location. Please search a city.');
      },
      { timeout: 10000, maximumAge: freshRequest ? 0 : 300000, enableHighAccuracy: false }
    );
  };

  /* ── mount / cache ── */
  useEffect(() => {
    const cached = sessionStorage.getItem('homeWeather');
    if (cached) {
      try {
        const data = JSON.parse(cached);
        setWeather(data);
        applyTheme(data);
        // fetch forecast in background without blocking UI
        if (data.coord) {
          getForecastByLocation(data.coord.lat, data.coord.lon)
            .then(fc => setForecast(fc?.list ?? null))
            .catch(() => {});
          getAqiByCoords(data.coord.lat, data.coord.lon)
            .then(idx => setAqi(idx))
            .catch(() => {});
        }
        return;
      } catch {}
    }
    if (!navigator.geolocation) {
      setError('Geolocation not supported. Please search for a city.');
      return;
    }
    runGeolocation();
  }, []);

  /* ── search handlers ── */
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/city/${searchQuery.trim()}`);
  };

  const handleQuickSearch = async (city) => {
    try {
      setLoading(true);
      setError(null);
      const [data, fcData] = await Promise.all([
        getWeatherByCity(city),
        getForecastByCity(city).catch(() => null),
      ]);
      setWeather(data);
      applyTheme(data);
      setForecast(fcData?.list ?? null);
      sessionStorage.setItem('homeWeather', JSON.stringify(data));
      const aqiIndex = await getAqiByCoords(data.coord.lat, data.coord.lon).catch(() => null);
      setAqi(aqiIndex);
    } catch {
      setError(`Could not find weather for "${city}".`);
    } finally {
      setLoading(false);
    }
  };

  const getClearCache = async () => {
    sessionStorage.removeItem('homeWeather');
    setLocationDenied(false);
    setError(null);
    if (weather?.name) {
      try {
        setLoading(true);
        const [data, fcData] = await Promise.all([
          getWeatherByCity(weather.name),
          getForecastByCity(weather.name).catch(() => null),
        ]);
        setWeather(data);
        applyTheme(data);
        setForecast(fcData?.list ?? null);
        sessionStorage.setItem('homeWeather', JSON.stringify(data));
        const idx = await getAqiByCoords(data.coord.lat, data.coord.lon).catch(() => null);
        setAqi(idx);
      } catch {
        setError('Failed to refresh weather data.');
      } finally {
        setLoading(false);
      }
      return;
    }
    setWeather(null);
    runGeolocation(false);
  };

  /* ── derived values ── */
  const aqiInfo   = aqi ? AQI_INFO[aqi]   : null;
  const aqiSafety = aqi ? AQI_SAFETY[aqi] : null;
  const tzOffset  = weather?.timezone ?? 0;
  const sunriseStr = weather?.sys?.sunrise ? fmt12h(weather.sys.sunrise, tzOffset) : null;
  const sunsetStr  = weather?.sys?.sunset  ? fmt12h(weather.sys.sunset,  tzOffset) : null;

  // Build short-term forecast chips
  const forecastChips = (() => {
    if (!forecast || !weather) return [];
    const nowTs = weather.dt;
    return FORECAST_OFFSETS.map(offset => {
      const entry = pickForecastEntry(forecast, nowTs, offset);
      return { offset, entry };
    });
  })();

  /* ══════════════════════════════════════════════════════════════════════ */
  return (
    <div className="home-page fade-in">

      {/* ── HERO SEARCH ── */}
      <div className="hero-search glass">
        <div className="hero-text">
          <h2>🌍 Real-Time Weather</h2>
          <p>Search any city to get live weather details</p>
        </div>
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            className="input-field"
            placeholder="e.g. Delhi, Mumbai, Ghaziabad..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="btn btn-primary search-btn">
            <Search size={20} />
            <span>Search</span>
          </button>
        </form>

        {locationDenied && (
          <div className="quick-cities">
            <p>Quick search:</p>
            {['Delhi', 'Mumbai', 'Ghaziabad', 'Bangalore'].map(city => (
              <button key={city} className="btn quick-city-btn" onClick={() => handleQuickSearch(city)}>
                {city}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── LOCATION DENIED NOTICE ── */}
      {locationDenied && !weather && (
        <div className="location-denied-card glass">
          <AlertCircle size={36} className="denied-icon" />
          <div>
            <h3>Location Access Blocked</h3>
            <p>Your browser has blocked location access. To fix this:</p>
            <ol>
              <li>Click the 🔒 lock icon in your browser's address bar</li>
              <li>Set <strong>Location</strong> to <strong>Allow</strong></li>
              <li>Refresh the page</li>
            </ol>
            <p style={{ marginTop: '0.75rem', opacity: 0.6 }}>Or use the search bar above to look up any city!</p>
          </div>
        </div>
      )}

      {/* ── CURRENT LOCATION SECTION ── */}
      <div className="location-section">
        <div className="section-title-row">
          <h3 className="section-title">
            <MapPin size={20} />
            {weather ? `${weather.name}, ${weather.sys.country}` : 'Your Location'}
          </h3>
          {weather && (
            <button className="btn refresh-btn" onClick={getClearCache} title="Refresh location">
              ↻ Refresh
            </button>
          )}
        </div>

        {/* ── SKELETON LOADER ── */}
        {loading && (
          <div className="weather-card glass skeleton-card">
            <div className="skeleton" style={{ height: '2rem', width: '60%', marginBottom: '1rem' }}></div>
            <div className="skeleton" style={{ height: '6rem', width: '40%', margin: '0 auto 1.5rem' }}></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="skeleton" style={{ height: '4rem' }}></div>
              <div className="skeleton" style={{ height: '4rem' }}></div>
              <div className="skeleton" style={{ height: '4rem' }}></div>
              <div className="skeleton" style={{ height: '4rem' }}></div>
            </div>
            <div className="skeleton" style={{ height: '3.5rem', marginTop: '1rem', borderRadius: '12px' }}></div>
            <div className="skeleton" style={{ height: '5rem', marginTop: '1rem', borderRadius: '14px' }}></div>
          </div>
        )}

        {error && !loading && (
          <div className="error-banner glass">
            <span>⚠️ {error}</span>
          </div>
        )}

        {weather && !loading && (
          <div className="weather-card glass">

            {/* ── AQI SAFETY ALERT BANNER ── */}
            {aqiSafety && (() => {
              const SafeIcon = aqiSafety.Icon;
              return (
                <div className={`aqi-safety-alert ${aqiSafety.cls}`}>
                  <SafeIcon size={18} />
                  <span>{aqiSafety.msg}</span>
                  {aqiInfo && (
                    <span className="aqi-safety-badge" style={{ background: aqiInfo.bg, color: aqiInfo.color, borderColor: aqiInfo.color }}>
                      <span className="aqi-dot" style={{ background: aqiInfo.color }} />
                      AQI {aqi} · {aqiInfo.label}
                    </span>
                  )}
                </div>
              );
            })()}

            {/* ── TOP: city name + icon + temp ── */}
            <div className="weather-card-top">
              <div className="city-info">
                <h2 className="city-name">{weather.name}, {weather.sys.country}</h2>
                <p className="weather-condition">{weather.weather[0].description}</p>
              </div>
              <div className="temp-block">
                <img
                  src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`}
                  alt="icon"
                  className={`weather-icon ${getIconClass(weather.weather[0].main)}`}
                />
                <div>
                  <span className="temp-main">{formatTemp(weather.main.temp)}</span>
                  <p className="feels-like">Feels like {formatTemp(weather.main.feels_like)}</p>
                </div>
              </div>
            </div>

            {/* ── STAT GRID ── */}
            <div className="stat-grid">
              <div className="stat-box">
                <Droplets size={24} className="stat-icon" />
                <span className="stat-label">Humidity</span>
                <span className="stat-value">{weather.main.humidity}%</span>
              </div>
              <div className="stat-box">
                <Wind size={24} className="stat-icon" />
                <span className="stat-label">Wind</span>
                <span className="stat-value">{formatWind(weather.wind.speed)}</span>
              </div>
              <div className="stat-box">
                <Thermometer size={24} className="stat-icon" />
                <span className="stat-label">Max / Min</span>
                <span className="stat-value">
                  {formatTemp(weather.main.temp_max).replace(/°[CF]/, '°')} / {formatTemp(weather.main.temp_min).replace(/°[CF]/, '°')}
                </span>
              </div>
              <div className="stat-box">
                <Eye size={24} className="stat-icon" />
                <span className="stat-label">Visibility</span>
                <span className="stat-value">{(weather.visibility / 1000).toFixed(1)} km</span>
              </div>
            </div>

            {/* ── SUNRISE / SUNSET ── */}
            {(sunriseStr || sunsetStr) && (
              <div className="sun-row">
                {sunriseStr && (
                  <div className="sun-box">
                    <Sunrise size={22} className="sun-icon sunrise-icon" />
                    <div>
                      <span className="sun-label">Sunrise</span>
                      <span className="sun-time">{sunriseStr}</span>
                    </div>
                  </div>
                )}
                {sunsetStr && (
                  <div className="sun-box">
                    <Sunset size={22} className="sun-icon sunset-icon" />
                    <div>
                      <span className="sun-label">Sunset</span>
                      <span className="sun-time">{sunsetStr}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── SHORT-TERM FORECAST ── */}
            {forecastChips.length > 0 && (
              <div className="forecast-section">
                <div className="forecast-header">
                  <Clock size={15} />
                  <span>Short-Term Forecast</span>
                </div>
                <div className="forecast-strip">
                  {forecastChips.map(({ offset, entry }) => (
                    <div key={offset} className="forecast-chip">
                      <span className="fc-offset">+{offset}h</span>
                      <img
                        src={`https://openweathermap.org/img/wn/${entry.weather[0].icon}@2x.png`}
                        alt={entry.weather[0].main}
                        className="fc-icon"
                      />
                      <span className="fc-temp">{formatTemp(entry.main.temp)}</span>
                      <span className="fc-desc">{entry.weather[0].main}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              className="btn btn-primary details-btn"
              onClick={() => navigate(`/city/${weather.name}`)}
            >
              View Full Details →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
