import { useState } from "react"
import Button from "./ui/button"
import Input from "./ui/input"
import type { ForgetPasswordFirstStepProps } from "../interfaces/interfacesComponents"
import { useRecoveryPassword } from "../hooks/useAuth"


function ForgetPasswordFirstStep(props: ForgetPasswordFirstStepProps){
    const {setEmailToRecovery, setFirstStepIsOk} = props
    const [emailTyped, setEmailTyped] = useState<string | null>(null)
    const {requestVerifyCode, loading} = useRecoveryPassword()
    const [isError, setIsError] = useState(false)
    const [typeError, setTypeError] = useState('')


    const onChangeInputFatherEmail = (value: string) => {
        setEmailTyped(value)
        setEmailToRecovery(value)
        setIsError(false)
        setTypeError('')
    }

    const onClickFather = async () => {
        setFirstStepIsOk(false)
        try{
            if(emailTyped != null){
                const result = await requestVerifyCode(emailTyped)
                if(result){
                    setFirstStepIsOk(true)
                }
            } else{
                setIsError(true)
            }
        } catch(err: any){
            console.log(err.response.data.detail)
            if(err.response.data.detail == 'user not found' ){
                setTypeError('not user')
            } else if(err.response.data.detail == 'error in sending code of verification'){
                setTypeError('error in back')
            }
            setIsError(true)
        }

    }

    return(
            <>
                <div className="flex flex-col min-w-80 mt-4 justify-center items-center rounded-[40px] bg-white/5 backdrop-blur-2xl">
                    <h1 className="text-white font-medium text-[28px] mt-4">
                        Redefinir senha
                    </h1>
                    <div className="flex-col w-full flex justify-start mr-auto mt-4 px-3">
                        <div>
                            <h1 className="text-white font-light text-sm pb-1">
                                E-mail:
                            </h1>
                            <Input onChangeInputChildren={onChangeInputFatherEmail} 
                                   type="email"/>
                            {isError && typeError == 'not user' ?  (
                                <p className="text-red-400 text-xs mt-1 pl-2">Nenhuma conta encontrada com esse email</p>
                            ) : null}
                            {isError && typeError == 'error in back' ?  (
                                <p className="text-red-400 text-xs mt-1 pl-2">Houve um erro ao processar o pedido</p>
                            ) : null}
                            {isError && typeError == 'email invalid' ?  (
                                <p className="text-red-400 text-xs mt-1 pl-2">Por favor insira um email válido.</p>
                            ) : null}
                        </div>
                        
                    </div>
                    <div className="w-44 mt-5 mb-4">
                        
                        <Button onClickButtonChildren={onClickFather}
                                type="next_create"
                                loading={loading} />
                    </div>
                    
                    
                </div>
            </>
        )
}


export default ForgetPasswordFirstStep