import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, RefreshCw, Wind, Droplets, PlusCircle } from 'lucide-react';
import { getSavedCities, deleteCity } from '../api/backendApi';
import { getWeatherByCity, getAqiByCoords } from '../api/weatherApi';
import { getWeatherTheme, isNightTime } from '../utils/weatherBackgrounds';
import { useSettings } from '../context/SettingsContext';
import './SavedCities.css';

// Module-level cache — shared across navigations
let cache = {
  cities: null,
  weatherMap: null,
  aqiMap: null,
  timestamp: 0,
  dirty: false,   // set true externally to force a fresh fetch on next mount
};

// Called by CityDetails after save/delete so SavedCities re-fetches immediately
export const invalidateSavedCache = () => {
  cache.dirty = true;
  cache.timestamp = 0; // age-out the cache instantly
};

// AQI label and colour helpers
const AQI_INFO = [
  null,
  { label: 'Good',      color: '#22c55e', bg: 'rgba(34,197,94,0.15)'   },
  { label: 'Fair',      color: '#a3e635', bg: 'rgba(163,230,53,0.15)'  },
  { label: 'Moderate',  color: '#facc15', bg: 'rgba(250,204,21,0.15)'  },
  { label: 'Poor',      color: '#fb923c', bg: 'rgba(251,146,60,0.15)'  },
  { label: 'Very Poor', color: '#f87171', bg: 'rgba(248,113,113,0.15)' },
];

