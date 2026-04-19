import backgroundExtractPage from '../assets/Group 8.svg?url'
import type { FinanceComportmentProps } from '../interfaces/interfacesComponents';


function FinanceComportment(props: FinanceComportmentProps){
    const {title, description} = props


    return(
        <>
            <div className="rounded-[29px] w-full h-full flex-1 bg-linear-to-tl from-white/50 via-black to-white/50 p-px">
                <div className="w-full h-full px-3.5 py-2 flex flex-col  backdrop-blur-3xl  rounded-[28px] overflow-hidden bg-cover  bg-center bg-no-repeat" style={{backgroundImage: `url("${backgroundExtractPage}")`}}>
                    <h1 className='text-white font-normal text-2xl'>
                        {title}
                    </h1>
                    <div className={`mt-1 h-px w-full bg-linear-to-r from-violet-900/30 via-white/30 to-violet-900/30`}></div>
                    <p className='text-white font-light text-base mt-1 leading-4.5 pl-2 pb-2'>
                        {description}
                    </p>
                </div>
            </div>
        </>
    )

}

export default FinanceComportment;