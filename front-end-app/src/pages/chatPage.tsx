import { useEffect, useState } from "react"
import ChatBubble from "../components/chatBubble"
import Button from "../components/ui/button"
import Input from "../components/ui/input"
import { useChat } from "../hooks/useChat"
import type { ChatPageProps } from "../interfaces/interfacesComponents"




function ChatPage(props: ChatPageProps){
    const {name} = props
    // const {sendMessage, loading, error} = useChat()
    const {sendMessage} = useChat()
    const [textTyped, setTextTyped] = useState('')
    const [showChatBubbleUser, setShowChatBubbleUser] = useState(false)
    const [showChatBubbleResponse, setShowChatBubbleResponse] = useState(false)
    const [responseOfChat, setResponseOfChat] = useState('')
    const [controlClearTextInput, setControlClearTextInput] = useState(false)

    const onChangeInputFatherChat = (value: string) => {
        setTextTyped(value)
        setShowChatBubbleUser(false)
        setShowChatBubbleResponse(false)
            
    }
    
    const onClickFather = async (buttonClicked:string) =>{
        setShowChatBubbleUser(true)
        console.log(buttonClicked)
        setControlClearTextInput(true)
        const data = await sendMessage(textTyped)
        if(data){
            setShowChatBubbleResponse(true)
            setShowChatBubbleUser(false)
            setResponseOfChat(data['text_response'])
            setControlClearTextInput(false)
        }
    }

    const chatBubbleShowControl = () => {
        if(showChatBubbleUser){
            return(
                <ChatBubble isSentMessage={true}
                                name={name}
                                text={textTyped} />
            )
        } else if (showChatBubbleResponse){
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
                                text={responseOfChat} />
                    </div>
                </div>
                
                </>
            )
        }
    }

    useEffect(()=>{
        chatBubbleShowControl
    }, [showChatBubbleResponse])

    return(
        <>
            <div className="flex flex-col h-full ">
                <div className="flex-1 mt-10">
                    {chatBubbleShowControl()}
                </div>
                <div className="flex shrink-0 w-full justify-between items-center">
                    <div className="w-full pr-3">
                        <Input type="chatpage"
                            onChangeInputChildren={onChangeInputFatherChat}
                            cleanText={controlClearTextInput}/>
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