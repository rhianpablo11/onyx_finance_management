// code for buttons login, create account, etc -> external interface
import backgroundButtonSend from '../../assets/bg-input-chat-ia.svg?url'
import type { ButtonProps } from '../../interfaces/interfacesComponents'

function Button(props: ButtonProps){
    const {type, onClickButtonChildren} = props

    if(type == 'login'){
        return(
            <>
                <button onClick={() => onClickButtonChildren('')}
                        className="bg-[#D9D9D9] hover:bg-[#888888] flex justify-center items-center rounded-[40px] h-13 w-full">
                    <h1 className="font-medium text-xl text-black">
                        Entrar
                    </h1>
                </button>
            </>
        )
    } else if(type == 'create account'){
        return(
            <>
                <button onClick={() => onClickButtonChildren('')}
                        className="bg-[#D9D9D9] flex justify-center items-center rounded-[40px] h-16 w-full">
                    <h1 className="font-medium text-xl text-black">
                        Criar Conta
                    </h1>
                </button>
            </>
        )
    } else if(type == 'sign in'){
        return(
            <>
                <button onClick={() => onClickButtonChildren('')}
                        className="bg-[#35333F]/65 flex justify-center items-center rounded-[40px] h-16 w-full">
                    <h1 className="font-medium text-xl text-white">
                        Login
                    </h1>
                </button>
            </>
        )
    } else{
        return(
                <>
                    <button className="w-16 h-16 rounded-4xl flex justify-center items-center bg-contain bg-center " style={{backgroundImage: `url("${backgroundButtonSend}")`}}>
                        <svg width="56" height="56" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M38.5715 18.8115L14.5965 26.252C8.90426 28.0139 8.82294 36.0372 14.4745 37.921L21.0612 40.1166C22.8908 40.7265 24.3274 42.1631 24.9373 43.9927L27.1329 50.5794C29.0167 56.231 37.0265 56.1361 38.8019 50.4574L46.2424 26.4824C47.7062 21.766 43.2879 17.3477 38.5715 18.8115Z" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                </>
            )
    }

    


    


    

}


export default Button