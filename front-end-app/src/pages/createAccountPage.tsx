import Login from "../components/login"
import Button from "../components/ui/button"
import Wellcome from "../components/ui/wellcome"
import backgroundInitialPage  from '../assets/bg-initial-Page.svg?url'
import FirstStepRegister from "../components/firstStepRegister"
import { useState } from "react"
import SecondStepRegister from "../components/secondStepRegister"
import type { SecondStepRegisterProps } from "../interfaces/interfacesComponents"
import { useCreateAccount } from "../hooks/useCreateAccount"


function CreateAccountPage(){
    const [isAuthorizedNext, setIsAuthorizedNext] = useState<boolean>(false)
    const [initialDataUser, setInitialDataUser] = useState<SecondStepRegisterProps>()
    const onClickFather = (buttonClicked:string) =>{
            console.log(buttonClicked)
    }

    const renderComponent = () => {
        if(!isAuthorizedNext){
            return(
                    <FirstStepRegister changeStatus={setIsAuthorizedNext}
                                       sendInfoInitialUser={setInitialDataUser}/>
                )
        } else{
            return(
                <SecondStepRegister name={initialDataUser?.name} 
                                    telephone={initialDataUser?.telephone}
                                    email={initialDataUser?.email} />
            )
        }
        
    }

    return(
        <>
            <div className='bg-black w-full h-dvh max-h-dvh'>
                <div className="flex flex-col justify-center w-full h-dvh bg-no-repeat bg-cover bg-center " 
                    style={{backgroundImage: `url("${backgroundInitialPage}")`}}>
                    <div className='mt-30 '>
                        <Wellcome />
                    </div>
                    <div className='mt-16 px-7'>
                        {renderComponent()}
                    </div>
                    <div className='w-full px-6 flex flex-col mt-auto mb-8'>
                        <Button type='create account'
                                onClickButtonChildren={onClickFather}/>
                        
                    </div>
                    
                </div>
            </div>
        </>
    )
}


export default CreateAccountPage