import { useEffect, useState } from "react"
import ListTransaction from "../components/ui/listTransaction"
import type { ListTransactionProps } from "../interfaces/interfacesComponents"
import { useExtract } from "../hooks/useExtract"


function ExtractPage(){
    const [balanceValueInPeriod, setBalanceValueInPeriod] = useState<number>(0)
    const [valueReceivedInPeriod, setValueReceivedInPeriod] = useState<number>(0)
    const [valueSpentInPeriod, setValueSpentInPeriod] = useState<number>(0)
    const [listOfTransaction, setListOfTransaction] = useState<ListTransactionProps[]>([])
    const {getExtract, loading} = useExtract()

    useEffect(()=>{
        const fetchExtractData = async () =>{
            try{
                const data = await getExtract()
                setBalanceValueInPeriod(data['balance_value_in_period'])
                setListOfTransaction(data['transactions'])
                setValueReceivedInPeriod(data['value_received'])
                setValueSpentInPeriod(data['value_spent'])
            } catch(error){
                console.error('erro ao buscar o extrato', error)
            }
        }

        fetchExtractData()
    }, [])

    
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
                            R$ {balanceValueInPeriod}
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
                            R$ {valueReceivedInPeriod}
                        </h1>
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-white font-extralight text-sm">
                            Saídas:
                        </h1>
                        <h1 className="font-normal text-lg text-white">
                            R$ {valueSpentInPeriod}
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
                    {/* {listOfTransaction.map((item, index) => (
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