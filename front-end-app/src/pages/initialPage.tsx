import { useNavigate } from 'react-router-dom'
import backgroundInitialPage  from '../assets/bg-initial-Page.svg?url'
import Button from '../components/ui/button'
import Wellcome from '../components/ui/wellcome'


function InitialPage(){
    const navigate = useNavigate()
    const onClickFatherCreateAccount = (buttonClicked:string) =>{
        console.log(buttonClicked)
        navigate('/sign-up')    
    }

    const onClickFatherLogin = (buttonClicked:string) =>{
        console.log(buttonClicked)
        navigate('/login')    
    }

    return(
        <>  
            <div className='bg-black w-full h-dvh '>
                <div className="flex flex-col justify-center w-full h-dvh bg-no-repeat bg-cover bg-center " 
                     style={{backgroundImage: `url("${backgroundInitialPage}")`}}>
                    <div className='mt-44 '>
                        <Wellcome />
                    </div>
                    <div className='w-full px-6 flex flex-col mt-auto mb-8'>
                        <div className='mb-4'>
                            <Button type='create account'
                                    onClickButtonChildren={onClickFatherCreateAccount}/>
                        </div>
                        <Button type='sign in'
                                onClickButtonChildren={onClickFatherLogin}/>
                    </div>
                    
                </div>
            </div>
           
        </>
    )
}

export default InitialPage