// component for login feature

import Button from "./ui/button"
import Input from "./ui/input"



function Login(){
    
    const onChangeInputFatherEmail = (value: string) => {
        console.log(value)
    }

    const onChangeInputFatherPassword = (value: string) => {
        console.log(value)
    }
    
    const onClickFather = (buttonClicked:string) =>{
        console.log(buttonClicked)
    }

    return(
        <>
            <div className="flex flex-col justify-center items-center rounded-[40px] bg-purple-950">
                <h1 className="text-white font-medium text-[32px] mt-9">
                    Login
                </h1>
                <div className="flex-col w-full flex justify-start mr-auto mt-7 px-3">
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
                    </div>
                </div>
                <div className="w-44 mt-8 mb-9">
                    <Button onClickButtonChildren={onClickFather}
                            type="login"/>
                </div>
            </div>
        </>
    )
}


export default Login