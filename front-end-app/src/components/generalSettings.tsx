import { useBiometricAuth } from "../hooks/useAuth";
import type { GeneralSettingsProps } from "../interfaces/interfacesComponents"
import Button from "./ui/button"
import { startRegistration } from '@simplewebauthn/browser';


function GeneralSettings(props: GeneralSettingsProps){
    const {onClickChildren} = props
    const {getOptions, registerBiometric} = useBiometricAuth()

    const onClickFather = async (buttonClicked:string) =>{
        onClickChildren(buttonClicked)
        if(buttonClicked == 'Configurar Biometria'){
            requestBiometric()
        }
    }

    const requestBiometric = async () => {
        try{
            const optionsJSON = await getOptions()
            console.log(optionsJSON)
            const attResp = await startRegistration({ optionsJSON: optionsJSON });
            await registerBiometric(attResp)
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
                        nameConfig='Configurar Biometria' />
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