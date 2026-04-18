import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Bookmark, BookmarkCheck, Trash2, Droplets, Wind, Thermometer, Compass, Eye, Gauge, Loader } from 'lucide-react';
import { getWeatherByCity } from '../api/weatherApi';
import { getAqiByCoords } from '../api/weatherApi';
import { getSavedCities, saveCity, deleteCity } from '../api/backendApi';
import { getWeatherTheme, isNightTime } from '../utils/weatherBackgrounds';
import { useSettings } from '../context/SettingsContext';
import { invalidateSavedCache } from './SavedCities';
import './CityDetails.css';

// AQI config shared with SavedCities
const AQI_INFO = [
  null,
  { label: 'Good',      color: '#22c55e', bg: 'rgba(34,197,94,0.15)'   },
  { label: 'Fair',      color: '#a3e635', bg: 'rgba(163,230,53,0.15)'  },
  { label: 'Moderate',  color: '#facc15', bg: 'rgba(250,204,21,0.15)'  },
  { label: 'Poor',      color: '#fb923c', bg: 'rgba(251,146,60,0.15)'  },
  { label: 'Very Poor', color: '#f87171', bg: 'rgba(248,113,113,0.15)' },
];

const CityDetails = ({ setBgClass }) => {
  const { formatTemp, formatWind, formatPressure } = useSettings();
  const { cityName } = useParams();
  const navigate = useNavigate();
  const [weather, setWeather] = useState(null);
  const [aqi, setAqi]         = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  // Save/Delete state
  const [savedCityId, setSavedCityId] = useState(null); // null = not saved, string = the _id from DB
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch weather + saved list + AQI (coords needed first)
        const [data, savedList] = await Promise.all([
          getWeatherByCity(cityName),
          getSavedCities()
        ]);

        setWeather(data);
        const night = isNightTime(data.dt, data.timezone);
        const theme = getWeatherTheme(data.weather[0].main, data.main.temp, night);
        setBgClass(theme.bgClass);
        setError(null);

        // Fetch AQI using coords from the weather response
        try {
          const aqiIndex = await getAqiByCoords(data.coord.lat, data.coord.lon);
          setAqi(aqiIndex);
        } catch (_) { /* AQI is non-critical, silently ignore */ }

        const match = savedList.find(
          c => c.name.toLowerCase() === data.name.toLowerCase()
        );
        if (match) setSavedCityId(match._id);

      } catch (err) {
        setError('City not found. Please check the city name and try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [cityName]);

  // ── SAVE ──
  const handleSave = async () => {
    try {
      setSaveLoading(true);
      setSaveMsg('');
      const result = await saveCity({
        name: weather.name,
        lat: weather.coord.lat,
        lon: weather.coord.lon
      });
      setSavedCityId(result._id);
      invalidateSavedCache(); // bust SavedCities cache so it re-fetches on next visit
      setSaveMsg('City saved successfully!');
      setTimeout(() => setSaveMsg(''), 3000);
    } catch (err) {
      setSaveMsg(err.response?.data?.message || 'Could not save city.');
      setTimeout(() => setSaveMsg(''), 3000);
    } finally {
      setSaveLoading(false);
    }
  };

  // ── DELETE ──
  const handleDelete = async () => {
    const confirmed = window.confirm(`Remove "${weather.name}" from saved cities?`);
    if (!confirmed) return;
    try {
      setSaveLoading(true);
      await deleteCity(savedCityId);
      setSavedCityId(null);
      invalidateSavedCache(); // bust SavedCities cache so it re-fetches on next visit
      setSaveMsg('City removed.');
      setTimeout(() => setSaveMsg(''), 3000);
    } catch (err) {
      setSaveMsg('Failed to remove city.');
      setTimeout(() => setSaveMsg(''), 3000);
    } finally {
      setSaveLoading(false);
    }
  };

  const getIconClass = (main = '') => {
    const m = main.toLowerCase();
    if (m.includes('clear')) return 'icon-sun';
    if (m.includes('cloud') || m.includes('mist')) return 'icon-cloud';
    if (m.includes('rain') || m.includes('drizzle') || m.includes('thunder')) return 'icon-rain';
    return '';
  };

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

  return (
    <div className="city-details-page fade-in">

      {/* ── TOP ACTIONS ── */}
      <div className="page-actions">
        <button className="btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} /> Back
        </button>

        {/* Dynamic Save / Loading / Delete button */}
        {saveLoading ? (
          <button className="btn" disabled>
            <Loader size={18} className="spin" /> Processing…
          </button>
        ) : savedCityId ? (
          <button className="btn btn-danger" onClick={handleDelete}>
            <Trash2 size={18} /> Remove City
          </button>
        ) : (
          <button className="btn btn-primary" onClick={handleSave}>
            <Bookmark size={18} /> Save City
          </button>
        )}
      </div>

      {/* ── STATUS TOAST ── */}
      {saveMsg && (
        <div className={`save-toast ${saveMsg.includes('success') || saveMsg.includes('saved') ? 'toast-success' : saveMsg.includes('removed') ? 'toast-info' : 'toast-error'}`}>
          {saveMsg}
        </div>
      )}

      {weather && (
        <>
          {/* ── MAIN HERO CARD ── */}
          <div className="hero-card glass">
            <div className="hero-top">
              <div>
                <h2 className="city-name">{weather.name}, {weather.sys.country}</h2>
                <p className="weather-cond">{weather.weather[0].description}</p>
                {/* AQI pill */}
                {aqi && (() => {
                  const info = AQI_INFO[aqi];
                  return (
                    <div className="aqi-hero-badge" style={{ color: info.color, background: info.bg, borderColor: info.color }}>
                      <span className="aqi-dot" style={{ background: info.color }} />
                      AQI {aqi} · <strong>{info.label}</strong>
                    </div>
                  );
                })()}
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
          </div>

          {/* ── DETAIL STAT CARDS ── */}
          <div className="stats-grid">
            {[
              { icon: <Droplets size={28}/>,    label: 'Humidity',   value: `${weather.main.humidity}%` },
              { icon: <Wind size={28}/>,         label: 'Wind Speed', value: formatWind(weather.wind.speed) },
              { icon: <Gauge size={28}/>,        label: 'Pressure',   value: formatPressure(weather.main.pressure) },
              { icon: <Eye size={28}/>,          label: 'Visibility', value: `${(weather.visibility / 1000).toFixed(1)} km` },
              { icon: <Thermometer size={28}/>,  label: 'Min / Max',  value: `${formatTemp(weather.main.temp_min).replace(/°[CF]/, '°')} / ${formatTemp(weather.main.temp_max).replace(/°[CF]/, '°')}` },
              { icon: <Compass size={28}/>,      label: 'Wind Dir',   value: `${weather.wind.deg}°` },
            ].map(({ icon, label, value }) => (
              <div key={label} className="stat-card glass">
                <div className="stat-card-icon">{icon}</div>
                <span className="stat-card-label">{label}</span>
                <span className="stat-card-value">{value}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default CityDetails;
