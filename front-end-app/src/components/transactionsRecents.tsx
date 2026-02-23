// component for show in initial page the last transactions of day, and next
// payments and receives in monthly

import { useEffect, useState } from "react"
import ListTransaction from "./ui/listTransaction"
import type { ListTransactionProps, TransactionsRecentsProps } from "../interfaces/interfacesComponents"
import backgroundTransactionsRecents from '../../src/assets/bg-transactions-recents.svg?url'



function TransactionsRecents(props: TransactionsRecentsProps){
    const {dayExpenses, monthReceives, nextPayments} = props
    const [activeTab, setActiveTab] = useState(0)
    const [typeList, setTypeList] = useState('expenseOfDay')
    const [listToShow, setListToShow] = useState<ListTransactionProps[]>(dayExpenses)
    //const [nextPaymentsList, setNextPaymentsList] = useState<ListTransactionProps[]>([]);

    useEffect(()=>{
        setListToShow(dayExpenses)
    },[dayExpenses, monthReceives, nextPayments])

    useEffect(()=>{
        if(activeTab == 0){
            setTypeList('expenseOfDay')
            setListToShow(dayExpenses)
        } else if(activeTab == 1){
            setTypeList('nextPayments')
            setListToShow(nextPayments)
        } else if(activeTab == 2){
            setTypeList('receivesMonth')
            setListToShow(monthReceives)
        }
    }, [activeTab, dayExpenses, monthReceives, nextPayments])


    const renderList = () => {
        console.log(monthReceives)
        console.log(listToShow)
        if(listToShow.length == 0){
            return(
                <>
                    <div className="text-white/50 text-center mt-4 text-sm">
                        Nenhuma transação.
                    </div>
                </>
            )
        } else{
            if(activeTab == 2){
                return(
                    listToShow.map((item) => (
                    <ListTransaction 
                        key={item.id} 
                        type={typeList}
                        category={item.category}
                        nameExpense={item.nameExpense}
                        value={item.value} 
                        id={item.id}
                        date={item.date}
                    />
                    )
                ))
            }else if(activeTab == 1){
                return(
                    listToShow.map((item) => (
                    <ListTransaction 
                        key={item.id} 
                        type={typeList}
                        category={item.category}
                        nameExpense={item.nameExpense}
                        value={item.value} 
                        id={item.id}
                        end_date={item.end_date}
                        installments_count={item.installments_count}
                    />
                    )
                ))
            }
            return(
                listToShow.map((item) => (
                    <ListTransaction 
                        key={item.id} 
                        type={typeList}
                        category={item.category}
                        nameExpense={item.nameExpense}
                        value={item.value} 
                        id={item.id}
                    />
                ))
            )
        }
    }

    return(
        <>
            <div className="rounded-[29px] flex-1 flex flex-col min-h-0 bg-linear-to-tl from-white/50 via-black to-white/50 p-px">
                <div className="rounded-[28px] px-3 pt-4  flex flex-col flex-1 min-h-0 bg-center bg-no-repeat" style={{backgroundImage: `url("${backgroundTransactionsRecents}")`}}>
                    <div className="flex justify-between text-white font-extralight text-sm relative pb-2">
                        <button onClick={() => setActiveTab(0)}
                                className={`pb-2 transition-colors duration-300 ${activeTab === 0 ? "text-white font-normal" : "text-white/50 font-extralight"}`}>
                            <h1>
                                Gastos do dia
                            </h1>
                        </button>
                        <button onClick={() => setActiveTab(1)}
                                className={`pb-2 transition-colors duration-300 ${activeTab === 1 ? "text-white font-normal" : "text-white/50 font-extralight"}`}>
                            <h1>
                                Proximos pag.
                            </h1>
                        </button>
                        <button onClick={() => setActiveTab(2)}
                                className={`pb-2 transition-colors duration-300 ${activeTab === 2 ? "text-white font-normal" : "text-white/50 font-extralight"}`}>
                            <h1>
                                Entradas mês
                            </h1>
                        </button>
                        <div className="absolute bottom-0 left-0 w-full h-px bg-white"></div>
                        <div 
                            className={`absolute bottom-0 h-px w-1/3 transition-all duration-500 ease-in-out
                                ${activeTab === 0 ? "translate-x-0 bg-linear-to-r from-purple-500 to-transparent" : ""}
                                ${activeTab === 1 ? "translate-x-full bg-linear-to-r from-transparent via-purple-500 to-transparent" : ""}
                                ${activeTab === 2 ? "translate-x-[200%] bg-linear-to-l from-purple-500 to-transparent" : ""}
                            `}
                        >
                            {/* Opcional: Um brilho extra (glow) para ficar neon */}
                            <div className="absolute inset-0 bg-purple-500 blur-[2px] opacity-50"></div>
                        </div>
                    </div>
                    
                    <div className="flex flex-col flex-1 overflow-y-auto min-h-0 pb-3 pt-3">
                        {renderList()}
                    </div>

                </div>
            </div>
        </>
    )
}


export default TransactionsRecents