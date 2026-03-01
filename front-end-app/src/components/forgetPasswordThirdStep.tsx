import { useState } from "react"
import Button from "./ui/button"
import Input from "./ui/input"
import { useRecoveryPassword } from "../hooks/useAuth"
import { useNavigate } from "react-router-dom"


function ForgetPasswordThirdStep(){
    const [password, setPassword] = useState('')
    const [passwordsMatch, setPasswordsMatch] = useState(true)
    const [confirmPassword, setConfirmPassword] = useState('')
    const {updatePassword, loading} = useRecoveryPassword()
    const navigate = useNavigate()
    const [isError, setIsError] = useState(false)
    const [typeError, setTypeError] = useState('')

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

    const onClickFather = async () => {
        
        try{
            const result = await updatePassword(password)
            if(result){
                navigate('/login')
            } else{
                setIsError(true)
            }
        } catch(err: any){
            if(err.response.data.detail == 'não autenticado' || err.response.data.detail == 'Token invalido ou expirado'){
                setTypeError('token expires or invalid')
            } else{
                setTypeError('generic')
            }
            setIsError(true)
        }
    }

    return(
            <>
                <div className="flex flex-col  mt-4 justify-center items-center rounded-[40px] bg-white/5 backdrop-blur-2xl">
                    <h1 className="text-white font-medium text-[28px] mt-4">
                        Redefinir senha
                    </h1>
                    <div className="flex-col w-full flex justify-start mr-auto mt-4 px-3">
                        <div>
                            <h1 className="text-white font-light text-sm pb-1">
                                Insira a nova senha:
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
                            {isError && typeError == 'token expires or invalid' ?  (
                                <p className="text-red-400 text-xs mt-1 pl-2">O tempo máximo para troca de senha foi ultrapassado</p>
                            ) : null}
                            {isError && typeError == 'generic' ?  (
                                <p className="text-red-400 text-xs mt-1 pl-2">Houve um erro na alteração da senha</p>
                            ) : null}
                            {isError && typeError == 'password not preenchida' ?  (
                                <p className="text-red-400 text-xs mt-1 pl-2">Insira a nova senha antes de prosseguir</p>
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

export default ForgetPasswordThirdStep