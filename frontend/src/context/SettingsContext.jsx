import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
  // Load initial from localStorage or fall back to defaults
  const loadState = (key, defaultVal) => localStorage.getItem(key) || defaultVal;

  const [tempUnit, setTempUnit] = useState(loadState('tempUnit', 'C'));
  const [windUnit, setWindUnit] = useState(loadState('windUnit', 'm/s'));
  const [pressureUnit, setPressureUnit] = useState(loadState('pressureUnit', 'hPa'));

  useEffect(() => {
    localStorage.setItem('tempUnit', tempUnit);
    localStorage.setItem('windUnit', windUnit);
    localStorage.setItem('pressureUnit', pressureUnit);
  }, [tempUnit, windUnit, pressureUnit]);

  const resetToDefault = () => {
    setTempUnit('C');
    setWindUnit('m/s');
    setPressureUnit('hPa');
  };

  // ----- CONVERSION HELPERS -----

  // Temperature comes in as Celsius from OpenWeatherMap ('metric' param)
  const formatTemp = (celsiusTemp) => {
    if (tempUnit === 'F') {
      const f = (celsiusTemp * 9) / 5 + 32;
      return `${Math.round(f)}°F`;
    }
    return `${Math.round(celsiusTemp)}°C`;
  };

  const getRawTemp = (celsiusTemp) => {
    if (tempUnit === 'F') {
      return Math.round((celsiusTemp * 9) / 5 + 32);
    }
    return Math.round(celsiusTemp);
  };

  // Wind speed comes in as m/s from OpenWeatherMap ('metric' param)
  const formatWind = (metersPerSec) => {
    if (windUnit === 'km/h') {
      const kmh = metersPerSec * 3.6;
      return `${Math.round(kmh)} km/h`;
    }
    return `${Math.round(metersPerSec)} m/s`;
  };

  // Pressure comes in as hPa
  const formatPressure = (hpa) => {
    if (pressureUnit === 'atm') {
      const atm = hpa / 1013.25;
      return `${atm.toFixed(3)} atm`;
    }
    return `${Math.round(hpa)} hPa`;
  };

  return (
    <SettingsContext.Provider
      value={{
        tempUnit, setTempUnit,
        windUnit, setWindUnit,
        pressureUnit, setPressureUnit,
        resetToDefault,
        formatTemp,
        getRawTemp,
        formatWind,
        formatPressure
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};
