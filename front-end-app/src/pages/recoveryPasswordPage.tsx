import Button from "../components/ui/button"
import Wellcome from "../components/ui/wellcome"
import backgroundInitialPage  from '../assets/bg-initial-Page.svg?url'
import { useNavigate } from "react-router-dom"
import ForgetPasswordFirstStep from "../components/forgetPasswordFirstStep"
import ForgetPasswordSecondStep from "../components/forgetPasswordSecondStep"
import ForgetPasswordThirdStep from "../components/forgetPasswordThirdStep"
import { useState } from "react"

function RecoveryPasswordPage(){
    const navigate = useNavigate()
    const [emailToRecovery, setEmailToRecovery] = useState('')
    const [firstStepIsOk, setFirstStepIsOk] = useState(false)
    const [secondStepIsOk, setSecondStepIsOk] = useState(false)

    const onClickFather = (buttonClicked:string) =>{
            console.log(buttonClicked)
            navigate('/login')
    }


    const renderComponent = () =>{
        if(!firstStepIsOk && !secondStepIsOk){
            return(<ForgetPasswordFirstStep setEmailToRecovery={setEmailToRecovery}
                                            setFirstStepIsOk={setFirstStepIsOk} />)
        } else if(firstStepIsOk && !secondStepIsOk) {
            return(<ForgetPasswordSecondStep setSecondStepIsOk={setSecondStepIsOk}
                                             email={emailToRecovery} />)
        } else{
            return(<ForgetPasswordThirdStep />)
        }
        
        // 
        // 
    }

    return(
        <>
            <div className='bg-black w-full h-dvh max-h-dvh'>
                    <div className="flex flex-col justify-center items-center h-full w-full  bg-no-repeat bg-cover bg-center " 
                        style={{backgroundImage: `url("${backgroundInitialPage}")`}}>
                        <div className=''>
                            <Wellcome />
                        </div>
                        <div className='mt-3 px-7'>
                            {renderComponent()}
                        </div>
                    </div>
                    <div className='w-full px-6 flex flex-col fixed bottom-0 mb-8'>
                        <Button type='sign in'
                                onClickButtonChildren={onClickFather}/>
                    </div>
            </div>
        </>
    )
}


export default RecoveryPasswordPage