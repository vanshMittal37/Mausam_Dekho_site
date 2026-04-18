import React, { useState } from 'react';
import { Settings as SettingsIcon, RotateCcw, Thermometer, Wind, Gauge, Check, Info } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

const Settings = () => {
  const {
    tempUnit, setTempUnit,
    windUnit, setWindUnit,
    pressureUnit, setPressureUnit,
    resetToDefault
  } = useSettings();

  const [showSaveIndicator, setShowSaveIndicator] = useState(false);

  const handleSettingChange = (settingType, value) => {
    switch(settingType) {
      case 'temperature':
        setTempUnit(value);
        break;
      case 'wind':
        setWindUnit(value);
        break;
      case 'pressure':
        setPressureUnit(value);
        break;
    }
    
    setShowSaveIndicator(true);
    setTimeout(() => setShowSaveIndicator(false), 2000);
  };

  const getToggleClass = (isActive, colorName) => {
    const base = "flex-1 flex items-center justify-center py-3 sm:py-4 px-3 sm:px-4 lg:px-6 rounded-xl font-semibold transition-all duration-300 border-2 cursor-pointer backdrop-blur-md";
    if (isActive) {
      if (colorName === 'blue') return `${base} bg-blue-500 border-blue-400 text-white shadow-xl shadow-blue-500/40 scale-105 z-10`;
      if (colorName === 'sky') return `${base} bg-sky-500 border-sky-400 text-white shadow-xl shadow-sky-500/40 scale-105 z-10`;
      if (colorName === 'purple') return `${base} bg-purple-500 border-purple-400 text-white shadow-xl shadow-purple-500/40 scale-105 z-10`;
    }
    return `${base} border-gray-300/50 dark:border-gray-600/50 bg-white/90 dark:bg-white/10 hover:bg-white dark:hover:bg-white/15 hover:border-gray-400 dark:hover:border-gray-500 hover:shadow-lg hover:scale-102 opacity-90 hover:opacity-100 text-gray-800 dark:text-gray-200`;
  };

  const SettingCard = ({ icon, iconColor, title, description, children, category, bgColor }) => (
    <div className={`relative rounded-3xl p-5 sm:p-6 shadow-2xl hover:shadow-3xl transition-all duration-500 group hover:scale-[1.03] ${bgColor} border-2 border-white/20 dark:border-white/10 backdrop-blur-xl h-full flex flex-col`}>
      {/* Decorative top border */}
      <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-3xl bg-gradient-to-r ${iconColor}`}></div>
      
      <div className="flex flex-col items-center gap-3 mb-4 text-center">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${iconColor} shadow-lg flex-shrink-0 ring-2 ring-white/20`}>
          {React.cloneElement(icon, { size: 24 })}
        </div>
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100 mb-1">{title}</h3>
          <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/80 dark:bg-white/10 border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-300 font-bold">
            {category}
          </span>
        </div>
      </div>
      
      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-4 text-center px-2 flex-grow">{description}</p>
      
      <div className="mt-auto">
        {children}
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 animate-[fadeIn_0.5s_ease-out]">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-[var(--card-border)] shadow-lg backdrop-blur-lg mb-4">
          <SettingsIcon size={36} className="text-blue-400" strokeWidth={2.5} />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">Settings</h1>
        <p className="text-base opacity-70 max-w-md mx-auto">
          Customize your weather experience with personalized units and preferences
        </p>
      </div>

      {/* Save Indicator */}
      {showSaveIndicator && (
        <div className="fixed top-4 right-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/20 border border-green-500/30 text-green-400 shadow-lg backdrop-blur-md z-50 animate-[fadeIn_0.3s_ease-out]">
          <Check size={16} strokeWidth={2.5} />
          <span className="text-sm font-medium">Settings saved</span>
        </div>
      )}

      {/* Settings Categories */}
      <div className="flex flex-wrap justify-center gap-6">
        
        {/* TEMPERATURE CARD */}
        <div className="w-full md:w-[calc(50%-1.5rem)] lg:w-[calc(25%-1.5rem)] min-w-[280px]">
          <SettingCard
            icon={<Thermometer strokeWidth={2.5} className="text-white" />}
            iconColor="from-blue-500 to-blue-600"
            title="Temperature"
            description="Choose your preferred temperature unit"
            category="Units"
            bgColor="bg-gradient-to-br from-blue-50/90 to-blue-100/90 dark:from-blue-950/60 dark:to-blue-900/60"
          >
            <div className="grid grid-cols-2 gap-2">
              <div
                className={getToggleClass(tempUnit === 'C', 'blue')}
                onClick={() => handleSettingChange('temperature', 'C')}
              >
                <span className="font-bold">°C</span>
              </div>
              <div
                className={getToggleClass(tempUnit === 'F', 'blue')}
                onClick={() => handleSettingChange('temperature', 'F')}
              >
                <span className="font-bold">°F</span>
              </div>
            </div>
          </SettingCard>
        </div>

        {/* WIND SPEED CARD */}
        <div className="w-full md:w-[calc(50%-1.5rem)] lg:w-[calc(25%-1.5rem)] min-w-[280px]">
          <SettingCard
            icon={<Wind strokeWidth={2.5} className="text-white" />}
            iconColor="from-sky-500 to-sky-600"
            title="Wind Speed"
            description="Select wind speed measurement units"
            category="Units"
            bgColor="bg-gradient-to-br from-sky-50/90 to-sky-100/90 dark:from-sky-950/60 dark:to-sky-900/60"
          >
            <div className="grid grid-cols-2 gap-2">
              <div
                className={getToggleClass(windUnit === 'm/s', 'sky')}
                onClick={() => handleSettingChange('wind', 'm/s')}
              >
                <span className="font-bold text-sm">m/s</span>
              </div>
              <div
                className={getToggleClass(windUnit === 'km/h', 'sky')}
                onClick={() => handleSettingChange('wind', 'km/h')}
              >
                <span className="font-bold text-sm">km/h</span>
              </div>
            </div>
          </SettingCard>
        </div>

        {/* ATMOSPHERIC PRESSURE CARD */}
        <div className="w-full md:w-[calc(50%-1.5rem)] lg:w-[calc(25%-1.5rem)] min-w-[280px]">
          <SettingCard
            icon={<Gauge strokeWidth={2.5} className="text-white" />}
            iconColor="from-purple-500 to-purple-600"
            title="Pressure"
            description="Choose barometric pressure unit"
            category="Units"
            bgColor="bg-gradient-to-br from-purple-50/90 to-purple-100/90 dark:from-purple-950/60 dark:to-purple-900/60"
          >
            <div className="grid grid-cols-2 gap-2">
              <div
                className={getToggleClass(pressureUnit === 'hPa', 'purple')}
                onClick={() => handleSettingChange('pressure', 'hPa')}
              >
                <span className="font-bold text-sm">hPa</span>
              </div>
              <div
                className={getToggleClass(pressureUnit === 'atm', 'purple')}
                onClick={() => handleSettingChange('pressure', 'atm')}
              >
                <span className="font-bold text-sm">atm</span>
              </div>
            </div>
          </SettingCard>
        </div>
      </div>

      {/* Reset Section */}
      <div className="mt-6 sm:mt-8 p-4 sm:p-6 rounded-2xl border border-red-500/20 bg-red-500/5 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-3">
          <Info size={window.innerWidth < 640 ? 18 : 20} className="text-red-400 flex-shrink-0" strokeWidth={2} />
          <h3 className="text-base sm:text-lg font-semibold">Reset Settings</h3>
        </div>
        <p className="text-xs sm:text-sm opacity-70 mb-4">
          Restore all settings to their default values. This action cannot be undone.
        </p>
        <button 
          className="w-full sm:w-auto flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl font-medium text-sm transition-all duration-300 bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white hover:border-red-500"
          onClick={resetToDefault}
        >
          <RotateCcw size={16} strokeWidth={2.5} /> 
          Reset to Default Settings
        </button>
      </div>

      {/* Footer Info */}
      <div className="mt-8 text-center text-xs opacity-50">
        <p>Settings are automatically saved and applied immediately</p>
      </div>
    </div>
  );
};

export default Settings;
