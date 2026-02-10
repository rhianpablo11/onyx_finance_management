import { useState } from "react";
import { api } from "../services/apiService";
import type { ListTransactionProps } from "../interfaces/interfacesComponents";


interface returnGetMetrics{
    month_balance: number
    expenses_out: ListTransactionProps[]
    expenses_in_on_month: ListTransactionProps[]
    balance_geral: number
    next_payments: ListTransactionProps[]
    is_incoming_legend: boolean
    legend_balance: string
}

export function useDashboard(){
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const getMetrics = async (): Promise<returnGetMetrics> => {
        setError(null)
        setLoading(true)
        try{
            const response = await api.get('/transactions/metrics-dashboard')
            return response.data
        } catch(err: any){
            const errorMessage = err.response?.data?.message || 'Erro ao resgatar os ultimos dados'
            setError(errorMessage)
            throw err
        } finally{
            setLoading(false)
        }
    }

    return {getMetrics, loading, error}
}