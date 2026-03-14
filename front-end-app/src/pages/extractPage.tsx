import { useEffect, useMemo, useState } from "react"
import ListTransaction from "../components/ui/listTransaction"
import type { ExtractPageProps, ListTransactionProps } from "../interfaces/interfacesComponents"
import { useExtract } from "../hooks/useExtract"
import SelectionComp from "../components/ui/selection"
import { formatValue, getDateRangeByOption } from "../utils/utils"
import SkeletonLoader from "../components/ui/skeletonLoader"
import backgroundExtractPage from '../assets/Group 8.svg?url'
import DetailsExpense from "../components/detailsExpense"
import { DateRangePicker } from "../components/react-aria/DateRangePicker"
import { type RangeValue} from "react-aria"
import { type CalendarDate } from "@internationalized/date";


function ExtractPage(props: ExtractPageProps){
    const {setCustomBackAction, setLegendHeader, setTitleHeader} = props
    const [balanceValueInPeriod, setBalanceValueInPeriod] = useState<number>(0)
    const [valueReceivedInPeriod, setValueReceivedInPeriod] = useState<number>(0)
    const [valueSpentInPeriod, setValueSpentInPeriod] = useState<number>(0)
    const [listOfTransaction, setListOfTransaction] = useState<ListTransactionProps[]>([])
    const [currentRange, setCurrentRange] = useState({ start: '', end: '' });
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [orderListSelected, setOrderListSelected] = useState('2')
    const [handleTypeOfExpense, setHandleTypeOfExpense] = useState(false)
    const {getExtract, loading} = useExtract()
    const [idSelectedTransactionToSeeDetails, setIdSelectedTransactionToSeeDetails] = useState<number | null>(null)
    const [transactionSelected, setTransactionSelected] = useState<ListTransactionProps | undefined>()
    const [customRange, setCustomRange] = useState<RangeValue<CalendarDate> | null>(null)

    const categorysOfSearch = [
        { label: "Este mês", value: "1" },
        { label: "Últ. 7 dias", value: "6" },
        { label: "Mês passado", value: "2" },
        { label: "Ult. 3 meses", value: "3" },
        { label: "Ult. 6 meses", value: "4" },
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
                console.log('alouuuu')
                console.log(start, end)
                const data = await getExtract(start, end)
                console.log(data)
                
                
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


    const onClickFather = (idTransaction: number) =>{
        console.log(idTransaction)
        setIdSelectedTransactionToSeeDetails(idTransaction)
        if(listOfTransaction != undefined){
            setTransactionSelected(listOfTransaction.find(item => item.id == idTransaction))
        }
        
    }

    useEffect(()=>{
        if(setCustomBackAction){
            if(idSelectedTransactionToSeeDetails != null){
                setCustomBackAction(()=>()=>{
                    setIdSelectedTransactionToSeeDetails(null)
                    setTransactionSelected(undefined)
                })
                if(setTitleHeader && setLegendHeader){
                    setTitleHeader('Detalhes')
                    setLegendHeader('Visualize as informações completas da transação')
                }
            } else{
                setCustomBackAction(null)
                if(setTitleHeader && setLegendHeader){
                    setTitleHeader('Extrato')
                    setLegendHeader('Acompanhe as últimas movimentações realizadas')
                }
            }
        }
        return ()=>{
            if(setCustomBackAction){
                setCustomBackAction(null)
            }
        }
    },[idSelectedTransactionToSeeDetails, setCustomBackAction])
    
    if(idSelectedTransactionToSeeDetails == null){
        return(
            <>
            <div className="rounded-[29px] w-full h-full flex-1 bg-linear-to-tl from-white/50 via-black to-white/50 p-px">
                <div className="w-full h-full px-2.5 flex flex-col  backdrop-blur-3xl  rounded-[28px] overflow-hidden bg-cover  bg-center bg-no-repeat" style={{backgroundImage: `url("${backgroundExtractPage}")`}}>
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
                                        R$ {formatValue(balanceValueInPeriod)}
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
                                {showDatePicker && (
                                    <div className="w-full flex justify-end mt-2">
                                        <div className=" rounded-xl backdrop-blur-md border border-white/10">
                                            <DateRangePicker
                                                aria-label="Selecione o período personalizado"
                                                value={customRange}
                                                onChange={(range) => {
                                                    setCustomRange(range);
                                                    
                                                    // Se o usuário selecionou as duas datas, já faz a busca automático!
                                                    if (range?.start && range?.end) {
                                                        const startStr = range.start.toString(); // Vira 'YYYY-MM-DD'
                                                        const endStr = range.end.toString();
                                                        
                                                        setCurrentRange({ start: startStr, end: endStr });
                                                        fetchExtractData(startStr, endStr);
                                                        setShowDatePicker(false)
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className={`mt-2.5 h-px w-full bg-linear-to-r from-violet-900 via-white to-violet-900`}></div>
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
                                        R$ {formatValue(valueReceivedInPeriod)}
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
                                        R$ {formatValue(valueSpentInPeriod)}
                                    </h1>
                                )}
                            </div>
                        </div>
                        <div className={`mt-4 mb-2.5 h-px w-full bg-linear-to-r from-violet-900 via-white to-violet-900`}></div>
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
                                    onClickChildren={onClickFather}
                                />
                            ))}
                        </div>
                </div>
            </div>
            </>
        )
    } else {
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

export default ExtractPage