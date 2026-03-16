import { useEffect, useState } from "react"
import Balance from "../components/balance"
import TransactionsRecents from "../components/transactionsRecents"
import type { DashMetricsProps, ListTransactionProps } from "../interfaces/interfacesComponents"
import { useDashboard } from "../hooks/useDashboard"
import DetailsExpense from "../components/detailsExpense"
import { getGreting } from "../utils/utils"

function DashMetricsPage(props: DashMetricsProps){
    const {setCustomBackAction, setTypeToShowHeader, setLegendHeader, setTitleHeader} = props
    // const {getMetrics, loading, error} = useDashboard()
    const {getMetrics, loading} = useDashboard()
    const [balanceMonth, setBalanceMonth] = useState<number>(0)
    const [listOfTransactionsOut, setListOfTransactionsOut] = useState<ListTransactionProps[]>([])
    const [listOfTransactionsIn, setListOfTransactionsIn] = useState<ListTransactionProps[]>([])
    const [balanceGeral, setBalanceGeral] = useState(0)
    const [legendBalance, setBalance] = useState('')
    const [isIncoming, setIsIncoming] = useState(false)
    const [listOfNextPayments, setListOfNextPayments] = useState<ListTransactionProps[]>([])
    const [idOfTransactionSelected, setIdOfTransactionSelected] = useState<number | null>(null)
    const [transactionSelected, setTransactionSelected] = useState<ListTransactionProps | undefined>()


    useEffect(() => {
            const fetchDashboardData = async () => {
                try {
                    const data = await getMetrics();
                    console.log(data)
                    setBalanceMonth(data['month_balance'])
                    setListOfTransactionsOut(data['expenses_out'])
                    setListOfTransactionsIn(data['expenses_in_on_month'])
                    setBalanceGeral(data['balance_geral'])
                    setListOfNextPayments(data['next_payments'])
                    setBalance(data['legend_balance'])
                    setIsIncoming(data['is_incoming_legend'])
                    console.log(data['expenses_out'])
                } catch (error) {
                    console.error("Erro ao buscar métricas:", error);
                }
            }
    
            fetchDashboardData();
            
        }, [])
    


    useEffect(()=>{
        if(setCustomBackAction){
            if(idOfTransactionSelected != null){
                setCustomBackAction(()=> ()=>{
                    setIdOfTransactionSelected(null)
                    setTransactionSelected(undefined)
                })
                if(setTitleHeader && setLegendHeader && setTypeToShowHeader){
                    setTitleHeader('Detalhes')
                    setLegendHeader('Visualize as informações completas da transação')
                    setTypeToShowHeader('pages-nav')
                }
            } else{
                setCustomBackAction(null)
                if(setTitleHeader && setLegendHeader && setTypeToShowHeader){
                    setTitleHeader('')
                    const legend = 'Tenha ' + getGreting()
                    setLegendHeader(legend)
                    setTypeToShowHeader('wellcome')
                }
            }
        } 
        return ()=>{
            if(setCustomBackAction ){
                setCustomBackAction(null)
                if(setTitleHeader && setLegendHeader && setTypeToShowHeader){
                    setTitleHeader('')
                    setLegendHeader('')
                    setTypeToShowHeader('wellcome')
                }
            }
        }
    }, [idOfTransactionSelected, setCustomBackAction])


    // trazer para ca toda a logica da requisição
    if(idOfTransactionSelected == null){
        return(
            <>
                <div className="w-full h-full flex flex-col overflow-hidden">
                    
                    <Balance value={balanceMonth}
                            legend={legendBalance}
                            incoming={isIncoming}
                            balanceGeral={balanceGeral} 
                            loading={loading} />
                    <TransactionsRecents dayExpenses={listOfTransactionsOut}
                                        monthReceives={listOfTransactionsIn}
                                        nextPayments={listOfNextPayments}
                                        setIdOfTransactionSelected={setIdOfTransactionSelected}
                                        setTransactionSelected={setTransactionSelected} />
                </div>
            </>
        )
    } else{
        if(transactionSelected != undefined){
            return(
                <>
                    <DetailsExpense nameExpense={transactionSelected.nameExpense}
                                telephone="75 98765-4321"
                                amount={transactionSelected.value}
                                dateExpense={transactionSelected.date || '29/02/26'}
                                paymentMethod={transactionSelected.paymentMethod || 'dinheiro físico'}
                                description={transactionSelected.description || 'Nenhuma descrição foi encontrada'}
                                category={transactionSelected.category}
                                idExpense={transactionSelected.id}
                                typeExpense={transactionSelected.typeExpense || true} />
                </>
            )
        }
    }
    
}

export default DashMetricsPage