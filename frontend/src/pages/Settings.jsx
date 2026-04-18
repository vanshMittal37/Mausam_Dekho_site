import React from 'react';
import { Settings as SettingsIcon, RotateCcw, Thermometer, Wind, Gauge } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import './Settings.css';

const Settings = () => {
  const {
    tempUnit, setTempUnit,
    windUnit, setWindUnit,
    pressureUnit, setPressureUnit,
    resetToDefault
  } = useSettings();

  return (
    <div className="settings-page fade-in">
      <div className="settings-header">
        <h2><SettingsIcon size={28} /> Settings</h2>
        <p>Customize your weather dashboard metrics.</p>
      </div>

      <div className="settings-grid">
        
        {/* TEMPERATURE CARD */}
        <div className="settings-card glass">
          <div className="settings-card-top">
            <Thermometer className="settings-icon" size={24} />
            <h3>Temperature</h3>
          </div>
          <p className="settings-desc">Choose between Metric or Imperial units for temperature mapping.</p>
          <div className="toggle-group">
            <button
              className={`toggle-btn ${tempUnit === 'C' ? 'active' : ''}`}
              onClick={() => setTempUnit('C')}
            >
              Celsius (°C)
            </button>
            <button
              className={`toggle-btn ${tempUnit === 'F' ? 'active' : ''}`}
              onClick={() => setTempUnit('F')}
            >
              Fahrenheit (°F)
            </button>
          </div>
        </div>

        {/* WIND SPEED CARD */}
        <div className="settings-card glass">
          <div className="settings-card-top">
            <Wind className="settings-icon" size={24} />
            <h3>Wind Speed</h3>
          </div>
          <p className="settings-desc">Adjust how wind forces are displayed globally.</p>
          <div className="toggle-group">
            <button
              className={`toggle-btn ${windUnit === 'm/s' ? 'active' : ''}`}
              onClick={() => setWindUnit('m/s')}
            >
              Meters / Sec (m/s)
            </button>
            <button
              className={`toggle-btn ${windUnit === 'km/h' ? 'active' : ''}`}
              onClick={() => setWindUnit('km/h')}
            >
              Kilometers / Hr (km/h)
            </button>
          </div>
        </div>

        {/* ATMOSPHERIC PRESSURE CARD */}
        <div className="settings-card glass">
          <div className="settings-card-top">
            <Gauge className="settings-icon" size={24} />
            <h3>Atmospheric Pressure</h3>
          </div>
          <p className="settings-desc">Define base reporting mappings for barometric pressure.</p>
          <div className="toggle-group">
            <button
              className={`toggle-btn ${pressureUnit === 'hPa' ? 'active' : ''}`}
              onClick={() => setPressureUnit('hPa')}
            >
              Hectopascal (hPa)
            </button>
            <button
              className={`toggle-btn ${pressureUnit === 'atm' ? 'active' : ''}`}
              onClick={() => setPressureUnit('atm')}
            >
              Atmosphere (atm)
            </button>
          </div>
        </div>
      </div>

      <div className="settings-footer">
        <button className="btn btn-danger reset-btn" onClick={resetToDefault}>
          <RotateCcw size={16} /> Reset Default Settings
        </button>
      </div>
    </div>
  );
};

export default Settings;
