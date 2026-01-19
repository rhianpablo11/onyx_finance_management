// component for show in initial page the last transactions of day, and next
// payments and receives in monthly

import { useState } from "react"
import ListTransaction from "./ui/listTransaction"


function TransactionsRecents(){
    const [activeTab, setActiveTab] = useState(0)

    return(
        <>
            <div className="rounded-[28px] px-3 pt-6 h-full flex flex-col bg-[#0a0a0a]">
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
                
                <div >
                    <ListTransaction type="expenseOfDay"
                                     category="alimentation"
                                     nameExpense="Alimentação"
                                     value="10,00"/>
                    <ListTransaction type="expenseOfDay"
                                     category="alimentation"
                                     nameExpense="Alimentação"
                                     value="10,00"/>
                    <ListTransaction type="expenseOfDay"
                                     category="alimentation"
                                     nameExpense="Alimentação"
                                     value="10,00"/>
                    <ListTransaction type="expenseOfDay"
                                     category="alimentation"
                                     nameExpense="Alimentação"
                                     value="10,00"/>
                </div>

            </div>
        </>
    )
}


export default TransactionsRecents