import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sun, Moon, CloudSun, Settings, Menu, X, Home, Bookmark, Info } from 'lucide-react';

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

  // Prevent scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const NAV_LINKS = [
    { name: 'Home',  path: '/', icon: Home },
    { name: 'Saved Cities', path: '/saved', icon: Bookmark },
    { name: 'About', path: '/about', icon: Info },
  ];

  // Colors & Styles based on theme
  const isLight = theme === 'light';

  // Deep dark matching #0f172a
  const defaultBg = isLight ? 'bg-white/85' : 'bg-slate-900/85';
  const scrolledBg = isLight ? 'bg-white/95 shadow-md shadow-slate-200/50' : 'bg-slate-900/95 shadow-xl shadow-black/50';
  const borderColor = isLight ? 'border-slate-200/60' : 'border-slate-800/80';

  const navContainerClass = `fixed top-0 left-0 right-0 w-full z-[999] transition-all duration-300 backdrop-blur-md border-b ${borderColor} ${scrolled ? scrolledBg : defaultBg}`;

  const brandTextClass = isLight ? 'text-slate-900' : 'text-slate-100';
  const brandAccentClass = isLight ? 'text-blue-600' : 'text-sky-400';

  const getLinkClass = (path) => {
    const active = isActive(path);
    const base = 'relative flex flex-col items-center px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300';
    if (active) {
      return isLight ? `${base} text-blue-700 bg-blue-50/80` : `${base} text-sky-400 bg-sky-400/10`;
    }
    return isLight
      ? `${base} text-slate-600 hover:text-slate-900 hover:bg-slate-100/70`
      : `${base} text-slate-300 hover:text-white hover:bg-white/10`;
  };

  const getActionBtnClass = (active = false) => {
    const base = 'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-300';
    if (active) {
      return isLight ? `${base} text-blue-700 bg-blue-50/80` : `${base} text-sky-400 bg-sky-400/10`;
    }
    return isLight
      ? `${base} text-slate-600 hover:text-slate-900 hover:bg-slate-100/70`
      : `${base} text-slate-300 hover:text-white hover:bg-white/10`;
  };

  const getDrawerLinkClass = (path) => {
    const active = isActive(path);
    const base = 'flex items-center gap-4 px-5 py-3.5 rounded-xl text-lg font-semibold transition-all duration-300';
    if (active) {
      return isLight ? `${base} text-blue-700 bg-blue-100/60 shadow-sm` : `${base} text-sky-400 bg-sky-400/15 shadow-sm`;
    }
    return isLight
      ? `${base} text-slate-600 hover:text-slate-900 hover:bg-slate-100`
      : `${base} text-slate-300 hover:text-white hover:bg-slate-800/60`;
  };

  return (
    <header className={navContainerClass}>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[68px] flex items-center justify-between gap-4 relative z-10">

        {/* ── BRAND ── */}
        <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0" onClick={() => setIsOpen(false)}>
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
            <Link to="/settings" className={getActionBtnClass(isActive('/settings'))} title="Settings">
              <Settings size={18} strokeWidth={2.5} className={isActive('/settings') ? 'animate-[spin_4s_linear_infinite]' : 'transition-transform hover:rotate-45'} />
              <span className="hidden lg:inline-block">Settings</span>
            </Link>
            <button onClick={toggleTheme} className={getActionBtnClass()} title={`Switch to ${isLight ? 'Dark' : 'Light'} Mode`}>
              {isLight
                ? <Moon size={18} strokeWidth={2.5} className="text-slate-600 hover:text-indigo-600 transition-colors" />
                : <Sun size={18} strokeWidth={2.5} className="text-amber-400 hover:text-amber-300 transition-colors" />
              }
              <span className="hidden lg:inline-block">Theme</span>
            </button>
          </div>

          {/* Hamburger — mobile / tablet only */}
          <button
            className={`md:hidden flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 relative z-[1001] ${
              isLight ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
            }`}
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isOpen}
          >
            {isOpen ? <X size={24} strokeWidth={2.5} /> : <Menu size={24} strokeWidth={2.5} />}
          </button>
        </div>
      </div>

      {/* ── MOBILE DRAWER OVERLAY ── */}
      <div 
        className={`md:hidden fixed inset-0 w-[100vw] h-[100vh] bg-black/40 backdrop-blur-sm transition-opacity duration-300 ease-in-out ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* ── MOBILE DRAWER PANEL ── */}
      <div 
        className={`md:hidden fixed top-0 right-0 h-[100vh] w-[80%] max-w-[320px] flex flex-col shadow-2xl transition-transform duration-300 ease-out z-[1000] border-l ${
          isLight ? 'bg-white/95 border-slate-200' : 'bg-slate-900 border-slate-800'
        } backdrop-blur-2xl ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full px-5 pt-[88px] pb-8 overflow-y-auto">
          {/* Main Links */}
          <div className="flex flex-col gap-2.5">
            {NAV_LINKS.map(({ name, path, icon: Icon }) => (
              <Link key={path} to={path} className={getDrawerLinkClass(path)}>
                <Icon size={22} strokeWidth={2.5} className="opacity-80" /> {name}
              </Link>
            ))}
          </div>

          <div className={`mt-6 pt-6 border-t flex flex-col gap-2.5 ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
            <Link to="/settings" className={getDrawerLinkClass('/settings')}>
              <Settings size={22} strokeWidth={2.5} className="opacity-80" /> Settings
            </Link>
            
            <button
              onClick={toggleTheme}
              className={`flex items-center gap-4 w-full px-5 py-3.5 rounded-xl text-lg font-semibold transition-all duration-300 ${
                isLight
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {isLight ? (
                <><Moon size={22} strokeWidth={2.5} className="opacity-80" /> Dark Mode</>
              ) : (
                <><Sun size={22} strokeWidth={2.5} className="opacity-80" /> Light Mode</>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
