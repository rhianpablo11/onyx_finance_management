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
                    <div className="flex flex-col justify-center items-center h-full w-full  bg-no-repeat bg-cover bg-center " 
                        style={{backgroundImage: `url("${backgroundInitialPage}")`}}>
                        <div className=''>
                            <Wellcome />
                        </div>
                        <div className=' px-7'>
                            <Login />
                        </div>
                    </div>
                    <div className='w-full px-6 flex flex-col fixed bottom-0 mb-8'>
                        <Button type='create account'
                                onClickButtonChildren={onClickFather}/>
                    </div>
                </div>
        </>
    )
}


export default LoginPage