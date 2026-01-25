export interface InputProps {
    type: string;
    onChangeInputChildren: (value: string) => void
}

export interface ButtonProps {
    type: string
    onClickButtonChildren: (id:string) => void
}

export interface ListTransactionProps {
    type: string
    nameExpense: string
    value: number
    category: string
    id: number
}

export interface HeaderInternalProps {
    type: string
    name?: string
    legend: string
    title?: string
}

export interface BalanceProps {
    value: number
    legend: string
    incoming: boolean  //true for incoming or false for exit
}

export interface TransactionsRecentsProps{
    dayExpenses: ListTransactionProps[]
    //next payments
    monthReceives: ListTransactionProps[]
}

export interface DashMetricsPageProps{
    value: number
    legend: string
    incoming: boolean
    dayExpenses: ListTransactionProps[]
    monthReceives: ListTransactionProps[]
}

export interface NavBarProps {
    onClickButtonChildren: (id: string) => void
    buttonSelected: string
}

export interface ChatBubbleProps {
    isSentMessage: boolean //true for user sent message or false for response of API
    name: string
    text: string
}

export interface ChatPageProps {
    name: string
}