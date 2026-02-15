import type { LoadingModalProps } from "../interfaces/interfacesComponents"


function LoadingModal(props: LoadingModalProps){

    const {isOpen} = props

    if(isOpen){
        return(
            <>
                <div className="flex">

                </div>
            </>
        )
    }
    return null
}

export default LoadingModal