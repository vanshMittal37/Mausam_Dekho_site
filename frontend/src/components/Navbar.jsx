import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sun, Moon, CloudSun, Settings, Menu, X } from 'lucide-react';
import './Navbar.css';

const Navbar = ({ theme, toggleTheme }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setIsOpen(false); }, [location.pathname]);

  const NAV_LINKS = [
    { name: 'Home',  path: '/' },
    { name: 'Saved', path: '/saved' },
    { name: 'About', path: '/about' },
  ];

  return (
    <header className={`mausam-nav${scrolled ? ' mausam-nav--scrolled' : ''}`}>
      <div className="mausam-nav__inner">

        {/* ── BRAND ── */}
        <Link to="/" className="mausam-nav__brand">
          <span className="mausam-nav__brand-icon">
            <CloudSun size={28} strokeWidth={2} />
          </span>
          <span className="mausam-nav__brand-name">
            Mausam <span className="mausam-nav__brand-accent">Dekho</span>
          </span>
        </Link>

        {/* ── DESKTOP NAV LINKS ── */}
        <nav className="mausam-nav__links" aria-label="Main navigation">
          {NAV_LINKS.map(({ name, path }) => (
            <Link
              key={path}
              to={path}
              className={`mausam-nav__link${isActive(path) ? ' mausam-nav__link--active' : ''}`}
            >
              {name}
              <span className="mausam-nav__link-indicator" />
            </Link>
          ))}
        </nav>

        {/* ── DESKTOP ACTIONS ── */}
        <div className="mausam-nav__actions">
          <Link
            to="/settings"
            className={`mausam-nav__action-btn${isActive('/settings') ? ' mausam-nav__action-btn--active' : ''}`}
            title="Settings"
          >
            <Settings size={18} strokeWidth={2} className={`mausam-nav__action-icon${isActive('/settings') ? ' mausam-nav__action-icon--spin' : ''}`} />
            <span className="mausam-nav__action-label">Settings</span>
          </Link>

          <button
            onClick={toggleTheme}
            className="mausam-nav__action-btn"
            title="Toggle theme"
          >
            {theme === 'light'
              ? <Moon size={18} strokeWidth={2} className="mausam-nav__action-icon" />
              : <Sun  size={18} strokeWidth={2} className="mausam-nav__action-icon" />
            }
            <span className="mausam-nav__action-label">Theme</span>
          </button>

          {/* Hamburger — mobile only */}
          <button
            className="mausam-nav__hamburger"
            onClick={() => setIsOpen(o => !o)}
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isOpen}
          >
            {isOpen ? <X size={22} strokeWidth={2.5} /> : <Menu size={22} strokeWidth={2.5} />}
          </button>
        </div>
      </div>

      {/* ── MOBILE DRAWER ── */}
      <div className={`mausam-nav__drawer${isOpen ? ' mausam-nav__drawer--open' : ''}`} aria-hidden={!isOpen}>
        <nav className="mausam-nav__drawer-links">
          {NAV_LINKS.map(({ name, path }) => (
            <Link
              key={path}
              to={path}
              className={`mausam-nav__drawer-link${isActive(path) ? ' mausam-nav__drawer-link--active' : ''}`}
            >
              {name}
            </Link>
          ))}
        </nav>
        <div className="mausam-nav__drawer-actions">
          <Link
            to="/settings"
            className={`mausam-nav__drawer-action${isActive('/settings') ? ' mausam-nav__drawer-action--active' : ''}`}
          >
            <Settings size={17} strokeWidth={2} /> Settings
          </Link>
          <button onClick={toggleTheme} className="mausam-nav__drawer-action">
            {theme === 'light' ? <Moon size={17} strokeWidth={2} /> : <Sun size={17} strokeWidth={2} />}
            {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