const SavedCities = ({ setBgClass }) => {
  const { formatTemp, formatWind } = useSettings();
  const [savedCities, setSavedCities] = useState([]);
  const [weatherData, setWeatherData] = useState({});
  const [aqiData, setAqiData]         = useState({});
  const [loading, setLoading]         = useState(true);
  const [refreshing, setRefreshing]   = useState(false);
  const [error, setError]             = useState(null);
  const navigate = useNavigate();

  const fetchAll = async (isRefresh = false) => {
    try {
      const now = Date.now();
      
      // Use cache only if: not a manual refresh, not dirty, and less than 5 minutes old
      if (!isRefresh && !cache.dirty && cache.cities && cache.weatherMap && (now - cache.timestamp < 300000)) {
        setSavedCities(cache.cities);
        setWeatherData(cache.weatherMap);
        if (cache.aqiMap) setAqiData(cache.aqiMap);

        const firstCityData = Object.values(cache.weatherMap)[0];
        if (firstCityData && firstCityData.weather?.[0]) {
          const night = isNightTime(firstCityData.dt, firstCityData.timezone);
          const theme = getWeatherTheme(firstCityData.weather[0].main, firstCityData.main.temp, night);
          setBgClass(theme.bgClass);
        }

        setLoading(false);
        return;
      }

      isRefresh ? setRefreshing(true) : setLoading(true);
      const cities = await getSavedCities();
      setSavedCities(cities);

      // Fetch weather + AQI in parallel for all cities
      const [weatherResults, aqiResults] = await Promise.all([
        Promise.allSettled(cities.map(c => getWeatherByCity(c.name))),
        Promise.allSettled(cities.map(c => getAqiByCoords(c.lat, c.lon))),
      ]);

      const wMap = {};
      const aMap = {};
      let firstWeather = null;

      weatherResults.forEach((res, i) => {
        if (res.status === 'fulfilled') {
          wMap[cities[i]._id] = res.value;
          if (!firstWeather) firstWeather = res.value;
        }
      });

      aqiResults.forEach((res, i) => {
        if (res.status === 'fulfilled') aMap[cities[i]._id] = res.value;
      });

      setWeatherData(wMap);
      setAqiData(aMap);
      setError(null);

      // Save to cache and clear the dirty flag
      cache = {
        cities,
        weatherMap: wMap,
        aqiMap: aMap,
        timestamp: Date.now(),
        dirty: false,
      };

      if (firstWeather && firstWeather.weather?.[0]) {
        const night = isNightTime(firstWeather.dt, firstWeather.timezone);
        const theme = getWeatherTheme(firstWeather.weather[0].main, firstWeather.main.temp, night);
        setBgClass(theme.bgClass);
      }
    } catch (err) {
      console.error('SavedCities error:', err);
      setError(
        err.code === 'ECONNABORTED'
          ? 'Connecting is taking longer than usual (Database might be waking up). Please try again in a few seconds.'
          : 'Failed to load saved cities. Make sure your local Express server (port 5000) is running.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAll();
    const id = setInterval(() => fetchAll(true), 300000); // refresh every 5 min
    return () => clearInterval(id);
  }, []);

  const handleDelete = async (id, cityName, e) => {
    e.stopPropagation();
    const confirmed = window.confirm(`Remove "${cityName}" from saved cities?`);
    if (!confirmed) return;
    try {
      await deleteCity(id);
      // Update local state and cache
      const updatedCities = savedCities.filter(c => c._id !== id);
      const updatedWeather = { ...weatherData };
      delete updatedWeather[id];

      setSavedCities(updatedCities);
      setWeatherData(updatedWeather);

      // Update cache instantly so it stays in sync when coming back
      const updatedAqi = { ...aqiData };
      delete updatedAqi[id];
      cache.cities     = updatedCities;
      cache.weatherMap = updatedWeather;
      cache.aqiMap     = updatedAqi;
      setAqiData(updatedAqi);
    } catch { alert('Failed to remove city.'); }
  };

  return (
    <div className="saved-page fade-in">
      <div className="saved-header">
        <div>
          <h2>Saved Cities</h2>
          <p className="header-sub">Auto-refreshes every 5 minutes</p>
        </div>
        <div className="header-actions">
          <button className="btn" onClick={() => fetchAll(true)} disabled={refreshing}>
            <RefreshCw size={16} className={refreshing ? 'spin' : ''} />
            {refreshing ? 'Updating…' : 'Refresh'}
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            <PlusCircle size={16} /> Add City
          </button>
        </div>
      </div>

      {loading && (
        <div className="cities-grid">
          {[1, 2, 3].map(i => (
            <div key={i} className="glass skeleton-card">
              <div className="skeleton" style={{ height: '1.5rem', width: '60%', marginBottom: '1rem' }}></div>
              <div className="skeleton" style={{ height: '4rem', width: '40%', margin: '0 auto 1rem' }}></div>
              <div className="skeleton" style={{ height: '1rem', width: '80%', margin: '0 auto' }}></div>
            </div>
          ))}
        </div>
      )}

      {error && <div className="error-banner">{error}</div>}

      {!loading && savedCities.length === 0 && (
        <div className="empty-state glass">
          <span style={{ fontSize: '3rem' }}>🌆</span>
          <h3>No Cities Saved Yet</h3>
          <p>Search for cities and save them to track their weather here.</p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            <PlusCircle size={18} /> Search Cities
          </button>
        </div>
      )}

      {!loading && savedCities.length > 0 && (
        <div className="cities-grid">
          {savedCities.map(city => {
            const w = weatherData[city._id];
            return (
              <div
                key={city._id}
                className="city-card glass"
                onClick={() => navigate(`/city/${city.name}`)}
              >
                <div className="city-card-bg"></div>
                {w ? (
                  <>
                    <div className="city-card-header">
                      <div>
                        <h3 className="city-card-name">{w.name}</h3>
                        <p className="city-card-country">{w.sys.country}</p>
                      </div>
                      <button
                        className="city-delete-btn"
                        onClick={(e) => handleDelete(city._id, w.name, e)}
                        title="Remove"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="city-card-body">
                      <div className="city-card-icon-wrapper">
                        <img
                          src={`https://openweathermap.org/img/wn/${w.weather[0].icon}@4x.png`}
                          alt="icon"
                          className="float-anim"
                        />
                      </div>
                      <div className="city-temp-wrapper">
                        <span className="city-card-temp">{formatTemp(w.main.temp)}</span>
                      </div>
                    </div>

                    <div className="city-card-footer">
                       <span className="weather-badge">{w.weather[0].main}</span>
                       <div className="city-card-stats-row">
                         <span className="stat-badge"><Droplets size={14} /> {w.main.humidity}%</span>
                         <span className="stat-badge"><Wind size={14} /> {formatWind(w.wind.speed)}</span>
                       </div>
                     </div>
                     {/* AQI Badge */}
                     {aqiData[city._id] && (() => {
                       const info = AQI_INFO[aqiData[city._id]];
                       return (
                         <div className="aqi-badge" style={{ color: info.color, background: info.bg, borderColor: info.color }}>
                           <span className="aqi-dot" style={{ background: info.color }} />
                           AQI {aqiData[city._id]} · <strong>{info.label}</strong>
                         </div>
                       );
                     })()}
                  </>
                ) : (
                  <div className="card-loading-state">
                    <div className="loader" style={{ width: 24, height: 24, borderWidth: 2 }}></div>
                    <p style={{ zIndex: 1 }}>Loading…</p>
                    <button className="city-delete-btn" style={{ zIndex: 1, marginTop: '0.5rem' }} onClick={(e) => handleDelete(city._id, city.name, e)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SavedCities;
