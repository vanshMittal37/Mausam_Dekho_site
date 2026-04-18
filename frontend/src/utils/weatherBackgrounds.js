// Dynamic background based on weather condition + temperature
export const getWeatherTheme = (weatherMain, temp, isNight = false) => {
  if (!weatherMain) return themes.default;

  const main = (weatherMain || '').toLowerCase();

  // ── NIGHT: distinct background per weather condition ──
  if (isNight) {
    if (main.includes('thunderstorm'))                                return themes.night_thunderstorm;
    if (main.includes('rain') || main.includes('drizzle'))           return themes.night_rain;
    if (main.includes('snow'))                                        return themes.night_snow;
    if (main.includes('mist') || main.includes('fog') || main.includes('haze')) return themes.night_mist;
    if (main.includes('cloud'))                                       return themes.night_cloudy;
    // Clear night — temperature tinted
    if (temp !== null && temp !== undefined) {
      if (temp > 28) return themes.night_hot;
      if (temp >= 18) return themes.night_warm;
      return themes.night_cold;
    }
    return themes.night; // generic clear night
  }

  // ── DAY ──
  if (main.includes('thunderstorm')) return themes.thunderstorm;
  if (main.includes('rain') || main.includes('drizzle')) return themes.rain;
  if (main.includes('snow')) return themes.snow;
  if (main.includes('mist') || main.includes('fog') || main.includes('haze')) return themes.mist;
  if (main.includes('cloud')) return themes.cloudy;

  // Temperature based (clear or unknown)
  if (temp !== null && temp !== undefined) {
    if (temp > 30) return themes.hot;
    if (temp >= 20) return themes.warm;
    return themes.cold;
  }

  return themes.clear;
};

export const isNightTime = (dt, timezone) => {
  if (!dt) return false;
  const utcNow = dt + timezone;
  const hour = new Date(utcNow * 1000).getUTCHours();
  return hour >= 20 || hour < 6;
};

const themes = {
  // ─── DAY THEMES ─────────────────────────────────────────────
  default: {
    gradient: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
    bgClass: 'weather-default',
    accent: '#60a5fa',
  },
  hot: {
    gradient: 'linear-gradient(135deg, #f83600 0%, #f9d423 100%)',
    bgClass: 'weather-hot',
    accent: '#fbbf24',
  },
  warm: {
    gradient: 'linear-gradient(135deg, #1fa2ff 0%, #12d8fa 50%, #a6ffcb 100%)',
    bgClass: 'weather-warm',
    accent: '#12d8fa',
  },
  cold: {
    gradient: 'linear-gradient(135deg, #614385 0%, #516395 100%)',
    bgClass: 'weather-cold',
    accent: '#c4b5fd',
  },
  rain: {
    gradient: 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)',
    bgClass: 'weather-rain',
    accent: '#60a5fa',
  },
  thunderstorm: {
    gradient: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
    bgClass: 'weather-thunderstorm',
    accent: '#a78bfa',
  },
  snow: {
    gradient: 'linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)',
    bgClass: 'weather-snow',
    accent: '#93c5fd',
  },
  mist: {
    gradient: 'linear-gradient(135deg, #606c88 0%, #3f4c6b 100%)',
    bgClass: 'weather-mist',
    accent: '#cbd5e1',
  },
  cloudy: {
    gradient: 'linear-gradient(135deg, #757f9a 0%, #d7dde8 100%)',
    bgClass: 'weather-cloudy',
    accent: '#93c5fd',
  },
  clear: {
    gradient: 'linear-gradient(135deg, #f8c200 0%, #f36921 100%)',
    bgClass: 'weather-clear',
    accent: '#fbbf24',
  },

  // ─── NIGHT THEMES ───────────────────────────────────────────
  // Generic clear night
  night: {
    gradient: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
    bgClass: 'weather-night',
    accent: '#818cf8',
  },
  // Clear night — hot (still dark but warm deep blue-purple)
  night_hot: {
    gradient: 'linear-gradient(135deg, #1a0533 0%, #4a0e6e 50%, #7c2d12 100%)',
    bgClass: 'weather-night-hot',
    accent: '#f97316',
  },
  // Clear night — warm
  night_warm: {
    gradient: 'linear-gradient(135deg, #0a0a2e 0%, #1e1b4b 50%, #312e81 100%)',
    bgClass: 'weather-night-warm',
    accent: '#818cf8',
  },
  // Clear night — cold
  night_cold: {
    gradient: 'linear-gradient(135deg, #0c1445 0%, #1a237e 50%, #283593 100%)',
    bgClass: 'weather-night-cold',
    accent: '#93c5fd',
  },
  // Night rain — dark teal / steel blue
  night_rain: {
    gradient: 'linear-gradient(135deg, #0d1b2a 0%, #1b3a4b 50%, #1e4d6b 100%)',
    bgClass: 'weather-night-rain',
    accent: '#38bdf8',
  },
  // Night thunderstorm — near-black deep purple with electric hint
  night_thunderstorm: {
    gradient: 'linear-gradient(135deg, #07050f 0%, #1a1040 50%, #2d1b69 100%)',
    bgClass: 'weather-night-thunderstorm',
    accent: '#c4b5fd',
  },
  // Night snow — muted lavender / slate
  night_snow: {
    gradient: 'linear-gradient(135deg, #1a1f4b 0%, #2d3561 50%, #3d4a7a 100%)',
    bgClass: 'weather-night-snow',
    accent: '#e0e7ff',
  },
  // Night mist/haze/fog — smoky dark slate
  night_mist: {
    gradient: 'linear-gradient(135deg, #1a1f2e 0%, #2d3142 50%, #3c4260 100%)',
    bgClass: 'weather-night-mist',
    accent: '#94a3b8',
  },
  // Night cloudy — dark charcoal with cool blue tint
  night_cloudy: {
    gradient: 'linear-gradient(135deg, #111827 0%, #1e2535 50%, #263044 100%)',
    bgClass: 'weather-night-cloudy',
    accent: '#64748b',
  },
};
