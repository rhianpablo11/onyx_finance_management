// component for show monthly balance in initial page
import backgroundBalance from '../assets/bg-balance2.svg?url'
import type { BalanceProps } from '../interfaces/interfacesComponents'
import { AnimatedCounter } from './ui/animatedCounter'
import SkeletonLoader from './ui/skeletonLoader'

function Balance(props: BalanceProps){
    const {value, legend, incoming, balanceGeral, loading = false} = props

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
            <div className='rounded-[29px] mb-3.5 bg-linear-to-tl from-white/30 via-black to-white/70 p-px'>
                <div className="flex-col  px-4 pt-4 rounded-[28px] min-h-48 bg-cover bg-center bg-no-repeat" style={{backgroundImage: `url("${backgroundBalance}")`}}>
                    <div className=" flex-col rounded-4xl">
                        <h1 className="text-white font-extralight text-xl">
                            Saldo do mês:
                        </h1>
                        <div className="flex-col justify-end pt-1">
                            {loading ? (
                                <div className="flex justify-end items-baseline h-12">
                                    <h1 className="text-white text-end font-extralight text-2xl">
                                        R$
                                    </h1>
                                    <SkeletonLoader className="h-8/10 w-30" />
                                </div>
                            ) : (
                                <>
                                    <div className='flex items-baseline justify-end'>
                                        <h1 className='text-white text-end font-thin text-2xl pr-2'>
                                            R$
                                        </h1>
                                        <h1 className="text-white text-end font-extralight text-[44px]">
                                            <AnimatedCounter value={value} duration={800}/> 
                                        </h1>
                                    </div>
                                </>)}
                            
                                {loading ? (
                                        <div className='flex justify-end mt-2 h-4'>
                                            <SkeletonLoader className=" w-30 mb-2" />
                                        </div>
                                    ) : (
                                        <>
                                            <h1 className="flex justify-end text-white text-end font-extralight text-xs">
                                                {incoming ? upIcon : downIcon} {legend}
                                            </h1>
                                        </>
                                        
                                    )}
                            
                        </div>
                    </div>
                    <div className='flex-col flex pb-3'>
                        <h1 className="text-white font-extralight text-base">
                            Saldo geral:
                        </h1>
                        <div className='justify-end pt-1'>
                            {loading ? (
                                <div className="flex justify-end items-baseline h-6">
                                    <h1 className="text-white text-end font-extralight text-2xl">
                                        R$
                                    </h1>
                                    <SkeletonLoader className="h-8/10 w-30 mb-2" />
                                </div>
                            ): (
                                <h1 className="text-white text-end font-extralight text-2xl">
                                    R$ <AnimatedCounter value={balanceGeral} duration={800}/> 
                                </h1>
                            )}
                            
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}


export default Balance