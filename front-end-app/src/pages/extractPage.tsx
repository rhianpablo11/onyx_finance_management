import { useState } from "react"
import ListTransaction from "../components/ui/listTransaction"
import type { ListTransactionProps } from "../interfaces/interfacesComponents"


function ExtractPage(){

    const [listTransaction, setListTransaction] = useState<ListTransactionProps[]>([])

    return(
        <>
        <div className="w-full h-full px-2.5 flex flex-col border border-white rounded-[28px] overflow-hidden">
            <div className="shrink-0">
                <div className="flex items-center justify-between w-full pt-5">
                    <div className="flex flex-col">
                        <h1 className="text-base text-white font-extralight">
                            Saldo no perído:
                        </h1>
                        <h1 className="font-normal text-white text-2xl">
                            R$ 15.000,00
                        </h1>
                    </div>
                    <div className="flex justify-start pl-2.5 items-center border border-white/15 h-10 w-3/8 rounded-2xl">
                        <h1 className="text-white/75 font-normal">
                            Este mês s
                        </h1>
                    </div>
                </div>
                <div className={`mt-2.5 h-px w-full bg-linear-to-r from-purple-500 to-white `}></div>
                <div className="flex items-center justify-start w-full pt-4">
                    <div className="flex flex-col w-1/2">
                        <h1 className="text-white font-extralight text-sm">
                            Recebido:
                        </h1>
                        <h1 className="font-normal text-lg text-white">
                            R$ 40.000,00
                        </h1>
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-white font-extralight text-sm">
                            Saídas:
                        </h1>
                        <h1 className="font-normal text-lg text-white">
                            R$ 25.000,00
                        </h1>
                    </div>
                </div>
                <div className={`mt-4 mb-2.5 h-px w-full bg-linear-to-r from-purple-500 to-white `}></div>
                <div className="flex flex-col w-full justify-center mb-4">
                    <div className="flex w-full">
                        <div className="w-2/3">
                            <h1 className="text-white font-extralight text-sm">
                                Extrato das movimentações
                            </h1>
                        </div>
                        <div className="border border-white/30 h-4.5 w-32 rounded-md">
                            <h1 className="text-white/50 font-extralight text-xs ">
                                Data cresc. s
                            </h1>
                        </div>
                    </div>
                </div>
            </div>
                <div className="w-full flex-1 overflow-y-auto min-h-0 ">
                    {/* {listTransaction.map((item, index) => (
                        <ListTransaction 
                            key={item.id} 
                            type={typeList}
                            category={item.category}
                            nameExpense={item.nameExpense}
                            value={item.value} 
                            id={item.id}
                        />
                    ))} */}
                    <ListTransaction  
                            type='expenseOfDay'
                            category='category'
                            nameExpense='Alimentação'
                            value={50.00}
                            id={1}
                        />
                    <ListTransaction  
                            type='expenseOfDay'
                            category='category'
                            nameExpense='Alimentação'
                            value={50.00}
                            id={1}
                        />
                    <ListTransaction  
                            type='expenseOfDay'
                            category='category'
                            nameExpense='Alimentação'
                            value={50.00}
                            id={1}
                        />
                    <ListTransaction  
                            type='expenseOfDay'
                            category='category'
                            nameExpense='Alimentação'
                            value={50.00}
                            id={1}
                        />
                    <ListTransaction  
                            type='expenseOfDay'
                            category='category'
                            nameExpense='Alimentação'
                            value={50.00}
                            id={1}
                        />
                    <ListTransaction  
                            type='expenseOfDay'
                            category='category'
                            nameExpense='Alimentação'
                            value={50.00}
                            id={1}
                        />
                    <ListTransaction  
                            type='expenseOfDay'
                            category='category'
                            nameExpense='Alimentação'
                            value={50.00}
                            id={1}
                        />
                    <ListTransaction  
                            type='expenseOfDay'
                            category='category'
                            nameExpense='Alimentação'
                            value={50.00}
                            id={1}
                        />
                    <ListTransaction  
                            type='expenseOfDay'
                            category='category'
                            nameExpense='Alimentação'
                            value={50.00}
                            id={1}
                        />
                    <ListTransaction type='expenseOfDay' category='category' nameExpense='Teste Scroll' value={50.00} id={1}/>
                    <ListTransaction type='expenseOfDay' category='category' nameExpense='Teste Scroll' value={50.00} id={1}/>
                    <ListTransaction type='expenseOfDay' category='category' nameExpense='Teste Scroll' value={50.00} id={1}/>
                    <ListTransaction type='expenseOfDay' category='category' nameExpense='Teste Scroll' value={50.00} id={1}/>
                    <ListTransaction type='expenseOfDay' category='category' nameExpense='Teste Scroll' value={50.00} id={1}/>
                    <ListTransaction type='expenseOfDay' category='category' nameExpense='Teste Scroll' value={50.00} id={1}/>
                    <ListTransaction type='expenseOfDay' category='category' nameExpense='Teste Scroll' value={50.00} id={1}/>
                    
                    
                </div>

            
        </div>
        </>
    )
}

export default ExtractPage