import React from 'react';

const PARTICLE_COUNTS = {
  'weather-rain': 60,
  'weather-thunderstorm': 80,
  'weather-snow': 40,
  'weather-night': 80,
  'weather-cloudy': 6,
  'weather-mist': 6,
};

const ParticlesOverlay = ({ bgClass }) => {
  const getParticles = () => {
    if (!bgClass) return null;

    if (bgClass.includes('rain') || bgClass.includes('thunderstorm')) {
      const count = bgClass.includes('thunderstorm') ? 80 : 60;
      return Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rain-drop"
          style={{
            left: `${Math.random() * 100}%`,
            height: `${Math.random() * 40 + 20}px`,
            animationDuration: `${Math.random() * 0.5 + 0.5}s`,
            animationDelay: `${Math.random() * 2}s`,
            opacity: Math.random() * 0.5 + 0.3,
          }}
        />
      ));
    }

    if (bgClass.includes('snow')) {
      return Array.from({ length: 40 }).map((_, i) => (
        <div
          key={i}
          className="snow-flake"
          style={{
            left: `${Math.random() * 100}%`,
            animationDuration: `${Math.random() * 4 + 4}s`,
            animationDelay: `${Math.random() * 6}s`,
            width: `${Math.random() * 6 + 4}px`,
            height: `${Math.random() * 6 + 4}px`,
            opacity: Math.random() * 0.6 + 0.4,
          }}
        />
      ));
    }

    if (bgClass.includes('cloudy') || bgClass.includes('mist')) {
      return Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="cloud-particle"
          style={{
            top: `${Math.random() * 70}%`,
            width: `${Math.random() * 300 + 150}px`,
            height: `${Math.random() * 80 + 40}px`,
            animationDuration: `${Math.random() * 30 + 30}s`,
            animationDelay: `${Math.random() * 15}s`,
          }}
        />
      ));
    }

    // Only show stars on CLEAR nights (generic night, hot, warm, cold)
    if (bgClass === 'weather-night' || bgClass.includes('night-hot') || bgClass.includes('night-warm') || bgClass.includes('night-cold')) {
      return Array.from({ length: 80 }).map((_, i) => (
        <div
          key={i}
          className="star"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 80}%`,
            animationDuration: `${Math.random() * 3 + 2}s`,
            animationDelay: `${Math.random() * 4}s`,
            width: `${Math.random() * 2 + 1}px`,
            height: `${Math.random() * 2 + 1}px`,
          }}
        />
      ));
    }

    return null;
  };

  return <div className="particles-overlay">{getParticles()}</div>;
};

export default ParticlesOverlay;
