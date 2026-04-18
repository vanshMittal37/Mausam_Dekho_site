import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Wind, Droplets, Thermometer, Eye, AlertCircle } from 'lucide-react';
import { getWeatherByLocation, getWeatherByCity, getAqiByCoords } from '../api/weatherApi';
import { getWeatherTheme, isNightTime } from '../utils/weatherBackgrounds';
import { useSettings } from '../context/SettingsContext';
import './Home.css';

const AQI_INFO = [
  null,
  { label: 'Good',      color: '#22c55e', bg: 'rgba(34,197,94,0.15)'   },
  { label: 'Fair',      color: '#a3e635', bg: 'rgba(163,230,53,0.15)'  },
  { label: 'Moderate',  color: '#facc15', bg: 'rgba(250,204,21,0.15)'  },
  { label: 'Poor',      color: '#fb923c', bg: 'rgba(251,146,60,0.15)'  },
  { label: 'Very Poor', color: '#f87171', bg: 'rgba(248,113,113,0.15)' },
];

const Home = ({ setBgClass }) => {
  const { formatTemp, formatWind } = useSettings();
  const [weather, setWeather]         = useState(null);
  const [aqi, setAqi]                 = useState(null);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState(null);
  const [locationDenied, setLocationDenied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // Apply background theme based on weather data
  const applyTheme = (data) => {
    if (!data?.weather) return;
    const night = isNightTime(data.dt, data.timezone);
    const theme = getWeatherTheme(data.weather[0].main, data.main.temp, night);
    setBgClass(theme.bgClass);
  };

  // Fetch weather by coordinates
  const fetchByCoords = async (lat, lon) => {
    try {
      setLoading(true);
      setError(null);
      const [data, aqiIndex] = await Promise.all([
        getWeatherByLocation(lat, lon),
        getAqiByCoords(lat, lon).catch(() => null),
      ]);
      setWeather(data);
      setAqi(aqiIndex);
      applyTheme(data);
      sessionStorage.setItem('homeWeather', JSON.stringify(data));
    } catch (err) {
      setError('Could not fetch weather for your location. Try searching a city.');
    } finally {
      setLoading(false);
    }
  };

  const runGeolocation = (freshRequest = false) => {
    setLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => fetchByCoords(pos.coords.latitude, pos.coords.longitude),
      async (err) => {
        // Fallback to IP-based location if browser hardware GPS fails/times out
        try {
          const res = await fetch('https://ipapi.co/json/');
          const ipData = await res.json();
          if (ipData && ipData.latitude && ipData.longitude) {
            console.log('Fell back to IP location:', ipData.city);
            fetchByCoords(ipData.latitude, ipData.longitude);
            return;
          }
        } catch (ipErr) {
          console.error('IP fallback failed:', ipErr);
        }

        setLoading(false);
        if (err.code === 1) {
          // PERMISSION_DENIED - user blocked location
          setLocationDenied(true);
        } else if (err.code === 3) {
          // TIMEOUT - permission OK but took too long (common on Windows laptops)
          setError('Location timed out. Your device may not have GPS. Try searching a city instead.');
        } else {
          // POSITION_UNAVAILABLE
          setError('Could not determine your location. Please search a city above.');
        }
      },
      {
        timeout: 10000, // Reduced to 10s to trigger fallback faster
        maximumAge: freshRequest ? 0 : 300000,
        enableHighAccuracy: false  // false = faster, uses WiFi/IP location
      }
    );
  };

  useEffect(() => {
    // Check session cache first so we don't re-ask for location on every navigation
    const cached = sessionStorage.getItem('homeWeather');
    if (cached) {
      try {
        const data = JSON.parse(cached);
        setWeather(data);
        applyTheme(data);
        return; // skip geolocation fetch
      } catch (_) {}
    }

    // No cache - try geolocation
    if (!navigator.geolocation) {
      setError('Geolocation not supported. Please search for a city.');
      return;
    }

    runGeolocation();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/city/${searchQuery.trim()}`);
  };

  const handleQuickSearch = async (city) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getWeatherByCity(city);
      setWeather(data);
      applyTheme(data);
      sessionStorage.setItem('homeWeather', JSON.stringify(data));
      // Fetch AQI using coords from weather response
      const aqiIndex = await getAqiByCoords(data.coord.lat, data.coord.lon).catch(() => null);
      setAqi(aqiIndex);
    } catch (err) {
      setError(`Could not find weather for "${city}".`);
    } finally {
      setLoading(false);
    }
  };

  const getClearCache = async () => {
    sessionStorage.removeItem('homeWeather');
    setLocationDenied(false);
    setError(null);

    // If we already know the city, just re-fetch by name (avoids geolocation on laptop)
    if (weather?.name) {
      try {
        setLoading(true);
        const data = await getWeatherByCity(weather.name);
        setWeather(data);
        applyTheme(data);
        sessionStorage.setItem('homeWeather', JSON.stringify(data));
      } catch (err) {
        setError('Failed to refresh weather data.');
      } finally {
        setLoading(false);
      }
      return;
    }

    // No city known - fall back to geolocation
    setWeather(null);
    runGeolocation(false);
  };

  const getIconClass = (main = '') => {
    const m = main.toLowerCase();
    if (m.includes('clear')) return 'icon-sun';
    if (m.includes('cloud') || m.includes('mist')) return 'icon-cloud';
    if (m.includes('rain') || m.includes('drizzle') || m.includes('thunder')) return 'icon-rain';
    return '';
  };

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

        {/* Quick search suggestions when location is denied */}
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
          <h3 className="section-title"><MapPin size={20} /> {weather ? `${weather.name}, ${weather.sys.country}` : 'Your Location'}</h3>
          {weather && (
            <button className="btn refresh-btn" onClick={getClearCache} title="Refresh location">
              ↻ Refresh
            </button>
          )}
        </div>

        {/* Skeleton Loader */}
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
          </div>
        )}

        {error && !loading && (
          <div className="error-banner glass">
            <span>⚠️ {error}</span>
          </div>
        )}

        {weather && !loading && (
          <div className="weather-card glass">
            <div className="weather-card-top">
              <div className="city-info">
                <h2 className="city-name">{weather.name}, {weather.sys.country}</h2>
                <p className="weather-condition">{weather.weather[0].description}</p>
                {aqi && (() => {
                  const info = AQI_INFO[aqi];
                  return (
                    <div className="aqi-home-badge" style={{ color: info.color, background: info.bg, borderColor: info.color }}>
                      <span className="aqi-dot" style={{ background: info.color }} />
                      AQI {aqi} · <strong>{info.label}</strong>
                    </div>
                  );
                })()}
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
                <span className="stat-value">{formatTemp(weather.main.temp_max).replace(/°[CF]/, '°')} / {formatTemp(weather.main.temp_min).replace(/°[CF]/, '°')}</span>
              </div>
              <div className="stat-box">
                <Eye size={24} className="stat-icon" />
                <span className="stat-label">Visibility</span>
                <span className="stat-value">{(weather.visibility / 1000).toFixed(1)} km</span>
              </div>
            </div>

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
