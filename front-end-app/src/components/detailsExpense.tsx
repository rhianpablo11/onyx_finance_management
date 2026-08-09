import { useEffect, useState } from 'react'
import backgroundDetailsExpense from '../assets/Group 8.svg?url'
import type { DetailsExpenseProps } from '../interfaces/interfacesComponents'
import { getCookie } from '../services/cookiesService'
import {  formatDateShow, formatValue } from '../utils/utils'
import CreditCard from './creditCard'
import PaperMoney from './paperMoney'
import Button from './ui/button'
import Input from './ui/input'
import SelectionComp from './ui/selection'
import { parseDate } from '@internationalized/date'
import { DatePicker } from './react-aria/DatePicker'
import { useExpense } from '../hooks/useExpense'

function DetailsExpense(props: DetailsExpenseProps){
    const {nameExpense,
           telephone,
           amount,
           dateExpense,
           paymentMethod,
           description,
           category,
           idExpense,
           typeExpense,
           listCategories,
           onSuccessEdit} = props
    
    // 🔥 1. ESTADOS DE EXIBIÇÃO: Começam com os valores do banco, mas vão mudar instantaneamente na tela
    const [currentAmount, setCurrentAmount] = useState(amount)
    const [currentCategory, setCurrentCategory] = useState(category)
    const [currentPaymentMethod, setCurrentPaymentMethod] = useState(paymentMethod)
    const [currentDate, setCurrentDate] = useState(dateExpense)

    const [isEditMode, setIsEditMode] = useState(false)
    const [editedValue, setEditedValue] = useState<number | undefined>()
    const initialDateString = dateExpense ? dateExpense.split('T')[0] : '2026-08-07';
    const [editedDate, setEditedDate] = useState(parseDate(initialDateString))
    const [categoriesUser] = useState<{label: string, value: string}[]>(listCategories)
    
    const [newPaymentMethod, setNewPaymentMethod] = useState<string | undefined>()
    const [newCategory, setNewCategory] = useState<string | number | undefined>()
    const [nameButton, setNameButton] = useState('Editar movimentação')
    const {editExpense, loading, disableExpense} = useExpense()

    const onClickFather = async () =>{
        if(isEditMode){
            let categoryIdToSend: string | number | undefined = newCategory;
            
            // Pega o ID da categoria atual se o usuário não mudou nada
            if (!categoryIdToSend) {
                const currentCategoryObj = categoriesUser.find(c => c.label === currentCategory);
                categoryIdToSend = currentCategoryObj ? currentCategoryObj.value : currentCategory; 
            }

            // 1. Salva no banco (aguarda terminar)
            await editExpense(
                idExpense, 
                categoryIdToSend,
                editedValue || currentAmount, 
                newPaymentMethod || currentPaymentMethod, 
                editedDate.toString()
            );

            // 🔥 2. Atualiza a tela (UX Instantânea!)
            setCurrentAmount(editedValue || currentAmount);
            setCurrentPaymentMethod(newPaymentMethod || currentPaymentMethod);
            setCurrentDate(editedDate.toString());
            
            const updatedCategoryObj = categoriesUser.find(c => c.value == categoryIdToSend);
            if (updatedCategoryObj) {
                setCurrentCategory(updatedCategoryObj.label);
            }

            // 🔥 3. Avisa o Pai (DashMetricsPage) para buscar os dados de novo silenciosamente
            if (onSuccessEdit) {
                await onSuccessEdit();
            }

            // 4. Sai do modo edição
            setIsEditMode(false);
            setNameButton('Editar movimentação');
        } else{
            setIsEditMode(true);
            setNameButton('Salvar alterações');
        }
    }

    const onClickFatherDelTransaction = async () =>{
        // Aqui você pode adicionar a lógica para deletar a transação, se necessário. Por enquanto, apenas loga no console.
        console.log(`Deletar transação com ID: ${idExpense}`);
        await disableExpense(idExpense);
        if (onSuccessEdit) {
            await onSuccessEdit();
        }
    }

    // Atualizado para olhar para o "currentPaymentMethod"
    const methodPaymentShow = () =>{
        const method = currentPaymentMethod.toLowerCase()
        if(method == 'cartão de crédito' || method == 'cartão de debito'){
            return(
                <CreditCard name={getCookie('user_name') || ''}
                            telephone={telephone} />
            )
        } else{
            return(
                <PaperMoney value={100}
                            typeMoney={ method == 'dinheiro físico' || method == 'dinheiro' ? 'Físico' : 'Pix'} />
            )
        }
    }

    return(
        <>
            <div className="rounded-[29px] w-full h-full flex-1 bg-linear-to-tl from-white/50 via-black to-white/50 p-px ">
                <div className="w-full h-full px-4 flex flex-col  backdrop-blur-3xl  rounded-[28px] overflow-auto bg-cover  bg-center bg-no-repeat" style={{backgroundImage: `url("${backgroundDetailsExpense}")`}}>
                    <div className='flex pt-5 '>
                        <div className='bg-[#D9D9D9] w-16 h-16 rounded-2xl flex justify-center items-center'>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-9">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
                            </svg>
                        </div>
                        <div className='flex flex-col pl-3 w-full'>
                            <h1 className='text-white font-normal text-2xl'>
                                {nameExpense}
                            </h1>
                            {isEditMode ? (
                                <div className=''>
                                    <SelectionComp useFor='select-category'
                                                   options={categoriesUser}
                                                   placeholder={currentCategory} 
                                                   initialValue={currentCategory}
                                                   onChange={(value) => setNewCategory(value)}
                                    />
                                </div>
                            ) : (
                                <h3 className='text-white font-light text-sm '>
                                    {currentCategory}
                                </h3>
                            )}
                            
                        </div>
                    </div>

                    <div className='flex pt-5 pb-5'>
                        <h3 className='text-white font-light text-base leading-none'>
                            {description}{description[description.length - 1] == '.' ? '' : '.'}
                        </h3>
                    </div>

                    <div className='border-b border-white/30'>
                    </div>

                    <div className='flex items-baseline pt-1 pb-2'>
                        <h3 className='text-2xl text-white font-light'>
                            R$
                        </h3>
                        {isEditMode ? (
                            <div className='flex justify-end items-end w-full ml-3 mt-1'>
                                <Input type='change-value-transaction'
                                    placeholder={formatValue(currentAmount).toString()}
                                    onChangeInputChildren={(value) => setEditedValue(parseFloat(value) || 0)}
                                />
                            </div>
                            ):(
                            <>
                                <h1 className='text-white text-[32px] font-normal pl-1'>
                                    {formatValue(currentAmount)}
                                </h1>
                            </>
                        )}
                        
                    </div>

                    <div className='border-b border-white/30'>
                    </div>

                    <div className='flex pt-2 pb-2 justify-between items-baseline'>
                        <h3 className='text-base flex shrink-0 text-white font-light'>
                            Data do {typeExpense ? 'pagamento' : 'recebimento'}:
                        </h3>
                        {isEditMode ? (
                            <>
                                <div className='w-full ml-4 pt-1'>
                                    <DatePicker 
                                        aria-label="Data da transação"
                                        value={editedDate}
                                        onChange={setEditedDate}
                                        className="w-full flex items-center justify-between rounded-[14px] h-10 text-white focus:outline-none"
                                    />
                                </div>
                            </>
                        ) : 
                            (
                                <>
                                    <h1 className='text-white text-lg font-normal '>
                                        {formatDateShow(currentDate)}
                                    </h1>
                                </>
                            )}
                        
                    </div>

                    <div className='border-b border-white/30'>
                    </div>

                    <div className='flex pt-2 pb-5 justify-between items-baseline'>
                        <h3 className='flex shrink-0 text-base text-white font-light'>
                            {typeExpense ? 'Pagamento' : 'Recebimento'} via:
                        </h3>
                        {isEditMode ? (
                            <>
                                <div className='w-full pl-4'>
                                    <SelectionComp useFor='select-type-payment'
                                                   options={[
                                                    { label: 'Dinheiro Físico', value: 'Dinheiro Físico' },
                                                    { label: 'Pix', value: 'Pix' },
                                                    { label: 'Cartão de Crédito', value: 'Cartão de Crédito' },
                                                    { label: 'Cartão de Débito', value: 'Cartão de Débito' }
                                                   ]}
                                                   placeholder={currentPaymentMethod}
                                                   initialValue={currentPaymentMethod}
                                                   onChange={(value) => setNewPaymentMethod(value)}
                                    />
                                </div>
                            </>
                        ) :
                        (
                            <>
                                <h1 className='text-white text-lg font-normal '>
                                    {currentPaymentMethod}
                                </h1>
                            </>
                        )}
                        
                    </div>

                    {methodPaymentShow()}
                    
                    <div className='flex w-full gap-x-2 items-center justify-center mt-auto pb-3 pt-4'>
                        <Button type='del-expense'
                                onClickButtonChildren={onClickFatherDelTransaction}
                                nameConfig='Deletar transação' 
                                loading={loading} />
                        <Button type='edit-expense'
                                onClickButtonChildren={onClickFather}
                                nameConfig={nameButton} 
                                loading={loading} />
                        
                    </div>

                </div>
            </div>
        </>
    )
}

export default DetailsExpense