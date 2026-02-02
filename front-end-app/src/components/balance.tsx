// component for show monthly balance in initial page
import backgroundBalance from '../assets/bg-balance2.svg?url'
import type { BalanceProps } from '../interfaces/interfacesComponents'

function Balance(props: BalanceProps){
    const {value, legend, incoming, balanceGeral} = props

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
                            <h1 className="text-white text-end font-extralight text-xs pt-2">
                                {incoming ? '/>' : '>'} {legend}
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