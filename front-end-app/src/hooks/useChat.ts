import { useState } from "react"
import { api } from "../services/apiService"


export function useChat(){
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>('')

    const sendMessage = async (text: string) => {
        setLoading(true)
        setError(null)
        const payload = {
            message: text
        }
        try{
            const response = await api.post('/transactions/create', payload)
            console.log(response.data)
            return response.data
        } catch (err:any){
            const errorMsg = err.response?.data?.detail || 'Erro ao processar mensagem';
            setError(errorMsg)
            throw err
        } finally{
            setLoading(false)
        }
    }


    return {sendMessage, loading, error}
}