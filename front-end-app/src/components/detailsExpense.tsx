import backgroundDetailsExpense from '../assets/Group 8.svg?url'
import type { DetailsExpenseProps } from '../interfaces/interfacesComponents'
import { getCookie } from '../services/cookiesService'
import {  formatDateShow, formatValue } from '../utils/utils'
import CreditCard from './creditCard'
import PaperMoney from './paperMoney'
import Button from './ui/button'


function DetailsExpense(props: DetailsExpenseProps){
    const {nameExpense,
           telephone,
           amount,
           dateExpense,
           paymentMethod,
           description,
           category,
           idExpense,
           typeExpense} = props
    
    const onClickFather = async () =>{
        console.log(idExpense)
    }



    const methodPaymentShow = () =>{
        if(paymentMethod == 'Cartão de crédito' || paymentMethod == 'Cartão de debito'){
            return(
                <CreditCard name={getCookie('user_name') || ''}
                            telephone={telephone} />
            )
        } else{
            return(
                <PaperMoney value={100}
                            typeMoney={ paymentMethod == 'Físico' ? 'Físico' : 'Pix'} />
            )
        }
    }

    return(
        <>
            <div className="rounded-[29px] w-full h-full flex-1 bg-linear-to-tl from-white/50 via-black to-white/50 p-px ">
                <div className="w-full h-full px-4 flex flex-col  backdrop-blur-3xl  rounded-[28px] overflow-auto bg-cover  bg-center bg-no-repeat" style={{backgroundImage: `url("${backgroundDetailsExpense}")`}}>
                    <div className='flex pt-5 '>
                        <div className='bg-[#D9D9D9] w-16 h-16 rounded-2xl flex justify-center items-center'>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-9">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
                            </svg>
                        </div>
                        <div className='flex flex-col pl-3'>
                            <h1 className='text-white font-normal text-2xl'>
                                {nameExpense}
                            </h1>
                            <h3 className='text-white font-light text-sm '>
                                {category}
                            </h3>
                        </div>
                    </div>

                    <div className='flex pt-5 pb-5'>
                        <h3 className='text-white font-light text-base leading-none'>
                            {description}.
                        </h3>
                    </div>

                    <div className='border-b border-white/30'>
                    </div>

                    <div className='flex items-baseline pt-1 pb-2'>
                        <h3 className='text-2xl text-white font-light'>
                            R$
                        </h3>
                        <h1 className='text-white text-[32px] font-normal pl-1'>
                            {formatValue(amount)}
                        </h1>
                    </div>

                    <div className='border-b border-white/30'>
                    </div>

                    <div className='flex pt-2 pb-2 justify-between items-baseline'>
                        <h3 className='text-base text-white font-light'>
                            Data do {typeExpense ? 'pagamento' : 'recebimento'}:
                        </h3>
                        <h1 className='text-white text-lg font-normal '>
                            {formatDateShow(dateExpense)}
                            
                        </h1>
                    </div>

                    <div className='border-b border-white/30'>
                    </div>

                    <div className='flex pt-2 pb-5 justify-between items-baseline'>
                        <h3 className='text-base text-white font-light'>
                            {typeExpense ? 'Pagamento' : 'Recebimento'} via:
                        </h3>
                        <h1 className='text-white text-lg font-normal '>
                            {paymentMethod}
                        </h1>
                    </div>

                    {methodPaymentShow()}
                    
                    

                    <div className='flex w-full items-center justify-center mt-auto pb-3 pt-4'>
                        <Button type='edit-expense'
                                onClickButtonChildren={onClickFather} />
                    </div>

                </div>
            </div>
        </>
    )
}


export default DetailsExpense