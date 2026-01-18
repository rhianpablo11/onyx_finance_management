//page for test of component conduct

import Balance from "../components/balance"
import Button from "../components/button"
import ChatBubble from "../components/chatBubble"
import HeaderInternal from "../components/headerInternal"
import Input from "../components/input"
import ListTransaction from "../components/listTransaction"
import NavBar from "../components/navBar"
import Wellcome from "../components/wellcome"


function TestingPage(){


    return (
        <>
            <div className="w-full m-0 px-4 flex-col bg-black justify-center items-center">
                {/* <HeaderInternal />
                <Balance />
                <Input />
                <ChatBubble />
                <ListTransaction />
                <ListTransaction />
                <NavBar /> */}
                <Wellcome />
                <Input />
                <Button />
            </div>
        </>
    )
}

export default TestingPage