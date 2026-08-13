import { useState } from "react";
import { api } from "../services/apiService";


export function useExpense(){
    const [loading, setLoading] = useState(false)

    const editExpense = async (transactionID: number, category: string, value: number, paymentMethod: string, date: string) => {
        setLoading(true)
        try{
            const response = await api.put(`/transactions/${transactionID}`, { category, value, paymentMethod, date })
            console.log(response.data)
            return response.data
        } catch(err: any) {
            throw err
        } finally {
            setLoading(false)
        }
    }


    const disableExpense = async (transactionID: number) => {
        setLoading(true)
        try{
            const response = await api.delete(`/transactions/${transactionID}`)
            console.log(response.data)
            return response.data
        } catch(err: any) {
            throw err
        } finally {
            setLoading(false)
        }
    }

    const getDetailsAboutFixedExpense = async (transactionID: number) => {
        setLoading(true)
        console.log('fui chamado')
        try{
            const response = await api.get(`/transactions/fixed-expense/${transactionID}`)
            console.log(response.data)
            return response.data
        } catch(err: any) {
            throw err
        } finally {
            setLoading(false)
        }
    }

    return {editExpense, loading, disableExpense, getDetailsAboutFixedExpense}
}