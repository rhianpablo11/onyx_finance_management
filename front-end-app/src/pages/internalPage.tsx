import { useEffect, useState } from "react"
import HeaderInternal from "../components/ui/headerInternal"
import NavBar from "../components/ui/navBar"
import DashMetricsPage from "./dashMetricsPage"
import ExtractPage from "./extractPage"
import ChatPage from "./chatPage"
import backgroundInternalPage from '../assets/bg-internalPage.svg?url'
import { getCookie } from "../services/cookiesService"


function InternalPage(){
    const [pageSelected, setPageSelected] = useState<string>('home')
    const [typeToShowHeader, setTypeToShowHeader] = useState<string>('wellcome')
    const [legendHeader, setLegendHeader] = useState<string>('')
    const [titleHeader, setTitleHeader] = useState<string>('')
    const [userName, setUserName] = useState('')

    const handlePageSelected = (pageClicked: string) => {
        setPageSelected(pageClicked)
    }

    const returnPage = () => {
        setPageSelected('home')
    }

    const renderInternal = () => {
        
        if(pageSelected == 'home'){
            return(
                <DashMetricsPage />
            )
        } else if(pageSelected == 'extract'){
            return(
                <ExtractPage />
            )
        } else if(pageSelected == 'chat'){
            return(
                <ChatPage name={userName}/>
            )
        }
    }

    useEffect(()=>{
        const name = getCookie('user_name')
        if(name){
            setUserName(name)
        }
    }, [])

    useEffect(()=>{
        if(pageSelected == 'home'){
            setTypeToShowHeader('wellcome')
            setLegendHeader('Tenha uma ótima tarde')
        } else if(pageSelected == 'extract'){
            setTypeToShowHeader('pages-nav')
            setLegendHeader('Acompanhe as ultimas movimentações realizadas')
            setTitleHeader('Extrato das atividades')
        }  else if(pageSelected == 'chat'){
            setTypeToShowHeader('pages-nav')
            setLegendHeader('Facilitador de adição de gastos')
            setTitleHeader('ChatBot')
        }
    }, [pageSelected])

    return(
        
        <>
            <div className="w-full max-w-full h-dvh m-0 px-4 bg-no-repeat bg-cover bg-center " 
                     style={{backgroundImage: `url("${backgroundInternalPage}")`}}>
                <div className="w-full h-dvh max-h-dvh flex flex-col">
                    <div className="shrink-0 mt-5">
                        <HeaderInternal name={userName}
                                        legend={legendHeader}
                                        title={titleHeader}
                                        type={typeToShowHeader}
                                        onClickChildren={returnPage}/>
                    </div>
                    <div className="flex-1 overflow-hidden pb-24 pt-4">
                        {renderInternal()}
                    </div>  
                    <div className="w-full max-w-full fixed bottom-0 left-0 px-4 z-50 shrink-0">
                        <NavBar onClickButtonChildren={handlePageSelected}
                                buttonSelected={pageSelected}/>
                    </div>
                </div>
            </div>
        </>
        
    )
}

export default InternalPage