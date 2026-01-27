// component for get password in second step of register

import { useState } from "react"
import Button from "./ui/button"
import Input from "./ui/input"
import { useCreateAccount } from "../hooks/useCreateAccount"
import { useNavigate } from "react-router-dom"
import type { SecondStepRegisterProps } from "../interfaces/interfacesComponents"

function SecondStepRegister(props: SecondStepRegisterProps){
    const {name, email, telephone} = props
    const navigate = useNavigate()
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const {loading, createAccount} = useCreateAccount()
    const onChangeInputFatherPassword = (value: string) => {
        console.log(value)
        setPassword(value)
    }

    const onChangeInputFatherConfirmPassowrd = (value: string) => {
        console.log(value)
        setConfirmPassword(value)
    }

    

    const onClickFather = async (buttonClicked:string) =>{
        console.log(buttonClicked)
        try{
            await createAccount(email, name, password, telephone)
            console.log('deu bom')
            navigate('/dashboard')
        } catch(err){
            console.log('deu erro')
            console.error('falha')
        }
    }


    return(
        <>
            <div className="flex flex-col justify-center items-center rounded-[40px] bg-white/5 backdrop-blur-2xl">
                <h1 className="text-white font-medium text-[32px] mt-7">
                    Cadastro
                </h1>
                <div className="flex-col w-full flex justify-start mr-auto mt-7 px-3">
                    <div>
                        <h1 className="text-white font-light text-sm pb-1">
                            Senha:
                        </h1>
                        <Input onChangeInputChildren={onChangeInputFatherPassword} 
                               type="password"/>
                    </div>
                    <div>
                        <h1 className="text-white font-light text-sm pt-2 pb-1">
                            Confirme a senha:
                        </h1>
                        <Input  onChangeInputChildren={onChangeInputFatherConfirmPassowrd} 
                                type="password"/>
                    </div>
                </div>
                <div className="w-44 mt-8 mb-9">
                    <Button onClickButtonChildren={onClickFather}
                            type="create"/>
                </div>
            </div>
        </>
    )
}

export default SecondStepRegister