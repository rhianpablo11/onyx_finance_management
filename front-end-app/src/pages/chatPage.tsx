import ChatBubble from "../components/chatBubble"
import Button from "../components/ui/button"
import Input from "../components/ui/input"


function ChatPage(){

    const onChangeInputFatherChat = (value: string) => {
            console.log(value)
            
    }
    
    const onClickFather = (buttonClicked:string) =>{
        console.log('')
    }

    return(
        <>
            <div className="flex flex-col h-full ">
                <div className="flex-1 mt-10">
                    <ChatBubble />
                </div>
                <div className="flex shrink-0 w-full justify-between items-center">
                    <div className="w-full pr-3">
                        <Input type=""
                            onChangeInputChildren={onChangeInputFatherChat}/>
                    </div>
                    <div className="shrink-0">
                        <Button type=""
                                onClickButtonChildren={onClickFather}/>
                    </div>
                </div>
            </div>
        
        </>
    )
}


export default ChatPage