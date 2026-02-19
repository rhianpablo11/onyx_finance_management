import axios from 'axios';
import { getToken, removeToken, setToken } from './tokenService';

const apiUrl = import.meta.env.VITE_API_URL;

export const api = axios.create({
    baseURL: apiUrl, 
    timeout: 1000000, 
    withCredentials: true
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
    async (error) => {
        const originalRequest = error.config;
        console.log("original "+originalRequest)
        if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/user/refresh')) {
            // Token expirou ou é inválido
            originalRequest._retry = true

            try{
                const {data} = await api.post('/user/refresh')
                const newToken = data
                console.log('tok novo ' + newToken)
                setToken(newToken)
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return api(originalRequest)
            } catch(refreshError){
                removeToken()
                //window.location.href = '/login'
                console.log('erro 44 '+ refreshError)
                return Promise.reject(refreshError)
            }

        }
        return Promise.reject(error);
    }
);