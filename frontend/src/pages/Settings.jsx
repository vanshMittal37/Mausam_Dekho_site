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
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 animate-[fadeIn_0.5s_ease-out]">
      <div className="mb-8 md:mb-12 text-center md:text-left flex flex-col md:flex-row items-center gap-5">
        <div className="p-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-md backdrop-blur-lg">
           <SettingsIcon size={40} className="text-blue-500" strokeWidth={2.5} />
        </div>
        <div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">Settings</h2>
          <p className="text-base sm:text-lg opacity-80 font-medium">Customize your weather dashboard metrics.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
        
        {/* TEMPERATURE CARD */}
        <div className="glass rounded-3xl p-6 sm:p-8 flex flex-col gap-6 shadow-xl group hover:-translate-y-1 transition-transform duration-300">
          <div className="flex items-center gap-4 border-b border-[var(--card-border)] pb-5">
            <div className="p-3.5 rounded-xl bg-blue-500/15 text-blue-500 ring-1 ring-blue-500/30 group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300 shadow-inner">
              <Thermometer size={26} strokeWidth={2.5} />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold">Temperature</h3>
          </div>
          <p className="text-[15px] sm:text-base opacity-75 leading-relaxed min-h-[48px] font-medium">
            Choose between Metric or Imperial units for temperature mapping everywhere.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-auto pt-2">
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
        <div className="glass rounded-3xl p-6 sm:p-8 flex flex-col gap-6 shadow-xl group hover:-translate-y-1 transition-transform duration-300">
          <div className="flex items-center gap-4 border-b border-[var(--card-border)] pb-5">
            <div className="p-3.5 rounded-xl bg-sky-500/15 text-sky-500 ring-1 ring-sky-500/30 group-hover:bg-sky-500 group-hover:text-white transition-colors duration-300 shadow-inner">
              <Wind size={26} strokeWidth={2.5} />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold">Wind Speed</h3>
          </div>
          <p className="text-[15px] sm:text-base opacity-75 leading-relaxed min-h-[48px] font-medium">
            Adjust how wind forces are displayed globally.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-auto pt-2">
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
              Kilo / Hr (km/h)
            </button>
          </div>
        </div>

        {/* ATMOSPHERIC PRESSURE CARD */}
        <div className="glass rounded-3xl p-6 sm:p-8 flex flex-col gap-6 shadow-xl group hover:-translate-y-1 transition-transform duration-300 lg:col-span-2 max-w-3xl mx-auto w-full">
          <div className="flex items-center gap-4 border-b border-[var(--card-border)] pb-5">
            <div className="p-3.5 rounded-xl bg-purple-500/15 text-purple-500 ring-1 ring-purple-500/30 group-hover:bg-purple-500 group-hover:text-white transition-colors duration-300 shadow-inner">
              <Gauge size={26} strokeWidth={2.5} />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold">Atmospheric Pressure</h3>
          </div>
          <p className="text-[15px] sm:text-base opacity-75 leading-relaxed font-medium">
            Define base reporting mappings for barometric pressure metrics.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-2">
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

      <div className="mt-14 flex justify-center md:justify-start">
        <button 
          className="flex items-center gap-2.5 py-4 px-8 rounded-2xl font-bold text-[17px] transition-all duration-300 bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white hover:shadow-lg hover:shadow-red-500/30 active:scale-95 group"
          onClick={resetToDefault}
        >
          <RotateCcw size={24} strokeWidth={2.5} className="group-hover:-rotate-180 transition-transform duration-500" /> 
          Reset Default Settings
        </button>
      </div>
    </div>
  );
};

export default Settings;
