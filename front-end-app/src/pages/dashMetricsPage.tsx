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
    const [balanceGeral, setBalanceGeral] = useState(0)

    useEffect(() => {
            const fetchDashboardData = async () => {
                try {
                    const data = await getMetrics();
                    setBalanceMonth(data['month_balance'])
                    setListOfTransactionsOut(data['expenses_out'])
                    setListOfTransactionsIn(data['expenses_in_on_month'])
                    setBalanceGeral(data['balance_geral'])
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
                             incoming={true}
                             balanceGeral={balanceGeral} />
            <TransactionsRecents dayExpenses={listOfTransactionsOut}
                                monthReceives={listOfTransactionsIn}/>
        </>
    )
}

export default DashMetricsPage