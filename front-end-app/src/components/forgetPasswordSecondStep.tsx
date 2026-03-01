import { useState } from "react"
import { useRecoveryPassword } from "../hooks/useAuth"
import type { ForgetPasswordSecondStepProps } from "../interfaces/interfacesComponents"
import Button from "./ui/button"
import Input from "./ui/input"


function ForgetPasswordSecondStep(props: ForgetPasswordSecondStepProps){
    const {setSecondStepIsOk, email} = props
    const {verifyCodeOfRecovery, loading} = useRecoveryPassword()
    const [otpCode, setOtpCode] = useState('')
    const [isError, setIsError] = useState(false)
    const [typeError, setTypeError] = useState('')

    const onChangeInputFatherEmail = (value: string) => {
        console.log(value)
        setOtpCode(value)
    }

    const onClickFather = async () => {
        try{
            setSecondStepIsOk(false)
            if(otpCode.length>=6){
                const result = await verifyCodeOfRecovery(email, otpCode)
                if(result){
                    setSecondStepIsOk(true)
                }
            } else{
                setIsError(true)
            } 
        } catch(err: any){
            if(err.response.data.detail == 'otp code expires'){
                setTypeError('code expires')
            } else if(err.response.data.detail == 'otp code expires' ){
                setTypeError('otp code invalid')
            } else{
                setTypeError('generic')
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
                                Insira o código enviado ao email:
                            </h1>
                            <Input onChangeInputChildren={onChangeInputFatherEmail} 
                                   type="otpCode"
                                   isError={isError} />
                            {isError && typeError == 'code expires' ?  (
                                <p className="text-red-400 text-xs mt-1 pl-2">O código expirou</p>
                            ) : null}
                            {isError && typeError == 'otp code invalid' ?  (
                                <p className="text-red-400 text-xs mt-1 pl-2">O código inserido está incorreto</p>
                            ) : null}
                            {isError && typeError == 'generic' ?  (
                                <p className="text-red-400 text-xs mt-1 pl-2">Houve um erro na validação do código</p>
                            ) : null}
                            {isError && typeError == 'code not preenchido' ?  (
                                <p className="text-red-400 text-xs mt-1 pl-2">Preencha o código antes de prosseguir</p>
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


export default ForgetPasswordSecondStep