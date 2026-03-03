// component for login feature

import {  useState } from "react"
import Button from "./ui/button"
import Input from "./ui/input"
import { useBiometricAuth, useLogin } from "../hooks/useAuth"
import { useNavigate } from "react-router-dom"
import { startAuthentication } from "@simplewebauthn/browser"




function Login(){
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [errorLogin, setErrorLogin] = useState(false)
    const [textError, setTextError] = useState('')
    const [errorLoginBiometric, setErrorLoginBiometric] = useState(false)
    //const {login, loading, error} = useLogin()
    const {login, loading} = useLogin()
    const {getOptionsLogin, verifyBiometric, loadingBiometric} = useBiometricAuth()
    const onChangeInputFatherEmail = (value: string) => {
        setEmail(value)
        setErrorLogin(false)
        setErrorLoginBiometric(false)
    }

    const onChangeInputFatherPassword = (value: string) => {
        setPassword(value)
        setErrorLogin(false)
        setErrorLoginBiometric(false)
    }
    
    const onClickFather = async (buttonClicked:string) =>{
        console.log(buttonClicked)
        try{
            await login({email, password})
            console.log('deu bom')
            setErrorLogin(false)
            navigate('/dashboard')
        } catch(err){
            console.log('deu erro')
            setErrorLogin(true)
            console.error('falha')
        }
    }

    const onClickFatherBiometric = async ()=>{
        try{
            const optionsJson = await getOptionsLogin()
            const authResp = await startAuthentication({'optionsJSON':optionsJson})
            const responseVerifyBiometric = await verifyBiometric(authResp)
            console.log(responseVerifyBiometric)
            navigate('/dashboard')
        } catch(err: any){
            setTextError(err.response.data.detail)
            setErrorLoginBiometric(true)
            console.log('error')
        }
    }


    const redirectToRecoveryPassword = ()=>{
        navigate('/forget-password')
    }

    

    return(
        <>
            <div className="flex flex-col mt-4 justify-center items-center rounded-[40px] bg-white/5 backdrop-blur-2xl">
                <h1 className="text-white font-medium text-[32px] mt-2">
                    Login
                </h1>
                <div className="flex-col w-full flex justify-start mr-auto mt-4 px-3">
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
                        <button onClick={redirectToRecoveryPassword}
                                className="text-white/70 text-xs pl-1 font-normal underline">
                            Esqueci a senha
                        </button>
                    </div>
                    {errorLogin && (
                            <p className="text-red-400 text-xs mt-1 pl-2">E-mail ou senha incorretos</p>
                        )}
                </div>
                <div className="w-44 mt-5 mb-2">
                    
                    <Button onClickButtonChildren={onClickFather}
                            type="login"
                            loading={loading} />
                </div>
                
                <div className=" px-2 mt-1 mb-4">
                    <Button onClickButtonChildren={onClickFatherBiometric}
                            type="login-biometric"
                            loading={loadingBiometric} />
                    {errorLoginBiometric && (
                        <p className="text-red-400 text-xs mt-1 pl-2">Erro ao fazer login com biometria. Detalhes do erro: {textError}</p>
                    )}
                </div>
                    
                
            </div>
        </>
    )
}


export default Login