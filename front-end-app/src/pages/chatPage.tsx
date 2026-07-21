import { useState, useRef, useEffect, UIEvent } from "react"
import ChatBubble from "../components/chatBubble"
import Button from "../components/ui/button"
import Input from "../components/ui/input"
import { useChat } from "../hooks/useChat"
import type { ChatPageProps } from "../interfaces/interfacesComponents"
import { groupMessagesByDate} from "../utils/utils" // Ajuste o import conforme seu projeto
import type { ChatHistoryMessage } from "../interfaces/interfacesHooks"



function ChatPage(props: ChatPageProps) {
    const { name } = props
    const { sendMessage, getHistory, loading, errorMsg } = useChat()
    
    // Estado principal que guarda a linha do tempo da conversa
    const [messages, setMessages] = useState<ChatHistoryMessage[]>([])
    const [textTyped, setTextTyped] = useState('')
    const [controlClearTextInput, setControlClearTextInput] = useState(false)
    
    // Estados para o controle do histórico (scroll para cima)
    const [loadingHistory, setLoadingHistory] = useState(false)
    const [hasMore, setHasMore] = useState(true)

    const chatContainerRef = useRef<HTMLDivElement>(null)
    const didFetchRef = useRef(false)
    useEffect(() => {
        if (!didFetchRef.current) {
        fetchHistory()
        didFetchRef.current = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    

    // Efeito para rolar a tela para baixo sempre que uma nova mensagem for adicionada
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
        }
    }, [messages.length]) // Fica "olhando" para o tamanho do array

    // Função de simulação do "Pull to refresh" / Carregar histórico
    const fetchHistory = async () => {
        if (loadingHistory || !hasMore) return
        setLoadingHistory(true)

        const container = chatContainerRef.current
        const previousScrollHeight = container ? container.scrollHeight : 0

        try {
            const pastMessagesRaw = await getHistory()
            
            // Só entra aqui se a API devolver um array válido
            if (pastMessagesRaw && Array.isArray(pastMessagesRaw) && pastMessagesRaw.length > 0) {
                const formattedMessages: ChatHistoryMessage[] = []
                
                pastMessagesRaw.forEach((row: any) => {
                    // ... (Seu código de separar a msg do user e da ia continua igualzinho aqui) ...
                    if (row.message_user) {
                        formattedMessages.push({
                            id: "user-" + row.id, 
                            text: row.message_user,
                            sender: 'user',         
                            created_at: row.created_at
                        })
                    }
                    
                    if (row.ai_response) {
                        formattedMessages.push({
                            id: "ia-" + row.id,
                            text: row.ai_response,  
                            sender: 'ia',           
                            created_at: row.created_at
                        })
                    }
                })

                // Adiciona as mensagens no topo do chat
                setMessages(prev => [...formattedMessages, ...prev])

                
                
                // CENÁRIO 1: Se o seu getHistory() traz TODO o histórico de uma vez (sem paginação)
                // Basta forçar o false logo de cara, porque não tem mais o que buscar depois.
                setHasMore(false) 

                // CENÁRIO 2: Se o seu getHistory() tiver paginação (ex: traz de 50 em 50)
                // Você comenta a linha de cima e usa essa lógica aqui:
                // if (pastMessagesRaw.length < 50) { 
                //     setHasMore(false) 
                // }

            } else {
                // Acabou o histórico (ou a primeira requisição já veio vazia)
                setHasMore(false)
            }
            
        } catch (error) {
            console.error("Erro ao buscar histórico", error)
        } finally {
            setLoadingHistory(false)
            requestAnimationFrame(() => {
                if (container) {
                    const newScrollHeight = container.scrollHeight
                    container.scrollTop = newScrollHeight - previousScrollHeight
                }
            })
        }
    }

    const handleScroll = (e: UIEvent<HTMLDivElement>) => {
        const { scrollTop } = e.currentTarget
        if (scrollTop === 0) {
            fetchHistory()
        }
    }

    const onChangeInputFatherChat = (value: string) => {
        setTextTyped(value)
    }
    
    const onClickFather = async (buttonClicked: string) => {
        if (!textTyped.trim()) return // Evita enviar mensagem vazia

        console.log(buttonClicked)
        setControlClearTextInput(true)

        // 1. Cria a mensagem do usuário e já joga na tela pra dar a sensação de instantâneo
        const newUserMessage: ChatHistoryMessage = {
            id: Date.now(), // ID temporário apenas para a key do React
            text: textTyped,
            sender: 'user',
            created_at: new Date().toISOString()
        }
        
        setMessages(prev => [...prev, newUserMessage])

        // 2. Chama a IA
        const data = await sendMessage(textTyped)

        // 3. Recebe a resposta e joga na tela
        if(data){
            const newIaMessage: ChatHistoryMessage = {
                id: Date.now() + 1,
                text: data['text_response'],
                sender: 'ia',
                created_at: new Date().toISOString()
            }
            setMessages(prev => [...prev, newIaMessage])
        } else if(errorMsg){
            const errorIaMessage: ChatHistoryMessage = {
                id: Date.now() + 1,
                text: errorMsg + " O texto que você digitou: " + textTyped,
                sender: 'ia',
                created_at: new Date().toISOString()
            }
            setMessages(prev => [...prev, errorIaMessage])
        }
        
        setControlClearTextInput(false)
        setTextTyped('') // Limpa a variável interna
    }

    // Passamos o array bruto para a função agrupar antes de renderizar
    const groupedMessages = groupMessagesByDate(messages)

    return(
        <>
            <div className="flex flex-col h-full overflow-hidden">
                {/* 
                    A div flex-1 vai ocupar o espaço livre.
                    overflow-y-auto garante que SÓ o chat tenha scroll, e não a tela toda.
                */}
                <div 
                    ref={chatContainerRef}
                    onScroll={handleScroll}
                    className="flex-1 mt-10 pb-5 px-4 overflow-y-auto scroll-smooth space-y-4"
                >
                    {loadingHistory && (
                        <div className="flex justify-center mt-2 mb-4">
                            <span className="text-[10px] text-gray-500 bg-gray-200 px-3 py-1 rounded-full">
                                Buscando histórico...
                            </span>
                        </div>
                    )}

                    {/* Mapeando os dias */}
                    {Object.entries(groupedMessages).map(([date, dateMessages]) => (
                        <div key={date} className="flex flex-col space-y-4">
                            
                            {/* A Badge de Data estilo WhatsApp */}
                            <div className="flex justify-center">
                                <span className="text-xs  text-white backdrop-blur-2xl bg-white/10 px-3 py-1 rounded-md uppercase">
                                    {date}
                                </span>
                            </div>

                            {/* Mapeando as mensagens de dentro daquele dia */}
                            {dateMessages.map((msg) => (
                                <ChatBubble 
                                    key={msg.id}
                                    isSentMessage={msg.sender === 'user'}
                                    name={msg.sender === 'user' ? name : "ChatBot - by Gemini"}
                                    text={msg.text}
                                    loading={false} 
                                    createdAt={msg.created_at}
                                />
                            ))}
                        </div>
                    ))}

                    {/* Bubble extra de "loading" para UX: Mostra a IA pensando enquanto a API não responde */}
                    {loading && (
                        <ChatBubble 
                            isSentMessage={false}
                            name="ChatBot - by Gemini"
                            text="..."
                            loading={true} 
                        />
                    )}
                </div>

                {/* Input Container - Fica fixo na base enquanto o chat rola em cima */}
                <div className="flex shrink-0 w-full justify-between items-center pt-4 pb-4 bg-transparent">
                    <div className="w-full pr-3">
                        <Input 
                            type="chatpage"
                            onChangeInputChildren={onChangeInputFatherChat}
                            cleanText={controlClearTextInput}
                        />
                    </div>
                    <div className="shrink-0">
                        <Button 
                            type=""
                            onClickButtonChildren={onClickFather}
                        />
                    </div>
                </div>
            </div>
        </>
    )
}

export default ChatPage