import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Bookmark, Trash2, Droplets, Wind, Thermometer,
  Compass, Eye, Gauge, Loader, Sunrise, Sunset,
  ShieldCheck, ShieldAlert, ShieldX, Clock
} from 'lucide-react';
import { getWeatherByCity, getAqiByCoords, getForecastByCity } from '../api/weatherApi';
import { getSavedCities, saveCity, deleteCity } from '../api/backendApi';
import { getWeatherTheme, isNightTime } from '../utils/weatherBackgrounds';
import { useSettings } from '../context/SettingsContext';
import { invalidateSavedCache } from './SavedCities';
import './CityDetails.css';

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
  { msg: 'Safe to go outside',             Icon: ShieldCheck,  cls: 'alert-safe'     },
  { msg: 'Generally safe – take breaks',   Icon: ShieldCheck,  cls: 'alert-safe'     },
  { msg: 'Moderate – limit long exposure', Icon: ShieldAlert,  cls: 'alert-moderate' },
  { msg: 'Unhealthy – avoid going outside',Icon: ShieldX,      cls: 'alert-danger'   },
  { msg: 'Very Poor – stay indoors',       Icon: ShieldX,      cls: 'alert-danger'   },
];

/* ── Forecast helpers ──────────────────────────────────────────────────── */
const FORECAST_OFFSETS = [3, 5, 7, 9];

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

const getIconClass = (main = '') => {
  const m = main.toLowerCase();
  if (m.includes('clear')) return 'icon-sun';
  if (m.includes('cloud') || m.includes('mist')) return 'icon-cloud';
  if (m.includes('rain') || m.includes('drizzle') || m.includes('thunder')) return 'icon-rain';
  return '';
};

