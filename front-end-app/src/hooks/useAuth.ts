import { useState } from "react";
import type { loginCredentials, LoginResponse } from "../interfaces/interfacesHooks";
import { api } from "../services/apiService";
import { setToken } from "../services/tokenService";
import { setCookie } from "../services/cookiesService";


export function useLogin(){
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const login = async (credentials:loginCredentials)=>{
        setLoading(true)
        setError(null)
        try{
            const formData = new URLSearchParams();
            formData.append('username', credentials.email); 
            formData.append('password', credentials.password);
            const response = await api.post<LoginResponse>('user/login', formData)
            
            console.log(response)
            const {access_token} = response.data
            setToken(access_token)
            setCookie('user_name', response.data.user_data.name)
            
            return response.data
        } catch(err: any){
            const errorMessage = err.response?.data?.message || 'Erro ao realizar login. Tente novamente.';
            setError(errorMessage)
            throw err
        } finally {
            setLoading(false);
        }
    }
    return {login, loading, error}
}