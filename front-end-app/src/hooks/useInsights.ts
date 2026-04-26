import { useState } from "react"
import { api } from "../services/apiService"



export function useInsights(){
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const getInsights = async () => {
        setError(null)
        setLoading(true)
        try{
            const response = await api.get('/insights/')
            return response.data
        } catch(err: any){
            const errorMessage = err.response?.data?.message || 'Erro ao resgatar os ultimos dados'
            setError(errorMessage)
            throw err
        } finally{
            setLoading(false)
        }
    }

    return {getInsights, loading, error}
}