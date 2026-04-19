import { useEffect, useState } from "react"
import HeaderInternal from "../components/ui/headerInternal"
import NavBar from "../components/ui/navBar"
import DashMetricsPage from "./dashMetricsPage"
import ExtractPage from "./extractPage"
import ChatPage from "./chatPage"
import backgroundInternalPage from '../assets/bg-internalPage.svg?url'
import { getCookie } from "../services/cookiesService"
import ConfigsPage from "./configsPage"
import { getGreting } from "../utils/utils"
import InsightsPage from "./insightsPage"



function InternalPage(){
    const [pageSelected, setPageSelected] = useState<string>('insights')
    const [typeToShowHeader, setTypeToShowHeader] = useState<string>('wellcome')
    const [legendHeader, setLegendHeader] = useState<string>('')
    const [titleHeader, setTitleHeader] = useState<string>('')
    const [userName, setUserName] = useState('')
    const [customBackAction, setCustomBackAction] = useState<(()=>void) | null>(null)

    const handlePageSelected = (pageClicked: string) => {
        setPageSelected(pageClicked)
        setCustomBackAction(null)
    }

    const returnPage = () => {
        if(customBackAction){
            customBackAction()
        }else{
            setPageSelected('insights')
        }
        
    }

    const renderInternal = () => {
        
        if(pageSelected == 'home'){
            return(
                <DashMetricsPage setCustomBackAction={setCustomBackAction}
                                 setTypeToShowHeader={setTypeToShowHeader}
                                 setLegendHeader={setLegendHeader}
                                 setTitleHeader={setTitleHeader} />
            )
        } else if(pageSelected == 'extract'){
            return(
                <ExtractPage setCustomBackAction={setCustomBackAction} 
                             setLegendHeader={setLegendHeader}
                             setTitleHeader={setTitleHeader}   />
            )
        } else if(pageSelected == 'chat'){
            return(
                <ChatPage name={userName}/>
            )
        } else if(pageSelected == 'config'){
            return(
                <ConfigsPage />
            )
        } else if(pageSelected == 'insights'){
            return(
                <InsightsPage />
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
            const legend = 'Tenha ' + getGreting()
            setLegendHeader(legend)
        } else if(pageSelected == 'extract'){
            setTypeToShowHeader('pages-nav')
            setLegendHeader('Acompanhe as ultimas movimentações realizadas')
            setTitleHeader('Extrato')
        }  else if(pageSelected == 'chat'){
            setTypeToShowHeader('pages-nav')
            setLegendHeader('Facilitador de adição de gastos')
            setTitleHeader('ChatBot')
        } else if(pageSelected == 'config'){
            setTypeToShowHeader('pages-nav')
            setLegendHeader('Controle geral sobre a sua conta')
            setTitleHeader('Configurações')
        } else if(pageSelected == 'insights'){
            setTypeToShowHeader('pages-nav')
            setLegendHeader('Pagina em construção - breve novidades')
            setTitleHeader('Insights')
        }
    }, [pageSelected])

    return(
        
        <>
            <div className="w-full max-w-full h-dvh m-0 px-4 bg-no-repeat bg-cover bg-center " 
                     style={{backgroundImage: `url("${backgroundInternalPage}")`}}>
                <div className="w-full h-dvh max-h-dvh flex flex-col">
                    <div className="shrink-0">
                        <HeaderInternal name={userName}
                                        legend={legendHeader}
                                        title={titleHeader}
                                        type={typeToShowHeader}
                                        onClickChildren={returnPage}/>
                    </div>
                    <div className="flex-1 overflow-hidden pb-24 pt-4 flex flex-col">
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