// component for login feature

import { useState } from "react"
import Button from "./ui/button"
import Input from "./ui/input"
import { useBiometricAuth, useLogin } from "../hooks/useAuth"
import { useNavigate } from "react-router-dom"
import { startAuthentication } from "@simplewebauthn/browser"

// 1. A trava global continua aqui fora, blindada contra re-renders do React
let isAuthenticatingGlobal = false;

function Login(){
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [errorLogin, setErrorLogin] = useState(false)
    const [textError, setTextError] = useState('')
    const [errorLoginBiometric, setErrorLoginBiometric] = useState(false)
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
        try{
            console.log(buttonClicked)
            await login({email, password})
            setErrorLogin(false)
            navigate('/dashboard')
        } catch(err){
            setErrorLogin(true)
        }
    }

    const onClickFatherBiometric = async ()=>{
        if (isAuthenticatingGlobal) return;
        
        isAuthenticatingGlobal = true; 
        setErrorLoginBiometric(false);

        try{
            let optionsToUse;
            const cachedOptionsStr = sessionStorage.getItem('bio_challenge_cache');
            
            // 2. Se o usuário cancelou na tentativa anterior, o desafio salvo será reaproveitado.
            // Isso impede que o backend gere um cookie novo e dessincronize do Samsung Pass!
            if (cachedOptionsStr) {
                optionsToUse = JSON.parse(cachedOptionsStr);
            } else {
                optionsToUse = await getOptionsLogin();
                sessionStorage.setItem('bio_challenge_cache', JSON.stringify(optionsToUse));
            }

            // 3. Inicia a biometria
            const authResp = await startAuthentication(optionsToUse);
            const responseVerifyBiometric = await verifyBiometric(authResp);
            
            console.log(responseVerifyBiometric);
            
            // 4. SUCESSO TOTAL! Destrói o cache para que, quando o usuário fizer Logout,
            // o próximo login não tente usar lixo antigo.
            sessionStorage.removeItem('bio_challenge_cache');
            navigate('/dashboard');
            
        } catch(err: any){
            console.log('Erro capturado na biometria:', err);
            
            if (err.response?.data?.detail) {
                setTextError(err.response.data.detail);
            } 
            else if (err.name === 'NotAllowedError') {
                setTextError('Autenticação cancelada. Limpando ambiente seguro...');
                
                // BOMBA NUCLEAR 2: Se cancelar o Samsung Pass, recarrega a página 
                // em 1 segundo e meio para matar o cache do Android.
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            } 
            else {
                setTextError(err.message || 'Erro desconhecido ao tentar biometria.');
            }
            
            setErrorLoginBiometric(true);
        } finally {
            isAuthenticatingGlobal = false;
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
                        <p className="text-red-400 text-xs mt-1 pl-2">Erro: {textError}</p>
                    )}
                </div>
                    
                
            </div>
        </>
    )
}

export default Login