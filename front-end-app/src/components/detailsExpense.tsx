import backgroundDetailsExpense from '../assets/Group 8.svg?url'
import type { DetailsExpenseProps } from '../interfaces/interfacesComponents'
import CreditCard from './creditCard'
import Button from './ui/button'


function DetailsExpense(props: DetailsExpenseProps){
    const {nameUser, nameExpense, telephone, amount, dateExpense, paymentMethod, description, category, idExpense} = props

    const onClickFather = async (buttonClicked:string) =>{
        console.log(buttonClicked)
        
    }

    return(
        <>
            <div className="rounded-[29px] w-full h-full flex-1 bg-linear-to-tl from-white/50 via-black to-white/50 p-px">
                <div className="w-full h-full px-4 flex flex-col  backdrop-blur-3xl  rounded-[28px] overflow-hidden bg-auto  bg-center bg-no-repeat" style={{backgroundImage: `url("${backgroundDetailsExpense}")`}}>
                    <div className='flex pt-7 '>
                        <div className='bg-[#D9D9D9] w-16 h-16 rounded-2xl'>

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
                            {description}
                        </h3>
                    </div>

                    <div className='border-b border-white/30'>
                    </div>

                    <div className='flex items-baseline pt-1 pb-2'>
                        <h3 className='text-2xl text-white font-light'>
                            R$
                        </h3>
                        <h1 className='text-white text-[32px] font-normal pl-1'>
                            {amount}
                        </h1>
                    </div>

                    <div className='border-b border-white/30'>
                    </div>

                    <div className='flex pt-2 pb-2 justify-between items-baseline'>
                        <h3 className='text-base text-white font-light'>
                            Data do pagamento:
                        </h3>
                        <h1 className='text-white text-lg font-normal '>
                            {dateExpense}
                        </h1>
                    </div>

                    <div className='border-b border-white/30'>
                    </div>

                    <div className='flex pt-2 pb-5 justify-between items-baseline'>
                        <h3 className='text-base text-white font-light'>
                            Pagamento via:
                        </h3>
                        <h1 className='text-white text-lg font-normal '>
                            {paymentMethod}
                        </h1>
                    </div>

                    <CreditCard name={nameUser}
                                telephone={telephone} />

                    <div className='flex w-full items-center justify-center fixed bottom-5 right-0'>
                        <Button type='edit-expense'
                                onClickButtonChildren={onClickFather} />
                    </div>

                </div>
            </div>
        </>
    )
}


export default DetailsExpense