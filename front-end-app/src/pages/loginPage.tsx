import Wellcome from '../components/ui/wellcome'
import backgroundInitialPage  from '../assets/bg-initial-Page.svg?url'
import Button from '../components/ui/button'
import Login from '../components/login'

function LoginPage(){

    const onClickFather = (buttonClicked:string) =>{
            console.log(buttonClicked)
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
                            <Login />
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


export default LoginPage