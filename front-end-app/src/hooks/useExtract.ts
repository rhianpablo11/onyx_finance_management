import { useState } from "react";
import { api } from "../services/apiService";


export function useExtract(){
    const [loading, setLoading] = useState(false)

    const getExtract = async (startDate: string, endDate: string) => {
        setLoading(true)
        try{
            const response = await api.get(`/transactions/extract?start_date=${startDate}&end_date=${endDate}`)
            return response.data
        } catch(err: any) {
            throw err
        } finally {
            setLoading(false)
        }
    }

    return {getExtract, loading}
}