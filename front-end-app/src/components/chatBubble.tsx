// component for show response formated of IA 

import type { ChatBubbleProps } from "../interfaces/interfacesComponents"

function ChatBubble(props: ChatBubbleProps){
    const {isSentMessage, name, text} = props
    
    if(isSentMessage){
        return (
            <>
                <div className="flex flex-col ml-auto items-end w-8/10">
                    <div className="pr-5 pb-1">
                        <h1 className="text-[#8E8D94] font-extralight text-xs">
                            {name}
                        </h1>
                    </div>
                    

                    <div className="bg-[#151515] shadow-white/10 shadow-md  text-white p-3.5 rounded-4xl rounded-br-none ">
                        <div className="space-y-1">
                            <p className="pl-2 font-light text-base leading-tight mb-2">
                                {text}
                            </p>
                        </div>
                    </div>
                    

                </div>
            </>
        )
    } else{
        return (
            <>
                <div className="flex flex-col items-start w-8/10">
                    <div className="pl-7 pb-1">
                        <h1 className="text-[#8E8D94] font-extralight text-xs">
                            ChatBot - by Gemini
                        </h1>
                    </div>
                    <div className="relative group ">

                        <div className="bg-[#151515] shadow-white/20 shadow-md  text-white p-3.5 rounded-4xl rounded-bl-none ">
                            <div className="space-y-1">
                                <p className="pl-2 font-light text-base leading-tight mb-2">
                                    {text}
                                </p>
                                
                            </div>
                        </div>

                        <div className="absolute bottom-0 -left-4.5 w-5 overflow-hidden">
                        <svg
                            viewBox="0 0 20 20"
                            className="w-full h-full fill-[#151515]" // Mesma cor do background
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            {/* Essa curva cria o efeito orgânico de balão de fala */}
                            <path d="M20 0V20H0C8 20 20 12 20 0Z" />
                        </svg>
                    </div>
                    </div>

                </div>
            </>
        )
    }
    
}

export default ChatBubble