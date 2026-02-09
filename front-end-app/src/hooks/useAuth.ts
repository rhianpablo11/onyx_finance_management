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

export function useBiometricAuth(){

    const getOptions = async () =>{
        try{
            const response = await api.get('/user/register/options-biometric')
            console.log(response)
            return response.data
        } catch (err: any) {
            throw err
        }
    }

    const registerBiometric = async (dataToSend: any) => {
        try{
            const response = await api.post('/user/register/register-biometric', dataToSend)
            console.log(response)
            if(response.data.verified){
                return true
            } else{
                return false
            }
        } catch (err: any){
            throw err
        }
    }


    const getOptionsLogin = async (emailUser: String) =>{
        try{
            const dataToSend = {'email': emailUser}
            const response = await api.post('/user/login/options-biometric', dataToSend)
            return response.data
        } catch(err: any){
            throw err
        }
    }


    const verifyBiometric = async (emailUser: String, authResp: any) => {
        try{
            const dataToSend = {
                'email': emailUser,
                'credential': authResp
            }
            const response = await api.post('/user/login/verify-biometric', dataToSend)
            if(response.data.access_token){
                setToken(response.data.access_token)
                setCookie('user_name', response.data.user_data.name)
            }
        } catch (err: any){
            throw err
        }
    }

    return {getOptions, registerBiometric, getOptionsLogin, verifyBiometric}
}