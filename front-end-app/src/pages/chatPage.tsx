import { useState } from "react"
import ChatBubble from "../components/chatBubble"
import Button from "../components/ui/button"
import Input from "../components/ui/input"
import { useChat } from "../hooks/useChat"
import type { ChatPageProps } from "../interfaces/interfacesComponents"




function ChatPage(props: ChatPageProps){
    const {name} = props
    const {sendMessage, loading, error} = useChat()
    const [textTyped, setTextTyped] = useState('')
    const [showChatBubbleUser, setShowChatBubbleUser] = useState(false)
    const [showChatBubbleResponse, setShowChatBubbleResponse] = useState(false)

    const onChangeInputFatherChat = (value: string) => {
        setTextTyped(value)
            
    }
    
    const onClickFather = async (buttonClicked:string) =>{
        setShowChatBubbleUser(true)
        const data = await sendMessage(textTyped)
        if(data){
            setShowChatBubbleResponse(true)
        }
    }

    const chatBubbleShowControl = () => {
        if(showChatBubbleUser){
            return(
                <ChatBubble isSentMessage={true}
                                name={name}
                                text={textTyped} />
            )
        } if(showChatBubbleResponse){
            return(
                <>
                <div className="flex flex-col">
                    <div>
                        <ChatBubble isSentMessage={true}
                                name={name}
                                text={textTyped} />
                    </div>
                    <div className="mt-3">
                        <ChatBubble isSentMessage={false}
                                name="ChatBot - by Gemini"
                                text={textTyped} />
                    </div>
                </div>
                
                </>
            )
        }
    }

    return(
        <>
            <div className="flex flex-col h-full ">
                <div className="flex-1 mt-10">
                    {chatBubbleShowControl()}
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