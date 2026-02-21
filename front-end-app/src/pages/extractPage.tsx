import { useEffect, useMemo, useState } from "react"
import ListTransaction from "../components/ui/listTransaction"
import type { ListTransactionProps } from "../interfaces/interfacesComponents"
import { useExtract } from "../hooks/useExtract"
import SelectionComp from "../components/ui/selection"
import { getDateRangeByOption } from "../utils/utils"
import SkeletonLoader from "../components/ui/skeletonLoader"


function ExtractPage(){
    const [balanceValueInPeriod, setBalanceValueInPeriod] = useState<number>(0)
    const [valueReceivedInPeriod, setValueReceivedInPeriod] = useState<number>(0)
    const [valueSpentInPeriod, setValueSpentInPeriod] = useState<number>(0)
    const [listOfTransaction, setListOfTransaction] = useState<ListTransactionProps[]>([])
    const [currentRange, setCurrentRange] = useState({ start: '', end: '' });
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [orderListSelected, setOrderListSelected] = useState('2')
    const [handleTypeOfExpense, setHandleTypeOfExpense] = useState(false)
    const {getExtract, loading} = useExtract()

    const categorysOfSearch = [
        { label: "Este mês", value: "1" },
        { label: "Últimos 7 dias", value: "6" },
        { label: "Mês passado", value: "2" },
        { label: "Ultimos 3 meses", value: "3" },
        { label: "Ultimos 6 meses", value: "4" },
        { label: "Período pers.", value: "5" }
    ]

    const categorysOfOrdering = [
        { label: "Data cresc.", value: "1" },
        { label: "Data decresc.", value: "2" },
        { label: "Tipo", value: "3" },
        { label: "Valor cresc.", value: "4" },
        { label: "Valor decresc.", value: "5" }
    ]

    const fetchExtractData = async (start: string, end: string) =>{
            try{
                const data = await getExtract(start, end)
                console.log(data.transactions[0].date)
                console.log(typeof(data.transactions[0].date))
                console.log(currentRange, showDatePicker)
                setBalanceValueInPeriod(data.balance_value_in_period)
                setListOfTransaction(data.transactions)
                setValueReceivedInPeriod(data.value_received)
                setValueSpentInPeriod(data.value_spent)
            } catch(error){
                console.error('erro ao buscar o extrato', error)
            }
    }


    const handleCategoryChange = async (valor: string ) => {
        console.log("Usuário escolheu a categoria ID:", valor);
        // Aqui você faria um setState, ex: setCategoriaSelecionada(valor)
        const range = getDateRangeByOption(valor);

        // 2. Se for "Período personalizado" (retornou null)
        if (!range) {
            setShowDatePicker(true); // Abre o modal/input de data
            return
        }

        // 3. Se for automático, atualiza e busca
        setShowDatePicker(false);
        setCurrentRange({ start: range.startDate, end: range.endDate });
        
        // Chama a função de busca
        await fetchExtractData(range.startDate, range.endDate);
    };


    const handleOrderChange = async (valor: string ) => {
        console.log("Usuário escolheu a categoria ID:", valor)
        setOrderListSelected(valor)
        if(valor == '3'){
            setHandleTypeOfExpense(!handleTypeOfExpense)
            console.log(handleTypeOfExpense)
        }
    }


    const sortedTransactions = useMemo(()=>{
        const listCopy = [...listOfTransaction]
        return listCopy.sort((a, b)=>{
            switch(orderListSelected){
                case '1':
                    return new Date(a.date || '').getTime() - new Date(b.date || '').getTime()
                case '2':
                    return new Date(b.date || '').getTime() - new Date(a.date || '').getTime()
                case '3':
                    
                    const typeA = a.typeExpense ? 1 : 0
                    const typeB = b.typeExpense ? 1 : 0
                    if(handleTypeOfExpense){
                        return typeA - typeB
                    } else{
                        return typeB - typeA
                    }
                    
                case '4':
                    return a.value - b.value
                case '5':
                    return b.value - a.value
                default:
                    return 0

            }
        })
    }, [listOfTransaction, orderListSelected, handleTypeOfExpense])


    useEffect(()=>{
        const initialRange = getDateRangeByOption("1");
        if (initialRange) {
            setCurrentRange({ start: initialRange.startDate, end: initialRange.endDate });
            fetchExtractData(initialRange.startDate, initialRange.endDate);
        }
    }, [])

    
    return(
        <>
        <div className="w-full h-full px-2.5 flex flex-col bg-white/3 backdrop-blur-3xl border border-white/20 rounded-[28px] overflow-hidden">
            <div className="shrink-0">
                <div className="flex items-center justify-between w-full pt-5">
                    <div className="flex flex-col">
                        <h1 className="text-base text-white font-extralight">
                            Saldo no perído:
                        </h1>
                        {loading ? (
                            <div className="flex justify-end">
                                <h1 className="font-normal text-white text-2xl">
                                    R$
                                </h1>
                                <SkeletonLoader className="w-20" />
                            </div>
                        ) : (
                            <h1 className="font-normal text-white text-2xl">
                                R$ {balanceValueInPeriod}
                            </h1>
                        )}
                        
                    </div>
                    {/* <div className="flex justify-between px-2.5 items-center border border-white/15 h-10 w-3/8 rounded-2xl">
                        <div>
                            <h1 className="text-white/75 font-normal">
                                Este mês
                            </h1>
                        </div>
                        <div className="text-white/75">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                            </svg>
                        </div>
                    </div> */}
                    <div className="w-4/8">
                        <SelectionComp options={categorysOfSearch}
                                   placeholder={'Selecione o per.'}
                                   onChange={handleCategoryChange}
                                   initialValue="1"
                                   useFor='select-period-extract' />
                    </div>
                </div>
                <div className={`mt-2.5 h-px w-full bg-linear-to-r from-purple-500 via-white to-purple-500`}></div>
                <div className="flex items-center justify-start w-full pt-4">
                    <div className="flex flex-col w-1/2">
                        <h1 className="text-white font-extralight text-sm">
                            Recebido:
                        </h1>
                        {loading ? (
                            <div className="flex  justify-baseline items-baseline">
                                <h1 className="font-normal text-lg text-white">
                                    R$ 
                                </h1>
                                <SkeletonLoader className="w-20 h-4" />
                            </div>
                        ) : (
                            <h1 className="font-normal text-lg text-white">
                                R$ {valueReceivedInPeriod}
                            </h1>
                        )}
                        
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-white font-extralight text-sm">
                            Saídas:
                        </h1>
                        {loading ? (
                            <div className="flex  justify-baseline items-baseline">
                                <h1 className="font-normal text-lg text-white">
                                    R$ 
                                </h1>
                                <SkeletonLoader className="w-20 h-4" />
                            </div>
                        ) : (
                            <h1 className="font-normal text-lg text-white">
                                R$ {valueSpentInPeriod}
                            </h1>
                        )}
                    </div>
                </div>
                <div className={`mt-4 mb-2.5 h-px w-full bg-linear-to-r from-purple-500 via-white to-purple-500`}></div>
                <div className="flex flex-col w-full justify-center mb-4">
                    <div className="flex w-full">
                        <div className="w-2/3">
                            <h1 className="text-white font-extralight text-base">
                                Extrato das movimentações
                            </h1>
                        </div>
                        <div className="w-32">
                            <SelectionComp options={categorysOfOrdering}
                                   placeholder={'Ordernar por'}
                                   onChange={handleOrderChange}
                                   initialValue="2" 
                                   useFor='order-moviments' />
                            
                        </div>
                    </div>
                </div>
            </div>
                <div className="w-full flex-1 overflow-y-auto min-h-0 ">
                    {sortedTransactions.map((item) => (
                        <ListTransaction 
                            key={item.id} 
                            type='extractPage'
                            category={item.category}
                            nameExpense={item.nameExpense}
                            value={item.value} 
                            id={item.id}
                            typeExpense={item.typeExpense}
                            date={item.date}
                        />
                    ))}
                </div>
        </div>
        </>
    )
}

export default ExtractPage