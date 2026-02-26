import { useEffect, useState } from "react"
import { useCreateAccount } from "../hooks/useCreateAccount"
import type { VerifyEmailRegisterProps } from "../interfaces/interfacesComponents"
import Button from "./ui/button"
import Input from "./ui/input"


function VerifyEmailRegister(props: VerifyEmailRegisterProps){
    const {setOtpCodeUser, setIsAuthorizedNextAfterOTP, email} =  props
    const {loading, error, verifyOtpCode, requestNewOtpCode} = useCreateAccount()
    const [otpCodeIn, setOtpCodeIn] = useState('')
    const [inputNotComplete, setInputNotComplete] = useState(true)
    const [isError, setIsError] = useState(false)
    const [isDisabledButtonNewCode, setIsDisabledButtonNewCode] = useState(true)
    const [timeLeft, setTimeLeft] = useState(120)

    const onChangeInputFatherOtpCode = (otpCode: string) =>{
        console.log(otpCode)
        setOtpCodeIn(otpCode)
        setOtpCodeUser(otpCode)   
        setIsError(false)
        setInputNotComplete(false)
        
    }

    const handleNewRequestOtpCode = async () =>{
        if(email != undefined){
            await requestNewOtpCode(email)
            setTimeLeft(120)
            setIsDisabledButtonNewCode(true)
        } else{
            setIsError(true)
        }
    }

    const onClickFather = async () =>{
        console.log('cliquei')
        try{
            if(otpCodeIn.length < 6 || email == undefined){
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


    useEffect(()=>{
        if(timeLeft <=0 ){
            setIsDisabledButtonNewCode(false)
            return
        }

        const timerId = setInterval(()=>{
            setTimeLeft((previousTime)=> previousTime - 1)
        }, 1000)


        return ()=> clearInterval(timerId)
    },[timeLeft])

    
    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0')
        const s = (seconds % 60).toString().padStart(2, '0')
        return `${m}:${s}`
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
                                       type="otpCode"
                                       isError={isError} />
                            </div>
                            <div className="flex items-baseline pt-2">
                                <h1 className="text-white/50 font-normal text-xs">
                                    Aguarde {formatTime(timeLeft)} min para 
                                </h1>
                                <button disabled={isDisabledButtonNewCode}
                                        onClick={handleNewRequestOtpCode}
                                        className={`${isDisabledButtonNewCode ? 'text-white/50' : 'text-white/80'} font-semibold text-xs pl-1 underline`}>
                                    pedir um novo código.
                                </button>
                            </div>
                            {isError && (
                                <p className="text-red-400 text-xs mt-1 pl-2">Código OTP invalido!</p>
                            )}
                            {isError && inputNotComplete ? (
                                <p className="text-red-400 text-xs mt-1 pl-2">Código não preenchido completamente!</p>
                            ): null}
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