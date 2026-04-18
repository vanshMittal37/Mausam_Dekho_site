import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sun, Moon, CloudSun, Settings, Menu, X } from 'lucide-react';

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

  // Colors & Styles based on theme
  const isLight = theme === 'light';

  const navContainerClass = `fixed top-0 left-0 right-0 w-full z-[999] transition-all duration-300 backdrop-blur-md ` +
    (isLight
      ? `bg-white/85 border-b border-slate-200/60 ${scrolled ? 'shadow-md shadow-slate-200/50 bg-white/95' : ''}`
      : `bg-slate-900/85 border-b border-slate-700/50 ${scrolled ? 'shadow-lg shadow-black/40 bg-slate-900/95' : ''}`);

  const brandTextClass = isLight ? 'text-slate-900' : 'text-slate-100';
  const brandAccentClass = isLight ? 'text-blue-600' : 'text-sky-400';

  const getLinkClass = (path) => {
    const active = isActive(path);
    const base = 'relative flex flex-col items-center px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200';
    if (active) {
      return isLight
        ? `${base} text-blue-700 bg-blue-50/80`
        : `${base} text-sky-400 bg-sky-400/10`;
    }
    return isLight
      ? `${base} text-slate-600 hover:text-slate-900 hover:bg-slate-100/70`
      : `${base} text-slate-300 hover:text-white hover:bg-white/10`;
  };

  const getActionBtnClass = (active = false) => {
    const base = 'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300';
    if (active) {
      return isLight
        ? `${base} text-blue-700 bg-blue-50/80`
        : `${base} text-sky-400 bg-sky-400/10`;
    }
    return isLight
      ? `${base} text-slate-600 hover:text-slate-900 hover:bg-slate-100/70`
      : `${base} text-slate-300 hover:text-white hover:bg-white/10`;
  };

  const getDrawerLinkClass = (path) => {
    const active = isActive(path);
    const base = 'flex items-center px-4 py-3 rounded-xl text-base font-semibold transition-all duration-200';
    if (active) {
      return isLight
        ? `${base} text-blue-700 bg-blue-50`
        : `${base} text-sky-400 bg-sky-400/10`;
    }
    return isLight
      ? `${base} text-slate-600 hover:text-slate-900 hover:bg-slate-50`
      : `${base} text-slate-300 hover:text-white hover:bg-white/5`;
  };

  const drawerClass = `md:hidden overflow-hidden transition-all duration-300 ease-in-out border-t ` +
    (isOpen ? 'max-h-[400px] opacity-100 ' : 'max-h-0 opacity-0 ') +
    (isLight ? 'border-slate-200/80 bg-white/95' : 'border-slate-800/80 bg-slate-900/95') + 
    ` backdrop-blur-lg shadow-xl`;

  return (
    <header className={navContainerClass}>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[68px] flex items-center justify-between gap-4">

        {/* ── BRAND ── */}
        <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 text-white shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform duration-300">
            <CloudSun size={24} strokeWidth={2.5} />
          </div>
          <span className={`text-xl sm:text-2xl font-bold tracking-tight ${brandTextClass} transition-colors`}>
            Mausam <span className={brandAccentClass}>Dekho</span>
          </span>
        </Link>

        {/* ── DESKTOP NAV LINKS ── */}
        <nav className="hidden md:flex items-center gap-1.5" aria-label="Main navigation">
          {NAV_LINKS.map(({ name, path }) => (
            <Link key={path} to={path} className={getLinkClass(path)}>
              {name}
              {isActive(path) && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-3/5 h-[3px] rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 shadow-sm" />
              )}
            </Link>
          ))}
        </nav>

        {/* ── DESKTOP ACTIONS & MOBILE TOGGLE ── */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="hidden sm:flex items-center gap-2">
            <Link
              to="/settings"
              className={getActionBtnClass(isActive('/settings'))}
              title="Settings"
            >
              <Settings size={18} strokeWidth={2.5} className={isActive('/settings') ? 'animate-[spin_4s_linear_infinite]' : 'transition-transform hover:rotate-45'} />
              <span className="hidden lg:inline-block">Settings</span>
            </Link>

            <button
              onClick={toggleTheme}
              className={getActionBtnClass()}
              title={`Switch to ${isLight ? 'Dark' : 'Light'} Mode`}
            >
              {isLight
                ? <Moon size={18} strokeWidth={2.5} className="text-slate-600 hover:text-indigo-600 transition-colors" />
                : <Sun size={18} strokeWidth={2.5} className="text-amber-400 hover:text-amber-300 transition-colors" />
              }
              <span className="hidden lg:inline-block">Theme</span>
            </button>
          </div>

          {/* Hamburger — mobile / small tablet only */}
          <button
            className={`md:hidden flex items-center justify-center w-10 h-10 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
              isLight ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
            onClick={() => setIsOpen(o => !o)}
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isOpen}
          >
            {isOpen ? <X size={22} strokeWidth={2.5} /> : <Menu size={22} strokeWidth={2.5} />}
          </button>
        </div>
      </div>

      {/* ── MOBILE DRAWER ── */}
      <div className={drawerClass} aria-hidden={!isOpen}>
        <div className="px-5 pt-4 pb-6 flex flex-col gap-2">
          {NAV_LINKS.map(({ name, path }) => (
            <Link key={path} to={path} className={getDrawerLinkClass(path)}>
              {name}
            </Link>
          ))}

          <div className={`mt-3 border-t pt-3 flex flex-col gap-2 ${isLight ? 'border-slate-200' : 'border-slate-700/50'}`}>
            <Link to="/settings" className={getDrawerLinkClass('/settings')}>
              <Settings size={20} strokeWidth={2.5} className="mr-3 opacity-80" /> Settings
            </Link>
            <button
              onClick={toggleTheme}
              className={`flex items-center w-full px-4 py-3 rounded-xl text-base font-semibold transition-colors ${
                isLight
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              {isLight ? (
                <><Moon size={20} strokeWidth={2.5} className="mr-3 opacity-80" /> Dark Mode</>
              ) : (
                <><Sun size={20} strokeWidth={2.5} className="mr-3 opacity-80" /> Light Mode</>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
