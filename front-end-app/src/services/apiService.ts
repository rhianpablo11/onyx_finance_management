import axios from 'axios';
import { getToken, removeToken } from './tokenService';

const apiUrl = import.meta.env.VITE_API_URL;

export const api = axios.create({
    baseURL: apiUrl, 
    timeout: 1000000, 
});

api.interceptors.request.use((config) => {
    const token = getToken();

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
}, (error) => {
    return Promise.reject(error);
});


api.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            // Token expirou ou é inválido
            removeToken()
            // Opcional: Redirecionar para login
            // window.location.href = '/login'; 
        }
        return Promise.reject(error);
    }
);