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
    const [passwordsMatch, setPasswordsMatch] = useState(true)
    const [confirmPassword, setConfirmPassword] = useState('')
    const {loading, createAccount} = useCreateAccount()
    const onChangeInputFatherPassword = (value: string) => {
        setPassword(value)
        setPasswordsMatch(true)
        if(confirmPassword != value){
            setPasswordsMatch(false)
        }
    }

    const onChangeInputFatherConfirmPassowrd = (value: string) => {
        setConfirmPassword(value)
        setPasswordsMatch(true)
        if(value != password){
            setPasswordsMatch(false)
            console.log('kafo')
        }
    }

    

    const onClickFather = async (buttonClicked:string) =>{
        console.log(buttonClicked)
        console.log('afafa' + passwordsMatch)
        try{
            if(passwordsMatch){
                await createAccount(email, name, password, telephone)
                console.log('deu bom')
                navigate('/dashboard')
            }
            setPasswordsMatch(false)
            
        } catch(err){
            console.log('deu erro')
            console.error('falha')
        }
    }


    return(
        <>
            <div className="flex flex-col justify-center items-center rounded-[40px] bg-white/5 backdrop-blur-2xl">
                <h1 className="text-white font-medium text-[32px] mt-2">
                    Cadastro
                </h1>
                <div className="flex-col w-full flex justify-start mr-auto mt-4 px-3">
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
                        {!passwordsMatch && (
                            <p className="text-red-400 text-xs mt-1 pl-2">As senhas não são iguais!</p>
                        )}
                    </div>
                </div>
                <div className="w-44 mt-5 mb-4">
                    <Button onClickButtonChildren={onClickFather}
                            type="create"
                            loading={loading} />
                </div>
            </div>
        </>
    )
}

export default SecondStepRegister