/* ════════════════════════════════════════════════════════════════════════ */
const CityDetails = ({ setBgClass }) => {
  const { formatTemp, formatWind, formatPressure } = useSettings();
  const { cityName } = useParams();
  const navigate = useNavigate();

  const [weather,    setWeather]    = useState(null);
  const [aqi,        setAqi]        = useState(null);
  const [forecast,   setForecast]   = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);

  const [savedCityId,  setSavedCityId]  = useState(null);
  const [saveLoading,  setSaveLoading]  = useState(false);
  const [saveMsg,      setSaveMsg]      = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [data, savedList, fcData] = await Promise.all([
          getWeatherByCity(cityName),
          getSavedCities(),
          getForecastByCity(cityName).catch(() => null),
        ]);

        setWeather(data);
        setForecast(fcData?.list ?? null);

        const night = isNightTime(data.dt, data.timezone);
        const theme = getWeatherTheme(data.weather[0].main, data.main.temp, night);
        setBgClass(theme.bgClass);
        setError(null);

        try {
          const aqiIndex = await getAqiByCoords(data.coord.lat, data.coord.lon);
          setAqi(aqiIndex);
        } catch {}

        const match = savedList.find(c => c.name.toLowerCase() === data.name.toLowerCase());
        if (match) setSavedCityId(match._id);

      } catch {
        setError('City not found. Please check the city name and try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [cityName]);

  /* ── Save / Delete ── */
  const handleSave = async () => {
    try {
      setSaveLoading(true); setSaveMsg('');
      const result = await saveCity({ name: weather.name, lat: weather.coord.lat, lon: weather.coord.lon });
      setSavedCityId(result._id);
      invalidateSavedCache();
      setSaveMsg('City saved successfully!');
      setTimeout(() => setSaveMsg(''), 3000);
    } catch (err) {
      setSaveMsg(err.response?.data?.message || 'Could not save city.');
      setTimeout(() => setSaveMsg(''), 3000);
    } finally { setSaveLoading(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Remove "${weather.name}" from saved cities?`)) return;
    try {
      setSaveLoading(true);
      await deleteCity(savedCityId);
      setSavedCityId(null);
      invalidateSavedCache();
      setSaveMsg('City removed.');
      setTimeout(() => setSaveMsg(''), 3000);
    } catch {
      setSaveMsg('Failed to remove city.');
      setTimeout(() => setSaveMsg(''), 3000);
    } finally { setSaveLoading(false); }
  };

  /* ── derived values ── */
  const aqiInfo   = aqi ? AQI_INFO[aqi]   : null;
  const aqiSafety = aqi ? AQI_SAFETY[aqi] : null;
  const tzOffset  = weather?.timezone ?? 0;
  const sunriseStr = weather?.sys?.sunrise ? fmt12h(weather.sys.sunrise, tzOffset) : null;
  const sunsetStr  = weather?.sys?.sunset  ? fmt12h(weather.sys.sunset,  tzOffset) : null;

  const forecastChips = (() => {
    if (!forecast || !weather) return [];
    return FORECAST_OFFSETS.map(offset => ({
      offset,
      entry: pickForecastEntry(forecast, weather.dt, offset),
    }));
  })();

  /* ── states ── */
  if (loading) return (
    <div className="city-loading">
      <div className="loader"></div>
      <p>Loading weather for <strong>{cityName}</strong>…</p>
    </div>
  );

  if (error) return (
    <div className="city-error fade-in">
      <button className="btn" onClick={() => navigate(-1)}><ArrowLeft size={18} /> Back</button>
      <div className="error-card glass">
        <h3>😕 Oops!</h3>
        <p>{error}</p>
      </div>
    </div>
  );

  /* ── render ── */
  return (
    <div className="city-details-page fade-in">

      {/* ── TOP ACTIONS ── */}
      <div className="page-actions">
        <button className="btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} /> Back
        </button>
        {saveLoading ? (
          <button className="btn" disabled><Loader size={18} className="spin" /> Processing…</button>
        ) : savedCityId ? (
          <button className="btn btn-danger" onClick={handleDelete}><Trash2 size={18} /> Remove City</button>
        ) : (
          <button className="btn btn-primary" onClick={handleSave}><Bookmark size={18} /> Save City</button>
        )}
      </div>

      {/* ── TOAST ── */}
      {saveMsg && (
        <div className={`save-toast ${saveMsg.includes('success') || saveMsg.includes('saved') ? 'toast-success' : saveMsg.includes('removed') ? 'toast-info' : 'toast-error'}`}>
          {saveMsg}
        </div>
      )}

      {weather && (
        <>
          {/* ── AQI SAFETY ALERT ── */}
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

          {/* ── MAIN HERO CARD ── */}
          <div className="hero-card glass">
            <div className="hero-top">
              <div>
                <h2 className="city-name">{weather.name}, {weather.sys.country}</h2>
                <p className="weather-cond">{weather.weather[0].description}</p>
              </div>
              <img
                src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`}
                alt="weather icon"
                className={`hero-icon ${getIconClass(weather.weather[0].main)}`}
              />
            </div>
            <div className="temp-row">
              <span className="big-temp">{formatTemp(weather.main.temp)}</span>
              <div className="temp-range">
                <span>↑ {formatTemp(weather.main.temp_max).replace(/°[CF]/, '°')}</span>
                <span>↓ {formatTemp(weather.main.temp_min).replace(/°[CF]/, '°')}</span>
                <span>Feels {formatTemp(weather.main.feels_like).replace(/°[CF]/, '°')}</span>
              </div>
            </div>

            {/* ── SUNRISE / SUNSET inside hero card ── */}
            {(sunriseStr || sunsetStr) && (
              <div className="sun-row-detail">
                {sunriseStr && (
                  <div className="sun-box-detail">
                    <Sunrise size={20} className="sunrise-icon" />
                    <div>
                      <span className="sun-label">Sunrise</span>
                      <span className="sun-time">{sunriseStr}</span>
                    </div>
                  </div>
                )}
                {sunsetStr && (
                  <div className="sun-box-detail">
                    <Sunset size={20} className="sunset-icon" />
                    <div>
                      <span className="sun-label">Sunset</span>
                      <span className="sun-time">{sunsetStr}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── DETAIL STAT CARDS ── */}
          <div className="stats-grid">
            {[
              { icon: <Droplets size={28}/>,   label: 'Humidity',   value: `${weather.main.humidity}%` },
              { icon: <Wind size={28}/>,        label: 'Wind Speed', value: formatWind(weather.wind.speed) },
              { icon: <Gauge size={28}/>,       label: 'Pressure',   value: formatPressure(weather.main.pressure) },
              { icon: <Eye size={28}/>,         label: 'Visibility', value: `${(weather.visibility / 1000).toFixed(1)} km` },
              { icon: <Thermometer size={28}/>, label: 'Min / Max',  value: `${formatTemp(weather.main.temp_min).replace(/°[CF]/, '°')} / ${formatTemp(weather.main.temp_max).replace(/°[CF]/, '°')}` },
              { icon: <Compass size={28}/>,     label: 'Wind Dir',   value: `${weather.wind.deg}°` },
            ].map(({ icon, label, value }) => (
              <div key={label} className="stat-card glass">
                <div className="stat-card-icon">{icon}</div>
                <span className="stat-card-label">{label}</span>
                <span className="stat-card-value">{value}</span>
              </div>
            ))}
          </div>

          {/* ── SHORT-TERM FORECAST ── */}
          {forecastChips.length > 0 && (
            <div className="forecast-section-detail glass">
              <div className="forecast-header-detail">
                <Clock size={16} />
                <span>Short-Term Forecast</span>
              </div>
              <div className="forecast-strip-detail">
                {forecastChips.map(({ offset, entry }) => (
                  <div key={offset} className="forecast-chip-detail">
                    <span className="fc-offset">+{offset}h</span>
                    <img
                      src={`https://openweathermap.org/img/wn/${entry.weather[0].icon}@2x.png`}
                      alt={entry.weather[0].main}
                      className="fc-icon-detail"
                    />
                    <span className="fc-temp-detail">{formatTemp(entry.main.temp)}</span>
                    <span className="fc-desc-detail">{entry.weather[0].main}</span>
                    <span className="fc-cond-detail">{Math.round(entry.pop * 100)}% 💧</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CityDetails;
