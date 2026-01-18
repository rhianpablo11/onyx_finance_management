//page for test of component conduct

import Balance from "../components/balance"
import ChatBubble from "../components/chatBubble"
import HeaderInternal from "../components/headerInternal"
import Input from "../components/input"
import ListTransaction from "../components/listTransaction"
import NavBar from "../components/navBar"


function TestingPage(){


    return (
        <>
            <div className="w-full m-0 px-4 flex-col bg-black justify-center items-center">
                <HeaderInternal />
                <HeaderInternal />
                <Balance />
                <Input />
                <ChatBubble />
                <ListTransaction />
                <ListTransaction />
                <NavBar />
            </div>
        </>
    )
}

export default TestingPage