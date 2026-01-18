// component for show monthly balance in initial page
import backgroundBalance from '../assets/bg-balance.svg?url'

function Balance(){
    
    return(
        <>
            <div className='rounded-[29px] mt-6 bg-linear-to-b from-white/30 to-transparent p-px'>
                <div className="flex-col  px-4 pt-4 rounded-[28px] h-48 bg-cover bg-center bg-no-repeat" style={{backgroundImage: `url("${backgroundBalance}")`}}>
                    <div className=" flex-col rounded-4xl">
                        <h1 className="text-white font-extralight text-xl">
                            Saldo do mês:
                        </h1>
                        <div className="flex-col justify-end pt-1">
                            <h1 className="text-white text-end font-extralight text-5xl">
                                R$ 50.000,00
                            </h1>
                            <h1 className="text-white text-end font-extralight text-xs pt-2">
                                10% em relação ao mês anterior
                            </h1>
                        </div>

                    </div>
                </div>
            </div>
        </>
    )
}


export default Balance