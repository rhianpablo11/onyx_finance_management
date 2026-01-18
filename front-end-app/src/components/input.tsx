// component for input of chat page and login/sign up
import backgroundInputChat from '../assets/bg-input-chat-ia.svg?url'


function Input(){

    return(
        <>
            <div className="flex h-24 rounded-[28px] bg-cover bg-center bg-no-repeat" style={{backgroundImage: `url("${backgroundInputChat}")`}}>
                <textarea 
                    placeholder='Descreva aqui o seu gasto, ou recebimento, para poder ser adicionado!'
                    className='text-white rounded-[28px] p-3 w-full h-full backdrop-blur-2xl text-left font-extralight text-sm focus:outline-none resize-none  placeholder:text-white/50 '
                    >
                </textarea>
            </div>
        </>
    )
}

export default Input