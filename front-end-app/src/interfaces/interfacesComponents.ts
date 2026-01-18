export interface InputProps {
    type: string;
    onChangeInputChildren: (value: string) => void
}

export interface ButtonProps {
    type: string
    onClickButtonChildren: (id:string) => void
}