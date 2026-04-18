import React from 'react';
import { Zap, Shield, Code, CloudRain, Database, Globe } from 'lucide-react';
import './About.css';

const About = () => {
  return (
    <div className="about-page fade-in">

      {/* ── HERO ── */}
      <div className="about-hero glass">
        <CloudRain size={56} className="about-hero-icon" />
        <h2>Mausam Dekho</h2>
        <p>A full-stack weather application built with React, Node.js, Express, and MongoDB.</p>
      </div>

      {/* ── FEATURE CARDS ── */}
      <div className="feature-grid">
        {[
          { icon: <Zap size={32} />, title: 'Lightning Fast', desc: 'Powered by Vite + React 18 for instant page loads and blazing-fast performance.' },
          { icon: <Shield size={32} />, title: 'Reliable Backend', desc: 'Node.js + Express REST API with MongoDB Atlas for persistent, scalable data storage.' },
          { icon: <Globe size={32} />, title: 'Live Weather Data', desc: 'Real-time weather powered by the OpenWeatherMap API with location detection.' },
        ].map(({ icon, title, desc }) => (
          <div key={title} className="feature-card glass">
            <div className="feature-icon">{icon}</div>
            <h3>{title}</h3>
            <p>{desc}</p>
          </div>
        ))}
      </div>

      {/* ── TECH STACK ── */}
      <div className="tech-section glass">
        <h3>Tech Stack</h3>
        <div className="tech-grid">
          {[
            { icon: '⚛️', name: 'React 18', role: 'Frontend Framework' },
            { icon: '⚡', name: 'Vite', role: 'Build Tool' },
            { icon: '🟢', name: 'Node.js', role: 'Backend Runtime' },
            { icon: '🚂', name: 'Express', role: 'REST API Server' },
            { icon: '🍃', name: 'MongoDB', role: 'Database' },
            { icon: '🌤️', name: 'OpenWeather', role: 'Weather API' },
          ].map(({ icon, name, role }) => (
            <div key={name} className="tech-card">
              <span className="tech-icon">{icon}</span>
              <strong>{name}</strong>
              <span className="tech-role">{role}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default About;
