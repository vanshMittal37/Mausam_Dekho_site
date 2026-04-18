import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ParticlesOverlay from './components/ParticlesOverlay';
import Home from './pages/Home';
import CityDetails from './pages/CityDetails';
import SavedCities from './pages/SavedCities';
import About from './pages/About';
import Settings from './pages/Settings';
import { SettingsProvider } from './context/SettingsContext';
import './index.css';

function App() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [bgClass, setBgClass] = useState('weather-default');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  return (
    <SettingsProvider>
      <Router>
        {/* 1. Full screen animated gradient background */}
        <div className={`weather-bg ${bgClass}`}></div>

        {/* 2. Theme overlay — light = white tint, dark = dark tint */}
        <div className="theme-overlay"></div>

        {/* 3. Particle effects (rain / snow / stars / clouds) */}
        <ParticlesOverlay bgClass={bgClass} />

        <div className="app-container">
          <Navbar theme={theme} toggleTheme={toggleTheme} />
          <main className="main-content container">
            <Routes>
              <Route path="/"               element={<Home setBgClass={setBgClass} />} />
              <Route path="/city/:cityName" element={<CityDetails setBgClass={setBgClass} />} />
              <Route path="/saved"          element={<SavedCities setBgClass={setBgClass} />} />
              <Route path="/about"          element={<About />} />
              <Route path="/settings"       element={<Settings />} />
            </Routes>
          </main>
        </div>
      </Router>
    </SettingsProvider>
  );
}

export default App;
