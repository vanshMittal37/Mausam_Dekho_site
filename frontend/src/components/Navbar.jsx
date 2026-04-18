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
    { name: 'Saved', path: '/saved', icon: Bookmark },
    { name: 'About', path: '/about', icon: Info },
  ];

  // Colors & Styles based on theme
  const isLight = theme === 'light';

  // Header background colors
  const defaultBg = isLight ? 'bg-white/85' : 'bg-slate-900/85';
  const scrolledBg = isLight ? 'bg-white/95 shadow-md shadow-slate-200/50' : 'bg-slate-900/95 shadow-xl shadow-black/50';
  const borderColor = isLight ? 'border-slate-200/60' : 'border-slate-800/80';

  const navContainerClass = `fixed top-0 left-0 right-0 w-full z-[999] transition-all duration-300 backdrop-blur-md border-b ${borderColor} ${scrolled ? scrolledBg : defaultBg}`;

  const brandTextClass = isLight ? 'text-slate-900' : 'text-slate-100';
  const brandAccentClass = isLight ? 'text-blue-600' : 'text-sky-400';

  const getLinkClass = (path) => {
    const active = isActive(path);
    const base = 'relative flex flex-col items-center px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 gap-1';
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
    const base = 'flex items-center gap-3.5 px-4 py-3 rounded-xl text-[16px] font-semibold transition-all duration-300 group';
    if (active) {
      return isLight 
        ? `${base} text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/20` 
        : `${base} text-white bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg shadow-blue-500/20`;
    }
    return isLight
      ? `${base} text-slate-600 hover:text-slate-900 hover:bg-slate-100`
      : `${base} text-slate-300 hover:text-white hover:bg-white/5`;
  };

  return (
    <header className={navContainerClass}>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[68px] flex items-center justify-between gap-4 relative z-10">

        {/* ── HAMBURGER — toggle for drawer ── */}
        <button
          className={`md:hidden flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 focus:outline-none relative z-[1001] ${
            isLight ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
          }`}
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isOpen}
        >
          {isOpen ? <X size={22} strokeWidth={2.5} /> : <Menu size={22} strokeWidth={2.5} />}
        </button>

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
        <nav className="hidden md:flex items-center gap-2" aria-label="Main navigation">
          {NAV_LINKS.map(({ name, path }) => (
            <Link key={path} to={path} className={getLinkClass(path)}>
              {name}
              {isActive(path) && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-3/5 h-[2.5px] rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 shadow-sm" />
              )}
            </Link>
          ))}
        </nav>

        {/* ── DESKTOP ACTIONS ── */}
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
          <div className="md:hidden w-10" /> {/* Spacer for symmetry on mobile */}
        </div>
      </div>

      {/* ── MOBILE DRAWER OVERLAY ── */}
      <div 
        className={`md:hidden fixed inset-0 top-[68px] w-full h-[calc(100vh-68px)] bg-black/40 backdrop-blur-sm transition-opacity duration-300 ease-in-out z-[998] ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* ── MOBILE DRAWER PANEL (Slides from Left below Navbar) ── */}
      <div 
        className={`md:hidden fixed top-[68px] left-0 h-[calc(100vh-68px)] w-[80%] max-w-[300px] flex flex-col shadow-2xl transition-transform duration-300 ease-in-out z-[999] border-r ${
          isLight 
            ? 'bg-white border-slate-200' 
            : 'bg-[#0f172a] border-slate-800'
        } backdrop-blur-xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex-1 p-4 overflow-y-auto flex flex-col">
          {/* Main Menu Section */}
          <div className="flex flex-col gap-3">
            <span className="mt-4 px-4 py-1 text-[10px] font-bold uppercase tracking-widest opacity-50">
              Navigation
            </span>
            <div className="flex flex-col gap-1.5 px-1">
              {NAV_LINKS.map(({ name, path, icon: Icon }) => (
                <Link key={path} to={path} className={getDrawerLinkClass(path)}>
                  <Icon size={20} className="flex-shrink-0" />
                  <span>{name}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Configuration Section */}
          <div className="flex flex-col gap-3 mt-4">
            <span className="px-4 py-1 text-[10px] font-bold uppercase tracking-widest opacity-50">
              Configuration
            </span>
            <div className="flex flex-col gap-1.5 px-1">
              <Link to="/settings" className={getDrawerLinkClass('/settings')}>
                <Settings size={20} className="flex-shrink-0" />
                <span>Settings</span>
              </Link>
              
              <div className="px-2 mt-2">
                <button
                  onClick={toggleTheme}
                  className={`flex items-center justify-between w-full py-3 px-4 rounded-xl text-sm font-bold transition-all duration-300 ${
                    isLight
                      ? 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-100'
                      : 'bg-white/5 text-slate-200 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {isLight ? <Moon size={16} /> : <Sun size={16} />}
                    <span>{isLight ? 'Dark Mode' : 'Light Mode'}</span>
                  </div>
                  <div className={`w-8 h-5 rounded-full transition-colors flex items-center px-1 ${isLight ? 'bg-slate-300' : 'bg-blue-600'}`}>
                    <div className={`w-3 h-3 rounded-full bg-white transition-transform duration-300 ${
                      isLight ? 'translate-x-0' : 'translate-x-3'
                    }`} />
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-auto pt-6 pb-4 border-t border-white/5">
             <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-20 text-center">
               Vansh Mittal • v1.2.5
             </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
