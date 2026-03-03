import { useState } from "react"
import AccountInfo from "../components/accountInfo"
import GeneralSettings from "../components/generalSettings"
import InfoApp from "../components/infoApp"


function ConfigsPage(){
    const [componentToShow, setComponentToShow] = useState('geral')
    const onClickFather = async (buttonClicked:string) =>{
        console.log(buttonClicked)
        setComponentToShow(buttonClicked)
    }

    const renderInternal = () => {
        if(componentToShow == 'geral'){
            return(
                <>
                    <div className="flex mt-4">
                        <GeneralSettings onClickChildren={onClickFather}/>
                    </div>
                    <div className="flex fixed w-full px-4 left-0 bottom-28">
                        {/* <InfoApp onClickChildren={onClickFather}/> */}
                        <InfoApp />
                    </div>
                </>
            )
        } else{
            return(
                <>
                    <div className="flex mt-4">
                        <GeneralSettings onClickChildren={onClickFather}/>
                    </div>
                    <div className="flex fixed w-full px-4 left-0 bottom-28">
                        {/* <InfoApp onClickChildren={onClickFather}/> */}
                        <InfoApp />
                    </div>
                </>
            )
        }
    }

    return(
        <>
            <div className="w-full flex flex-col">
                <AccountInfo />
                {renderInternal()}
                
            </div>
        </>
    )
}

export default ConfigsPage