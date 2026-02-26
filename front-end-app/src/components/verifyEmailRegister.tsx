import { useState } from "react"
import { useCreateAccount } from "../hooks/useCreateAccount"
import type { VerifyEmailRegisterProps } from "../interfaces/interfacesComponents"
import Button from "./ui/button"
import Input from "./ui/input"


function VerifyEmailRegister(props: VerifyEmailRegisterProps){
    const {setOtpCodeUser, setIsAuthorizedNextAfterOTP, email} =  props
    const {loading, error, verifyOtpCode} = useCreateAccount()
    const [otpCodeIn, setOtpCodeIn] = useState('')
    const [inputNotComplete, setInputNotComplete] = useState(true)

    const onChangeInputFatherOtpCode = (otpCode: string) =>{
        console.log(otpCode)
        setOtpCodeIn(otpCode)
        setOtpCodeUser(otpCode)
        
    }

    const onClickFather = async () =>{
        console.log('cliquei')
        try{
            if(otpCodeIn.length < 6 && email == undefined){
                setInputNotComplete(true)
            } else{
                setInputNotComplete(false)
                if(email != undefined){
                    const response = await verifyOtpCode(email, otpCodeIn)
                    if(response){
                        setIsAuthorizedNextAfterOTP(true)
                    } else{
                        setIsAuthorizedNextAfterOTP(false)
                    }
                }
            }
        } catch{
            setIsAuthorizedNextAfterOTP(false)
        }
        
    }

    return(
        <>
                    <div className="flex flex-col justify-center items-center rounded-[40px] bg-white/5 backdrop-blur-2xl">
                        <h1 className="text-white font-medium text-[32px] mt-2">
                            Cadastro
                        </h1>
                        <div className="flex-col w-full flex justify-start mr-auto mt-4 px-3">
                            <div className="w-full flex flex-col">
                                <h1 className="text-white font-light text-sm pb-1">
                                    Insira o codigo enviado no email:
                                </h1>
                                <Input onChangeInputChildren={onChangeInputFatherOtpCode} 
                                       type="otpCode"/>
                            </div>
                            <div className="flex items-baseline pt-2">
                                <h1 className="text-white font-normal text-xs">
                                    Aguarde 2:00 min para pedir um novo código.
                                </h1>
                                <button className="text-white font-semibold text-xs pl-1">
                                    Enviar novo código.
                                </button>
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


export default VerifyEmailRegister