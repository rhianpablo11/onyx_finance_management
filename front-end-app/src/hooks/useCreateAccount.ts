import { useState } from "react";
import { api } from "../services/apiService";
import { setToken } from "../services/tokenService";
import { setCookie } from "../services/cookiesService";


export function useCreateAccount(){
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>('')

    const verifyUser = async (email: string, telephone: string, name: string) => {
        setLoading(true)
        setError(null)
        try{
            const response = await api.get(`/user/verify-user?email=${email}&name=${name}&telephone=${telephone}`)
            console.log(response.data)
            return response.data
        } catch(err: any){
            console.log('passei aq')
            console.log(err.response.data.detail)
            setError(err.response.data.detail)
            throw err
        } finally{
            setLoading(false)
        }
    }

    const verifyOtpCode = async (email: string, otpCode: string) => {
        setLoading(true)
        setError(null)
        try{
            const payload = {
                'email': email,
                'otpCode': Number(otpCode)
            }
            console.log('kasgnso')
            const response = await api.post('/user/register/verify-otp', payload)
            console.log('kasgnso')
            console.log(response)
            if(response.status == 200){
                return true
            }
            return false
        } catch (err: any) {
            setError(err)
            return
        } finally{
            setLoading(false)
        }
    }


    const requestNewOtpCode = async (email: string, name: string) => {
        
        try{
            const payload = {
                'email': email,
                'name': name
            }
            const response = await api.post('/user/register/get-new-otp-code', payload)
            if(response.status == 200 ){
                return true
            }
            return false
        } catch(err: any){
            return false
        }
    }
    

    const createAccount = async (email: string | undefined, name: string | undefined, password: string | undefined, telephone: string | undefined) =>{
        setLoading(true)
        const payload = {
                "email": email,
                "name": name,
                "telephone": telephone,
                "password": password
            }
        try{
            const response = await api.post('user/register', payload)
            const {access_token} = response.data
            setToken(access_token)
            setCookie('user_name', response.data.user_data.name)
            return response.data
        } catch (err: any) {
            throw err
        } finally {
            setLoading(false)
        }
    }

    return {loading, verifyUser, createAccount, error, verifyOtpCode, requestNewOtpCode}
}