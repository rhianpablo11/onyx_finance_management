import { useState } from "react";
import { api } from "../services/apiService";
import { setToken } from "../services/tokenService";


export function useCreateAccount(){
    const [loading, setLoading] = useState(false)

    const verifyEmail = async (email: string) => {
        setLoading(true)
        try{
            const response = await api.get(`/user/verify-email?email=${email}`)
            return response.data
        } catch(err: any){
            throw err
        } finally{
            setLoading(false)
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
            const response = await api.post('user/create', payload)
            const {access_token} = response.data
            setToken(access_token)
            return response.data
        } catch (err: any) {
            throw err
        } finally {
            setLoading(false)
        }
    }

    return {loading, verifyEmail, createAccount}
}