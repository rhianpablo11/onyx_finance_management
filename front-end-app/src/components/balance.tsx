// component for show monthly balance in initial page
import backgroundBalance from '../assets/bg-balance2.svg?url'
import type { BalanceProps } from '../interfaces/interfacesComponents'

function Balance(props: BalanceProps){
    const {value, legend, incoming, balanceGeral} = props

    const upIcon = (
        <>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4 mr-1">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
            </svg>
        </>
    )

    const downIcon = (
        <>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4 mr-1">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6 9 12.75l4.286-4.286a11.948 11.948 0 0 1 4.306 6.43l.776 2.898m0 0 3.182-5.511m-3.182 5.51-5.511-3.181" />
            </svg>
        </>
    )

    return(
        <>
            <div className='rounded-[29px] mb-6 bg-linear-to-tl from-white/30 via-black to-white/70 p-px'>
                <div className="flex-col  px-4 pt-4 rounded-[28px] h-48 bg-cover bg-center bg-no-repeat" style={{backgroundImage: `url("${backgroundBalance}")`}}>
                    <div className=" flex-col rounded-4xl">
                        <h1 className="text-white font-extralight text-xl">
                            Saldo do mês:
                        </h1>
                        <div className="flex-col justify-end pt-1">
                            <h1 className="text-white text-end font-extralight text-5xl">
                                R$ {value}
                            </h1>
                            <h1 className="flex justify-end text-white text-end font-extralight text-xs pt-2">
                                {incoming ? upIcon : downIcon} {legend}
                            </h1>
                        </div>
                    </div>
                    <div className='flex-col flex'>
                        <h1 className="text-white font-extralight text-base">
                            Saldo geral:
                        </h1>
                        <div className='justify-end pt-1'>
                            <h1 className="text-white text-end font-extralight text-2xl">
                                R$ {balanceGeral}
                            </h1>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}


export default Balance