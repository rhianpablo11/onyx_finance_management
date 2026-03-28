// component for header of internal pages -> say hello or indicate page
import { useNavigate } from "react-router-dom"
import type { HeaderInternalProps } from "../../interfaces/interfacesComponents"
import { getFitName, makeLogout } from "../../utils/utils"
import { useLogin } from "../../hooks/useAuth"

function HeaderInternal(props: HeaderInternalProps){
    const {type, legend, title, name, onClickChildren} = props
    const navigate = useNavigate()
    console.log(name)
    const {logout} = useLogin()
    //function temporary for logout
    const onClickLogout = async () => {
        makeLogout()
        await logout()
        //navigate('/')
    } 
    

    if(type == 'wellcome'){
        console.log('kafanlf')
        console.log(name != undefined ? getFitName(name):'')
        return(
            <>
                <div className="w-full h-full flex rounded-xl pt-1 justify-between">
                        <div className="flex-col">
                            <div className="flex items-baseline">
                                <h1 className="text-white/50 pr-2 font-extralight text-[28px] ">
                                    Olá, 
                                </h1>
                                <h2 className="text-white font-normal text-[32px] ">
                                    {name != undefined ? getFitName(name):''}
                                </h2>
                            </div>
                            <div>
                                <h1 className=" pl-1 text-white font-extralight text-xs leading-none">
                                    {legend}
                                </h1>
                            </div>
                        </div>
                        <div className="flex text-white items-center py-4">
                            <button onClick={onClickLogout}>
                                {/* <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                                </svg> */}
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                                </svg>

                            </button>
                        </div>
                </div>
            </>
        )
    } else if(type == 'pages-nav'){
        return(
            <>
                <div className="w-full h-full flex rounded-xl pt-4 items-center">
                        <div className="text-white pr-3">
                            <button onClick={onClickChildren}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-7">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                                </svg>
                            </button>
                        </div>
                        <div className="flex-col">
                            <div className="flex items-baseline">
                                <h2 className="text-white font-light text-[32px] leading-none">
                                    {title}
                                </h2>
                            </div>
                            <div>
                                <h1 className="pl-1 pt-1 text-white/75 font-extralight text-xs ">
                                    {legend}
                                </h1>
                            </div>
                        </div>
                        {title == 'ChatBot' ? (
                            <div className="flex text-white items-center py-4 ml-auto">
                                <button>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                                    </svg>

                                </button>
                            </div>
                        ) : null}
                        
                </div>
            </>
        )
    }
}

export default HeaderInternal