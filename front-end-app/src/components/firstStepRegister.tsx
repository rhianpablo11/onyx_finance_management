// first data received for register

import { useState } from "react"
import Button from "./ui/button"
import Input from "./ui/input"
import type { FirstStepRegisterProps } from "../interfaces/interfacesComponents"
import { useCreateAccount } from "../hooks/useCreateAccount"


function FirstStepRegister(props: FirstStepRegisterProps){
    const {changeStatus, sendInfoInitialUser} = props
    const {loading, verifyUser} = useCreateAccount()
    const [email, setEmail] = useState('')
    const [name, setName] = useState('')
    const [telephone, setTelephone] = useState('')
    const [emailIsValid, setEmailIsValid] = useState(true)
    const [telephoneIsValid, setTelephoneIsValid] = useState(true)
    const [inputsFilled, setInputsFilleds] = useState(true)

    const onChangeInputFatherEmail = (value: string) => {
        console.log(loading)
        setEmail(value)
        setEmailIsValid(true)
        setInputsFilleds(true)
    }

    const onChangeInputFatherName = (value: string) => {
        setName(value)
        setInputsFilleds(true)
    }

    const onChangeInputFatherTelephone = (value: string) => {
        setTelephone(value)
        setTelephoneIsValid(true)
        setInputsFilleds(true)
    }

    const onClickFather = async (buttonClicked:string) =>{
        console.log(buttonClicked)
        try{
            if(email == '' || name == '' || telephone == ''){
                setInputsFilleds(false)
            } else{
                await verifyUser(email, telephone)
                sendInfoInitialUser({email, name, telephone})
                changeStatus(true)
            }
            
        } catch(err: any){
            
            const errorMsg = err.response.data.detail
            if(errorMsg == 'Email already in database'){
                setEmailIsValid(false)
            } else if(errorMsg == 'telephone alredy in database'){
                setTelephoneIsValid(false)
            }
            changeStatus(false)
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
                        {!inputsFilled && (
                            <p className="text-red-400 text-xs mt-3 pl-2">Há campos vazios, por favor preencha antes de avançar!</p>
                        )}
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


export default FirstStepRegister