export interface InputProps {
    type: string;
    onChangeInputChildren: (value: string) => void
    cleanText?: boolean
    isError?: boolean
}

export interface ButtonProps {
    type: string
    nameConfig?: string
    loading?: boolean
    onClickButtonChildren: (id:string) => void
}

export interface ListTransactionProps {
    type: string
    nameExpense: string
    value: number
    category: string
    description?: string
    paymentMethod?: string
    id: number
    typeExpense?: boolean
    date?: string
    installments_count?: number | null
    start_date?: string
    end_date?: string
    onClickChildren: (idTransaction:number) => void
}

export interface ListTransactionForExtractProps {
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
    onClickChildren?: ()=> void
}

export interface BalanceProps {
    value: number
    legend: string
    incoming: boolean  //true for incoming or false for exit
    balanceGeral: number
    loading?: boolean
}

export interface TransactionsRecentsProps{
    dayExpenses: ListTransactionProps[]
    nextPayments: ListTransactionProps[]
    monthReceives: ListTransactionProps[]
    setTransactionSelected: (transaction: ListTransactionProps | undefined) => void
    setIdOfTransactionSelected: (id: number)=> void
}


export interface NavBarProps {
    onClickButtonChildren: (id: string) => void
    buttonSelected: string
}

export interface ChatBubbleProps {
    isSentMessage: boolean //true for user sent message or false for response of API
    name: string
    text: string
    loading: boolean
}

export interface ChatPageProps {
    name: string
}

export interface SelectionProps {
    options: SelectionOptionProps[]
    placeholder: string
    onChange: (value: string) => void
    initialValue: string
    useFor: string
}

export interface SelectionOptionProps {
    label: string
    value: string
}

export interface FirstStepRegisterProps {
    changeStatus: (status: boolean) => void
    sendInfoInitialUser: (info: SecondStepRegisterProps) => void
}

export interface SecondStepRegisterProps {
    name: string | undefined
    email: string | undefined
    telephone: string | undefined
}

export interface GeneralSettingsProps {
    onClickChildren: (buttonClicked:string) => void
}

export interface LoadingModalProps {
    isOpen: boolean
}


export interface AnimatedCounterProps {
    value: number;
    duration?: number; // Tempo em ms
}

export interface CreditCardProps{
    name: string
    telephone: string
}

export interface DetailsExpenseProps{
    telephone: string
    amount: number
    dateExpense: string
    paymentMethod: string
    description: string
    nameExpense: string
    category: string
    idExpense: number
    typeExpense: boolean
}


export interface PaperMoneyProps{
    value: number
    typeMoney: string
}


export interface VerifyEmailRegisterProps{
    setOtpCodeUser: (otpCode: string) => void
    setIsAuthorizedNextAfterOTP: (authorization: boolean) => void
    email: string | undefined
    name: string | undefined
}

export interface ExtractPageProps{
    setCustomBackAction: (action: (()=>void) | null) => void
    setTitleHeader?: (title: string) => void
    setLegendHeader?: (legend: string) => void
}

export interface DashMetricsProps{
    setCustomBackAction: (action: (()=>void) | null) => void
    setTitleHeader?: (title: string) => void
    setLegendHeader?: (legend: string) => void
    setTypeToShowHeader?: (typeHeader: string) => void
}

export interface ForgetPasswordFirstStepProps{
    setEmailToRecovery: (email: string) => void
    setFirstStepIsOk: (isOk: boolean) => void
}

export interface ForgetPasswordSecondStepProps{
    email: string
    setSecondStepIsOk: (isOk: boolean) => void
}