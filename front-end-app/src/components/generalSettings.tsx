import { useEffect, useState } from "react";
import { useBiometricAuth } from "../hooks/useAuth";
import type { GeneralSettingsProps } from "../interfaces/interfacesComponents"
import { getDeviceId } from "../utils/utils";
import Button from "./ui/button"
import { startRegistration } from '@simplewebauthn/browser';
import { getCookie } from "../services/cookiesService";


function GeneralSettings(props: GeneralSettingsProps){
    const {onClickChildren} = props
    const {getOptions, registerBiometric, existBiometricInDevice} = useBiometricAuth()
    const [textBiometric, setTextBiometric] = useState('')

    const onClickFather = async (buttonClicked:string) =>{
        onClickChildren(buttonClicked)
        if(buttonClicked == 'Configurar Biometria' && textBiometric == 'Configurar biometria'){
            requestBiometric()
        }
    }

    useEffect(()=>{

        const verifyBiometricExists = async () =>{
            const biometricAuthInThisDevice = getCookie("this_device_has_biometric")
            if(biometricAuthInThisDevice == 'true'){
                setTextBiometric('Deletar biometria')
            } else{
                const biometricExistInDatabase = await existBiometricInDevice()
                if(biometricExistInDatabase == false){
                    setTextBiometric('Configurar biometria')
                }
            }

            setTextBiometric('Configurar biometria')
        }
        verifyBiometricExists()
    },[])

    

    const requestBiometric = async () => {
        try{
            const optionsJSON = await getOptions()
            console.log(optionsJSON)
            const attResp = await startRegistration({ optionsJSON: optionsJSON });
            const dataSend = {
                'dataBiometric': attResp,
                'idDevice': getDeviceId()
            }
            const response_of_register = await registerBiometric(dataSend)
            if(response_of_register == false){
                throw new Error('falha ao registrar nova biometria')
            }
        } catch (error){
            // if(error.name === 'NotAllowedError'){
            //     alert('operação cancelada')
            // } else{
            //     alert('erro ao cadastrar a biometria')
            // }
            alert('erro ao cadastrar a biometria' + error)
        }
        
    }

    return(
        <>
            <div className="flex flex-col w-full rounded-2xl bg-white/2 shrink-0">
                <Button type="list-config"
                        onClickButtonChildren={onClickFather}
                        nameConfig={textBiometric} />
                <div className="border-t border-white/50 mx-3"></div>
                <Button type="list-config"
                        onClickButtonChildren={onClickFather}
                        nameConfig='Alertas e Lembranças' />
                <div className="border-t border-white/50 mx-3"></div>
                <Button type="list-config"
                        onClickButtonChildren={onClickFather}
                        nameConfig='Verificação em 2 etapas' />
            </div>
        </>
    )
}

export default GeneralSettings