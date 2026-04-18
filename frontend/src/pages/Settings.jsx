import React from 'react';
import { Settings as SettingsIcon, RotateCcw, Thermometer, Wind, Gauge } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

const Settings = () => {
  const {
    tempUnit, setTempUnit,
    windUnit, setWindUnit,
    pressureUnit, setPressureUnit,
    resetToDefault
  } = useSettings();

  const getToggleClass = (isActive, colorName) => {
    const base = "flex flex-1 justify-center items-center py-3.5 px-4 rounded-xl font-bold transition-all duration-300 border backdrop-blur-md";
    if (isActive) {
      if (colorName === 'blue') return `${base} bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-500/30 scale-[#1.02] z-10`;
      if (colorName === 'sky') return `${base} bg-sky-500 border-sky-500 text-white shadow-lg shadow-sky-500/30 scale-[#1.02] z-10`;
      if (colorName === 'purple') return `${base} bg-purple-500 border-purple-500 text-white shadow-lg shadow-purple-500/30 scale-[#1.02] z-10`;
    }
    return `${base} border-[var(--card-border)] bg-[var(--card-bg)] hover:brightness-125 opacity-70 hover:opacity-100`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-3 animate-[fadeIn_0.5s_ease-out]">
      <div className="mb-6 text-left flex flex-col sm:flex-row items-center gap-4">
        <div className="p-3 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-md backdrop-blur-lg flex-shrink-0">
           <SettingsIcon size={32} className="text-blue-500" strokeWidth={2.5} />
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Settings</h2>
          <p className="text-sm sm:text-[15px] opacity-60 font-medium">Customize your weather dashboard metrics.</p>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        
        {/* TEMPERATURE CARD */}
        <div className="glass rounded-2xl p-4 sm:p-5 flex flex-col gap-4 shadow-md group">
          <div className="flex items-center gap-3 border-b border-[var(--card-border)] pb-3">
            <Thermometer size={22} strokeWidth={2.5} className="text-blue-500" />
            <h3 className="text-lg font-bold">Temperature</h3>
          </div>
          <p className="text-xs sm:text-sm opacity-50 font-medium leading-relaxed">
            Choose between Metric or Imperial units for temperature mapping.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-3">
            <button
              className={getToggleClass(tempUnit === 'C', 'blue')}
              onClick={() => setTempUnit('C')}
            >
              Celsius (°C)
            </button>
            <button
              className={getToggleClass(tempUnit === 'F', 'blue')}
              onClick={() => setTempUnit('F')}
            >
              Fahrenheit (°F)
            </button>
          </div>
        </div>

        {/* WIND SPEED CARD */}
        <div className="glass rounded-2xl p-4 sm:p-5 flex flex-col gap-4 shadow-md group">
          <div className="flex items-center gap-3 border-b border-[var(--card-border)] pb-3">
            <Wind size={22} strokeWidth={2.5} className="text-sky-500" />
            <h3 className="text-lg font-bold">Wind Speed</h3>
          </div>
          <p className="text-xs sm:text-sm opacity-50 font-medium leading-relaxed">
            Adjust how wind forces are displayed globally.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-3">
            <button
              className={getToggleClass(windUnit === 'm/s', 'sky')}
              onClick={() => setWindUnit('m/s')}
            >
              Meters / Sec (m/s)
            </button>
            <button
              className={getToggleClass(windUnit === 'km/h', 'sky')}
              onClick={() => setWindUnit('km/h')}
            >
               km/h
            </button>
          </div>
        </div>

        {/* ATMOSPHERIC PRESSURE CARD */}
        <div className="glass rounded-2xl p-4 sm:p-5 flex flex-col gap-4 shadow-md group mb-4">
          <div className="flex items-center gap-3 border-b border-[var(--card-border)] pb-3">
            <Gauge size={22} strokeWidth={2.5} className="text-purple-500" />
            <h3 className="text-lg font-bold">Atmospheric Pressure</h3>
          </div>
          <p className="text-xs sm:text-sm opacity-50 font-medium leading-relaxed">
            Define base reporting mappings for barometric pressure.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-3">
            <button
              className={getToggleClass(pressureUnit === 'hPa', 'purple')}
              onClick={() => setPressureUnit('hPa')}
            >
              Hectopascal (hPa)
            </button>
            <button
              className={getToggleClass(pressureUnit === 'atm', 'purple')}
              onClick={() => setPressureUnit('atm')}
            >
              Atmosphere (atm)
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 mb-6 flex items-center justify-center">
        <button 
          className="w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-sm transition-all duration-300 bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white"
          onClick={resetToDefault}
        >
          <RotateCcw size={18} strokeWidth={2.5} /> 
          Reset Default Settings
        </button>
      </div>
    </div>
    </div>
  );
};

export default Settings;
