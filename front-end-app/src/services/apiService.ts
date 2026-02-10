import axios from 'axios';
import { getToken, removeToken } from './tokenService';


export const api = axios.create({
    baseURL: 'https://financialmanagementbackend-i81tfrxg.b4a.run/', 
    timeout: 1000000, 
});

api.interceptors.request.use((config) => {
    const token = getToken();

    if (token) {
        // Injeta o token no cabeçalho
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