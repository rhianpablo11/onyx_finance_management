import { useEffect, useState } from "react"
import Balance from "../components/balance"
import TransactionsRecents from "../components/transactionsRecents"
import type { ListTransactionProps } from "../interfaces/interfacesComponents"
import { useDashboard } from "../hooks/useDashboard"

function DashMetricsPage(){
    // const {getMetrics, loading, error} = useDashboard()
    const {getMetrics} = useDashboard()
    const [balanceMonth, setBalanceMonth] = useState<number>(0)
    const [listOfTransactionsOut, setListOfTransactionsOut] = useState<ListTransactionProps[]>([])
    const [listOfTransactionsIn, setListOfTransactionsIn] = useState<ListTransactionProps[]>([])

    useEffect(() => {
            const fetchDashboardData = async () => {
                try {
                    const data = await getMetrics();
                    setBalanceMonth(data['month_balance'])
                    setListOfTransactionsOut(data['expenses_out'])
                    setListOfTransactionsIn(data['expenses_in_on_month'])
                } catch (error) {
                    console.error("Erro ao buscar métricas:", error);
                }
            }
    
            fetchDashboardData();
            
        }, [])
    
    // trazer para ca toda a logica da requisição
    return(
        <>
            <Balance value={balanceMonth}
                             legend='10% a mais que o mês anterior'
                             incoming={true} />
            <TransactionsRecents dayExpenses={listOfTransactionsOut}
                                monthReceives={listOfTransactionsIn}/>
        </>
    )
}

export default DashMetricsPage