// component for login feature

import { useState } from "react"
import Button from "./ui/button"
import Input from "./ui/input"
import { useLogin } from "../hooks/useAuth"




function Login(){
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const {login, loading, error} = useLogin()
    const onChangeInputFatherEmail = (value: string) => {
        console.log(value)
        setEmail(value)
    }

    const onChangeInputFatherPassword = (value: string) => {
        console.log(value)
        setPassword(value)
    }
    
    const onClickFather = async (buttonClicked:string) =>{
        console.log(buttonClicked)
        try{
            await login({email, password})
            console.log('deu bom')
        } catch(err){
            console.log('deu erro')
            console.error('falha')
        }
    }

    return(
        <>
            <div className="flex flex-col justify-center items-center rounded-[40px] bg-white/5 backdrop-blur-2xl">
                <h1 className="text-white font-medium text-[32px] mt-7">
                    Login
                </h1>
                <div className="flex-col w-full flex justify-start mr-auto mt-7 px-3">
                    <div>
                        <h1 className="text-white font-light text-sm pb-1">
                            E-mail:
                        </h1>
                        <Input onChangeInputChildren={onChangeInputFatherEmail} 
                               type="email"/>
                    </div>
                    <div>
                        <h1 className="text-white font-light text-sm pt-2 pb-1">
                            Senha:
                        </h1>
                        <Input  onChangeInputChildren={onChangeInputFatherPassword} 
                                type="password"/>
                    </div>
                </div>
                <div className="w-44 mt-8 mb-9">
                    <Button onClickButtonChildren={onClickFather}
                            type="login"/>
                </div>
            </div>
        </>
    )
}


export default Login