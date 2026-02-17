import { useState } from "react";
import type { loginCredentials, LoginResponse } from "../interfaces/interfacesHooks";
import { api } from "../services/apiService";
import { setToken } from "../services/tokenService";
import { getCookie, removeCookie, setCookie, setLongCookie } from "../services/cookiesService";
import { getDeviceId } from "../utils/utils";



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
            setLongCookie('user_email', response.data.user_data.email)

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

    const existBiometricInDevice = async () =>{
        try{
            const dataSend = {
                'idDevice': getDeviceId()
            }
            const response = await api.post('/user/has-biometric', dataSend)
            if(response.data.exists_biometric){
                setLongCookie('this_device_has_biometric', 'true')
                return true
            } else{
                setLongCookie('this_device_has_biometric', 'false')
                return false
            }
        } catch (err: any) {
            return false
            throw err
        }
    }

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
                setLongCookie('this_device_has_biometric', 'true')
                return true
            } else{
                return false
            }
        } catch (err: any){
            throw err
        }
    }


    const getOptionsLogin = async () =>{
        try{
            const emailUser = getCookie('user_email')
            if(emailUser){
                const dataToSend = {'email': emailUser}
                const response = await api.post('/user/login/options-biometric', dataToSend)
                return response.data
            } else{
                throw new Error("Email do usuário não encontrado nos cookies.")
            }
            
        } catch(err: any){
            throw err
        }
    }


    const verifyBiometric = async ( authResp: any) => {
        try{
            const emailUser = getCookie('user_email')
            if(emailUser){
                const dataToSend = {
                    'email': emailUser,
                    'credential': authResp
                }
                const response = await api.post('/user/login/verify-biometric', dataToSend)
                if(response.data.access_token){
                    setToken(response.data.access_token)
                    setCookie('user_name', response.data.user_data.name)
                }
            } else{
                throw new Error("Email do usuário não encontrado nos cookies.")
            }
        } catch (err: any){
            throw err
        }
    }


    const removeBiometricOfDevice = async () =>{
        try{
            
            const dataToSend = {'deviceId': getDeviceId()}
            const response = await api.post('/user/biometric/delete', dataToSend)
            if(response.status = 201){
                setLongCookie('this_device_has_biometric', 'false')
                removeCookie('user_email')
            }
            return response.data
            
        } catch(err: any){
            throw err
        }
    }


    return {getOptions, registerBiometric, getOptionsLogin, verifyBiometric, existBiometricInDevice, removeBiometricOfDevice}
}