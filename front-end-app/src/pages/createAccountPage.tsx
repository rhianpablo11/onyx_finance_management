import Button from "../components/ui/button"
import Wellcome from "../components/ui/wellcome"
import backgroundInitialPage  from '../assets/bg-initial-Page.svg?url'
import FirstStepRegister from "../components/firstStepRegister"
import { useState } from "react"
import SecondStepRegister from "../components/secondStepRegister"
import type { SecondStepRegisterProps } from "../interfaces/interfacesComponents"



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
                    <div className=''>
                        <Wellcome />
                    </div>
                    <div className='mt-3 px-7'>
                        {renderComponent()}
                    </div>
                </div>
                <div className='w-full px-6 flex flex-col fixed bottom-0 mt-auto mb-8'>
                    <Button type='sign in'
                            onClickButtonChildren={onClickFather}/>
                    
                </div>
            </div>
        </>
    )
}


export default CreateAccountPage