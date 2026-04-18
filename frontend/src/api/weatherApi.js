import axios from 'axios';

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

export const getWeatherByLocation = async (lat, lon) => {
    const response = await axios.get(`${BASE_URL}/weather`, {
        params: {
            lat,
            lon,
            appid: API_KEY,
            units: 'metric'
        }
    });
    return response.data;
};

export const getWeatherByCity = async (city) => {
    const response = await axios.get(`${BASE_URL}/weather`, {
        params: {
            q: city,
            appid: API_KEY,
            units: 'metric'
        }
    });
    return response.data;
};

export const getForecastByLocation = async (lat, lon) => {
    const response = await axios.get(`${BASE_URL}/forecast`, {
        params: {
            lat,
            lon,
            appid: API_KEY,
            units: 'metric'
        }
    });
    return response.data;
};

export const getForecastByCity = async (city) => {
    const response = await axios.get(`${BASE_URL}/forecast`, {
        params: {
            q: city,
            appid: API_KEY,
            units: 'metric'
        }
    });
    return response.data;
};

// Returns AQI index 1–5 from OpenWeatherMap Air Pollution API
export const getAqiByCoords = async (lat, lon) => {
    const response = await axios.get(`${BASE_URL}/air_pollution`, {
        params: { lat, lon, appid: API_KEY }
    });
    // aqi: 1=Good, 2=Fair, 3=Moderate, 4=Poor, 5=Very Poor
    return response.data.list[0].main.aqi;
};
