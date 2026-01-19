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
    value: string
    category: string
}