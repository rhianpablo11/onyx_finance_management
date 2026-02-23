// component for repeat in list 
// show the data resumid of expense/transaction in date
import { useState } from "react"
import type { ListTransactionProps } from "../../interfaces/interfacesComponents"
import { formatDateShow, formatValue } from "../../utils/utils"


function ListTransaction(props: ListTransactionProps){
    const {type, nameExpense, value, category, typeExpense, date, end_date, installments_count} = props
    const alimentationIcon = (
        <>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-6 1.5v-1.5m12 9.75-1.5.75a3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0L3 16.5m15-3.379a48.474 48.474 0 0 0-6-.371c-2.032 0-4.034.126-6 .371m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.169c0 .621-.504 1.125-1.125 1.125H4.125A1.125 1.125 0 0 1 3 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 0 1 6 13.12M12.265 3.11a.375.375 0 1 1-.53 0L12 2.845l.265.265Zm-3 0a.375.375 0 1 1-.53 0L9 2.845l.265.265Zm6 0a.375.375 0 1 1-.53 0L15 2.845l.265.265Z" />
            </svg>
        </>
    )
    
    const bankNotes = (
        <>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
            </svg>

        </>
    )

    const [iconShow, setIconShow] = useState(bankNotes)
    if(category == 'alo'){
        setIconShow(alimentationIcon)
    }

    if(type == 'expenseOfDay'){
        return (
            <>
                <div className="flex-col mt-2 w-full h-16 border-white">
                    <div className="flex items-center">
                        <div className="bg-white/8 w-10 h-10 rounded-4xl flex justify-center items-center text-white">
                            {iconShow}
                        </div>
                        <div className="flex-col pl-2.5">
                            <h1 className="text-white font-extralight text-sm">
                                {nameExpense}
                            </h1>
                            <div className="flex items-baseline">
                                    <h4 className="text-white font-extralight pr-1">
                                        R$
                                    </h4>
                                    <h3 className="text-white font-normal text-xl">
                                        {formatValue(value)}
                                    </h3>
                                </div>
                        </div>
                        <div className="text-white ml-auto pr-4">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                            </svg>
                        </div>
                    </div>
                    
                </div>
                <div className="border-b border-white/25"></div>
            </>
        )
    } else if(type == 'extractPage'){
        return (
            <>
                <div className="flex-col mt-1.5 mb-1.5 w-full max-h-16 border-white">
                    <div className="flex items-center w-full">
                        <div className="w-7/10 flex items-center">
                            <div className="bg-white/8 w-10 h-10 rounded-4xl flex justify-center items-center text-white">
                                {iconShow}
                            </div>
                            <div className=" flex-col pl-1.5">
                                <h1 className="text-white font-extralight text-sm">
                                    {nameExpense}
                                </h1>
                                <div className="flex items-baseline">
                                    <h4 className="text-white font-extralight pr-1">
                                        R$
                                    </h4>
                                    <h3 className="text-white font-normal text-xl">
                                        {formatValue(value)}
                                    </h3>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col  justify-center">
                            <div className="flex items-baseline">
                                <h1 className="text-white font-extralight text-xs">
                                    Tipo:
                                </h1>
                                <h1 className="pl-1 text-white text-sm font-normal">
                                   {typeExpense == true ? 'Entrada' : 'Saída'} 
                                </h1>
                            </div>
                            <div className="flex items-baseline">
                                <h1 className="text-white font-extralight text-xs">
                                    Data:
                                </h1>
                                <h1 className="pl-1 text-white font-normal text-sm">
                                    
                                    {formatDateShow(date)}
                                </h1>
                            </div>
                        </div>
                        <div className="text-white ml-auto pl-1 pr-1">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                            </svg>
                        </div>
                    </div>
                    
                </div>
                <div className="border-b border-white/25"></div>
            </>
        )
    } else if(type == 'receivesMonth'){
        return (
            <>
                <div className="flex-col mt-2 w-full h-16 border-white">
                    <div className="flex items-center w-full">
                        <div className="w-7/10 flex items-center">
                            <div className="bg-white/8 w-10 h-10 rounded-4xl flex justify-center items-center text-white">
                                {iconShow}
                            </div>
                            <div className="flex-col pl-2.5">
                                <h1 className="text-white font-extralight text-sm">
                                    {nameExpense}
                                </h1>
                                <div className="flex items-baseline">
                                    <h4 className="text-white font-extralight pr-1">
                                        R$
                                    </h4>
                                    <h3 className="text-white font-normal text-xl">
                                        {formatValue(value)}
                                    </h3>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col  h-full items-start pr-1">
                            <h1 className="text-white font-extralight text-sm">
                                Rec. em
                            </h1>
                            <h1 className="text-white font-light text-sm">
                                {formatDateShow(date)}
                            </h1>
                        </div>
                        <div className="text-white ml-auto pr-1">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                            </svg>
                        </div>
                    </div>
                    
                </div>
                <div className="border-b border-white/25"></div>
            </>
        )
    } else if(type == 'nextPayments'){
        return (
            <>
                <div className="flex-col mt-2 w-full h-16 border-white">
                    <div className="flex items-center w-full">
                        <div className="w-6/10 flex items-center">
                            <div className="bg-white/8 w-10 h-10 rounded-4xl flex justify-center items-center text-white">
                                {iconShow}
                            </div>
                            <div className="flex-col pl-2.5">
                                <h1 className="text-white font-extralight text-sm">
                                    {nameExpense}
                                </h1>
                                <div className="flex items-baseline">
                                    <h4 className="text-white font-extralight pr-1">
                                        R$
                                    </h4>
                                    <h3 className="text-white font-normal text-xl">
                                        {formatValue(value)}
                                    </h3>
                                </div>
                                
                            </div>
                        </div>
                        <div className="flex flex-col w-28 justify-center">
                            <div className="flex items-baseline">
                                <h1 className="text-white font-extralight text-xs">
                                    Venc.:
                                </h1>
                                <h1 className="pl-1 text-white text-sm font-normal">
                                   
                                   {formatDateShow(end_date)}
                                </h1>
                            </div>
                            <div className="flex items-baseline">
                                <h1 className="text-white font-extralight text-xs">
                                    Parc.:
                                </h1>
                                <h1 className="pl-1 text-white font-normal text-sm">
                                    {installments_count != null ? installments_count : (
                                    <>
                                        <div className="pl-1">
                                            <svg width="16px" height="16px" viewBox="0 0 24 12" stroke-width="1.5" fill="none" xmlns="http://www.w3.org/2000/svg" color="#ffffff">
                                                <path d="M14 9L13.75 9.375M10 9C9.08779 7.78565 7.63574 7 6 7C3.23858 7 1 9.23858 1 12C1 14.7614 3.23858 17 6 17C7.63582 17 9.08816 16.2144 10.0004 15L10.3337 14.5" stroke="#ffffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                                                <path d="M10 9L13.9996 15C14.9118 16.2144 16.3642 17 18 17C20.7614 17 23 14.7614 23 12C23 9.23858 20.7614 7 18 7C16.3642 7 14.9118 7.78555 13.9996 9" stroke="#ffffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                                            </svg>
                                        </div>
                                    </>)}
                                </h1>
                            </div>
                        </div>
                        <div className="text-white ml-auto pr-4 pl-3">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                            </svg>
                        </div>
                    </div>
                    
                </div>
                <div className="border-b border-white/25"></div>
            </>
        )
    }

    
}

export default ListTransaction