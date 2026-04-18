import axios from 'axios';

const backendApi = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api',
    timeout: 30000, // 30s - Atlas free tier takes a long time to wake up
});

export const getSavedCities = async () => {
    const response = await backendApi.get('/cities');
    return response.data;
};

export const saveCity = async (cityData) => {
    const response = await backendApi.post('/cities', cityData);
    return response.data;
};

export const deleteCity = async (id) => {
    const response = await backendApi.delete(`/cities/${id}`);
    return response.data;
};

export default backendApi;
