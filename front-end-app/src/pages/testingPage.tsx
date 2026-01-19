//page for test of component conduct

import Balance from "../components/balance"
// import Button from "../components/ui/button"
// import ChatBubble from "../components/chatBubble"
// import Input from "../components/ui/input"
// import ListTransaction from "../components/ui/listTransaction"
// import Wellcome from "../components/ui/wellcome"
// import Login from "../components/login"
import HeaderInternal from "../components/ui/headerInternal"
import NavBar from "../components/ui/navBar"

import TransactionsRecents from "../components/transactionsRecents"


function TestingPage(){


    return (
        <>
            <div className="w-full m-0 px-4 flex-col bg-black justify-center items-center">
                <HeaderInternal />
                <Balance />
                <TransactionsRecents />
                <NavBar />
                {/* <Wellcome />
                <Input />
                <Button /> */}
                {/* <Login /> */}
            </div>
        </>
    )
}

export default TestingPage