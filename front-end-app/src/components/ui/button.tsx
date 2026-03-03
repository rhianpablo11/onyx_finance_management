// code for buttons login, create account, etc -> external interface
import backgroundButtonSend from '../../assets/bg-buttonChat.svg?url'
import type { ButtonProps } from '../../interfaces/interfacesComponents'
import LoadingSpinner from './loadingSpinner'

function Button(props: ButtonProps){
    const {type, onClickButtonChildren, nameConfig, loading=false} = props

    if(type == 'login'){
        return(
            <>
                <button onClick={() => onClickButtonChildren('')}
                        className={`bg-[#D9D9D9] hover:bg-[#888888] flex justify-center items-center rounded-[40px] h-13 w-full ${loading ? 'bg-[#555555] cursor-not-allowed' : ''}`}
                        disabled={loading} >
                    {loading ? (
                        <>
                            <h1 className="font-medium text-xl text-black">
                                Entrando
                            </h1>
                            <div className='ml-2 text-black'>
                                <LoadingSpinner />
                            </div>
                            
                        </>
                        ) : (
                            <h1 className="font-medium text-xl text-black">
                                Entrar
                            </h1>
                        )}
                </button>
            </>
        )
    } else if(type == 'login-biometric'){
        return(
            <>
                <button onClick={() => onClickButtonChildren('')}
                        className="bg-[#D9D9D9] px-3 hover:bg-[#888888] flex justify-center items-center rounded-[40px] h-10 w-full">
                    {loading ? (
                        <>
                            <h1 className="font-medium text-xl text-black">
                                Entrando
                            </h1>
                            <div className='ml-2 text-black'>
                                <LoadingSpinner />
                            </div>
                            
                        </>
                    ) : (
                        <>
                        <h1 className="font-medium text-base text-black">
                            Entrar com biometria
                        </h1>
                        <div className='ml-2'>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M7.864 4.243A7.5 7.5 0 0 1 19.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 0 0 4.5 10.5a7.464 7.464 0 0 1-1.15 3.993m1.989 3.559A11.209 11.209 0 0 0 8.25 10.5a3.75 3.75 0 1 1 7.5 0c0 .527-.021 1.049-.064 1.565M12 10.5a14.94 14.94 0 0 1-3.6 9.75m6.633-4.596a18.666 18.666 0 0 1-2.485 5.33" />
                            </svg>
                        </div>
                        </>
                    )}
                    
                </button>
            </>
        )
    } else if(type == 'next_create'){
        return(
            <>
                <button onClick={() => onClickButtonChildren('')}
                        disabled={loading}
                        className={`bg-[#D9D9D9] hover:bg-[#888888] flex justify-center items-center rounded-[40px] h-13 w-full ${loading ? 'bg-[#555555] cursor-not-allowed' : ''}`}>
                    {loading ? (
                        <>
                            <h1 className="font-medium text-xl text-black">
                                Verificando
                            </h1>
                            <div className='ml-2 text-black'>
                                <LoadingSpinner />
                            </div>
                            
                        </>
                        ) : (
                            <h1 className="font-medium text-xl text-black">
                                Avançar
                            </h1>
                        )}
                </button>
            </>
        )
    } else if(type == 'create'){
        return(
            <>
                <button onClick={() => onClickButtonChildren('')}
                        disabled={loading}
                        className={`bg-[#D9D9D9] hover:bg-[#888888] flex justify-center items-center rounded-[40px] h-13 w-full ${loading ? 'bg-[#555555] cursor-not-allowed' : ''}`}>
                        {loading ? (
                            <>
                                <h1 className="font-medium text-xl text-black">
                                    Criando a conta
                                </h1>
                                <div className='ml-2 text-black'>
                                    <LoadingSpinner />
                                </div>
                                
                            </>
                            ) : (
                                <h1 className="font-medium text-xl text-black">
                                    Criar Conta
                                </h1>
                            )}
                </button>
            </>
        )
    } else if(type == 'create account'){
        return(
            <>
                <button onClick={() => onClickButtonChildren('')}
                        className="bg-[#D9D9D9] flex justify-center items-center rounded-[40px] h-14 w-full">
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
                        className="bg-[#35333F]/65 flex justify-center items-center rounded-[40px] h-14 w-full">
                    <h1 className="font-medium text-xl text-white">
                        Login
                    </h1>
                </button>
            </>
        )
    } else if(type == 'edit-account'){
        return(
            <>
                <button onClick={() => onClickButtonChildren('')}
                        className="text-white/10"
                        disabled={true} >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                    </svg>

                </button>
            </>
        )
    } else if(type == 'list-config'){
        if(nameConfig){
            return(
                <>
                    <button onClick={() => onClickButtonChildren(nameConfig)}
                            className="text-white">
                        <div className="flex w-full h-full py-5 items-center ml-4">
                            <h1 className="text-white font-normal text-base">
                                {nameConfig}
                            </h1>
                            <div className="text-white ml-auto mr-10">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" />
                                </svg>
                            </div>
                        </div>

                    </button>
                </>
            )
        }
        
    } else if(type == 'edit-expense'){
        return(
            <>
                <button disabled={true}
                        onClick={() => onClickButtonChildren('')}
                        className="bg-[#888888] px-3 hover:bg-[#888888] flex justify-center items-center rounded-[40px] h-10 w-full max-w-44">
                        
                        <h1 className="font-normal text-sm text-black">
                            Editar movimentação
                        </h1>
                        
                </button>
            </>
        )
    } else{
        return(
                <>
                    <div className='rounded-[33px] flex-1 bg-linear-to-tl from-white/50 via-black to-white/50 p-px'>
                        <button onClick={() => onClickButtonChildren('')}
                                className="w-16 h-16 rounded-4xl flex justify-center items-center bg-cover bg-no-repeat bg-center " style={{backgroundImage: `url("${backgroundButtonSend}")`}}
                                 >
                            <svg width="56" height="56" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M38.5715 18.8115L14.5965 26.252C8.90426 28.0139 8.82294 36.0372 14.4745 37.921L21.0612 40.1166C22.8908 40.7265 24.3274 42.1631 24.9373 43.9927L27.1329 50.5794C29.0167 56.231 37.0265 56.1361 38.8019 50.4574L46.2424 26.4824C47.7062 21.766 43.2879 17.3477 38.5715 18.8115Z" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </button>
                    </div>
                </>
            )
    }

    


    


    

}


export default Button