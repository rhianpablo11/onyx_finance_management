import type { CreditCardProps } from "../interfaces/interfacesComponents"



function CreditCard(props: CreditCardProps){
    const {name, telephone} = props

    return(
        <>
            <div className="flex rounded-t-[20px] justify-between bg-linear-to-br from-[#E4E4E4] via-[#868686] to-[#ADA9A9] w-full min-h-28">
                <div className="flex items-center pl-4">
                    <div className="bg-[#F6F6F6] flex flex-col justify-between py-2 items-center border border-[#7e7e7e] w-12 h-10 rounded-xl">
                        <div className='border-b w-full border-black/30'>
                        </div>

                        <div className='border-b w-full border-black/30'>
                        </div>

                        <div className='border-b w-full border-black/30'>
                        </div>
                    </div>
                    <div>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path xmlns="http://www.w3.org/2000/svg" d="M8.96201 8.28783C9.94638 9.27237 10.4994 10.6076 10.4994 11.9998C10.4994 13.3921 9.94638 14.7273 8.96201 15.7118M12.144 5.10583C15.952 8.91283 15.952 15.0858 12.144 18.8938M15.326 1.92383C20.891 7.48883 20.891 16.5108 15.326 22.0758"  stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        
                    </div>
                </div>
                <div className="flex flex-col items-center justify-center pr-6">
                    <h4 className="text-white  font-medium text-base">
                        {name}
                    </h4>
                    <h4 className="text-white font-medium text-xs">
                        {telephone}
                    </h4>
                </div>
                
            </div>
            <div className='border-b inset-shadow-2xs border-white/30'>
            </div>
        </>
    )
}

export default CreditCard