// first data received for register

import { useState } from "react"
import Button from "./ui/button"
import Input from "./ui/input"
import type { FirstStepRegisterProps } from "../interfaces/interfacesComponents"
import { useCreateAccount } from "../hooks/useCreateAccount"


function FirstStepRegister(props: FirstStepRegisterProps){
    const {changeStatus, sendInfoInitialUser} = props
    const {loading, verifyUser, error} = useCreateAccount()
    const [email, setEmail] = useState('')
    const [name, setName] = useState('')
    const [telephone, setTelephone] = useState('')
    const [emailIsValid, setEmailIsValid] = useState(true)
    const [telephoneIsValid, setTelephoneIsValid] = useState(true)

    const onChangeInputFatherEmail = (value: string) => {
        console.log(value)
        setEmail(value)
        setEmailIsValid(true)
    }

    const onChangeInputFatherName = (value: string) => {
        console.log(value)
        setName(value)
    }

    const onChangeInputFatherTelephone = (value: string) => {
        console.log(value)
        setTelephone(value)
        setTelephoneIsValid(true)
    }

    const onClickFather = async (buttonClicked:string) =>{
        console.log(buttonClicked)
        try{
            await verifyUser(email, telephone)
            sendInfoInitialUser({email, name, telephone})
            changeStatus(true)
        } catch(err){
            console.log('oi ' + error)
            if(error == 'Email already in database'){
                setEmailIsValid(false)
            } else if(error == 'telephone alredy in database'){
                setTelephoneIsValid(false)
            }
            changeStatus(false)
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
                            E-mail:
                        </h1>
                        <Input onChangeInputChildren={onChangeInputFatherEmail} 
                               type="email"/>
                        {!emailIsValid && (
                            <p className="text-red-400 text-xs mt-1 pl-2">E-mail ja presente no sistema!</p>
                        )}
                    </div>
                    <div>
                        <h1 className="text-white font-light text-sm pt-2 pb-1">
                            Nome:
                        </h1>
                        <Input  onChangeInputChildren={onChangeInputFatherName} 
                                type="name"/>
                    </div>
                    <div>
                        <h1 className="text-white font-light text-sm pt-2 pb-1">
                            Telefone:
                        </h1>
                        <Input  onChangeInputChildren={onChangeInputFatherTelephone} 
                                type="telephone"/>
                        {!telephoneIsValid && (
                            <p className="text-red-400 text-xs mt-1 pl-2">Telefone ja presente no sistema!</p>
                        )}
                    </div>
                </div>
                <div className="w-44 mt-8 mb-9">
                    <Button onClickButtonChildren={onClickFather}
                            type="next_create"/>
                </div>
            </div>
        </>
    )
}


export default FirstStepRegister