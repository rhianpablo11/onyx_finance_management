import { useState } from "react";
import { api } from "../services/apiService";


export function useExpense(){
    const [loading, setLoading] = useState(false)

    const editExpense = async (transactionID: number,
                               category: string,
                               value: number,
                               paymentMethod: string,
                               date: string,
                               typeOfCharge: string,
                               dateOfThisPayment: string,
                               dateOfLastPayment: string,
                               editedStartDate: string,
                               fixedExpenseID: null | number | undefined,
                               installments_count?: number,
                               update_behavior?: string) => {
        setLoading(true)
        try{
            const dataToSend = {
                'category': category,
                'value': value,
                'paymentMethod': paymentMethod,
                'date': date,
                'typeOfCharge': typeOfCharge,
                'dateOfThisPayment': dateOfThisPayment,
                'dateOfLastPayment': dateOfLastPayment,
                'editedStartDate': editedStartDate,
                'fixedExpenseID': fixedExpenseID,
                'installments_count': installments_count,
                'update_behavior': update_behavior
            }

            const response = await api.put(`/transactions/${transactionID}`, dataToSend)
            console.log(response.data)
            return response.data
        } catch(err: any) {
            throw err
        } finally {
            setLoading(false)
        }
    }


    const disableExpense = async (transactionID: string | number, payload: any) => {
    setLoading(true)
    try {
        const response = await api.delete(`/transactions/${transactionID}`, { data: payload })
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

    const getUserCategories = async () => {
        setLoading(true)
        try {
            const response = await api.get(`/expense-category/get-categories`)
            return response.data
        } catch(err: any) {
            throw err
        } finally {
            setLoading(false)
        }
    }


    const createManualExpense = async (payload: any) => {
        setLoading(true)
        try {
            const response = await api.post(`/transactions/create-manual`, payload)
            console.log(response.data)
            return response.data
        } catch(err: any) {
            throw err
        } finally {
            setLoading(false)
        }
    }


    return {editExpense, loading, disableExpense, getDetailsAboutFixedExpense, getUserCategories, createManualExpense}
}