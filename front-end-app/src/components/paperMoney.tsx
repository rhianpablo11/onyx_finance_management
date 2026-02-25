import waterMark from '../assets/marca dagua dinheiro.png?url'
import type { PaperMoneyProps } from '../interfaces/interfacesComponents'



function PaperMoney(props: PaperMoneyProps) {
    const {value, typeMoney} = props

    return (
        <>
            <div className="flex rounded-t-[20px] px-4 justify-between bg-linear-to-br from-[#1C1633] via-[#443888] to-[#1C1633] w-full min-h-28">
                <div className="flex flex-col justify-center items-center">
                    <h1 className="text-white font-bold text-3xl leading-none">
                        {value}
                    </h1>
                    <h1 className="text-white font-normal text-xl leading-none">
                        REAIS
                    </h1>
                </div>
                <div className='flex justify-center items-center'>
                    <img src={waterMark}
                         className="inset-0 w-full h-full items-center justify-center p-0 m-0 object-cover opacity-40">
                    </img>
                </div>
                <div className="flex flex-col items-center justify-center">
                    <h1 className="text-white font-normal text-xl leading-none">
                        Dinheiro
                    </h1>
                    <h1 className="text-white text-xl font-bold leading-none">
                        {typeMoney}
                    </h1>
                </div>
            </div>
            <div className='border-b border-white/30'>
            </div>
        </>
    )
}

export default PaperMoney