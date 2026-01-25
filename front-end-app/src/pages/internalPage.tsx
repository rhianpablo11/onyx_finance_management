import { useEffect, useState } from "react"
import Balance from "../components/balance"
import TransactionsRecents from "../components/transactionsRecents"
import HeaderInternal from "../components/ui/headerInternal"
import NavBar from "../components/ui/navBar"
import { useDashboard } from "../hooks/useDashboard"
import type { ListTransactionProps } from "../interfaces/interfacesComponents"
import DashMetricsPage from "./dashMetricsPage"
import ExtractPage from "./extractPage"
import ChatPage from "./chatPage"


function InternalPage(){
    const {getMetrics, loading, error} = useDashboard()
    const [balanceMonth, setBalanceMonth] = useState<number>(0)
    const [listOfTransactionsOut, setListOfTransactionsOut] = useState<ListTransactionProps[]>([])
    const [listOfTransactionsIn, setListOfTransactionsIn] = useState<ListTransactionProps[]>([])
    const [pageSelected, setPageSelected] = useState<string>('home')
    const [typeToShowHeader, setTypeToShowHeader] = useState<string>('wellcome')
    const [legendHeader, setLegendHeader] = useState<string>('')
    const [titleHeader, setTitleHeader] = useState<string>('')


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


    const handlePageSelected = (pageClicked: string) => {
        setPageSelected(pageClicked)
    }


    const renderInternal = () => {
        
        if(pageSelected == 'home'){
            return(
                <DashMetricsPage value={balanceMonth}
                                legend='10% a mais que o mês anterior'
                                incoming={true}
                                dayExpenses={listOfTransactionsOut}
                                monthReceives={listOfTransactionsIn}
                                    />
            )
        } else if(pageSelected == 'extract'){
            return(
                <ExtractPage />
            )
        } else if(pageSelected == 'chat'){
            return(
                <ChatPage name="Rhian Pablo"/>
            )
        }
    }

    useEffect(()=>{
        if(pageSelected == 'home'){
            setTypeToShowHeader('wellcome')
            setLegendHeader('Tenha uma ótima tarde')
        } else if(pageSelected == 'extract'){
            setTypeToShowHeader('pages-nav')
            setLegendHeader('Acompanhe as ultimas movimentações realizadas')
            setTitleHeader('Extrato das atividades')
        }  else if(pageSelected == 'chat'){
            setTypeToShowHeader('pages-nav')
            setLegendHeader('Facilitador de adição de gastos')
            setTitleHeader('ChatBot')
        }
    }, [pageSelected])

    return(
        
        <>
            <div className="w-full max-w-full h-dvh m-0 px-4 bg-black">
                <div className="w-full h-dvh max-h-dvh flex flex-col">
                    <div className="shrink-0 mt-5">
                        <HeaderInternal name="Rhian Pablo"
                                        legend={legendHeader}
                                        title={titleHeader}
                                        type={typeToShowHeader}/>
                    </div>
                    <div className="flex-1 overflow-hidden pb-24 pt-4">
                        {renderInternal()}
                    </div>  
                    <div className="w-full max-w-full fixed bottom-0 left-0 px-4 z-50 shrink-0">
                        <NavBar onClickButtonChildren={handlePageSelected}
                                buttonSelected={pageSelected}/>
                    </div>
                </div>
            </div>
        </>
        
    )
}

export default InternalPage