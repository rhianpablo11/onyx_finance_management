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
import { I18nProvider } from 'react-aria-components';

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
           come_of_fixed,
           onSuccessEdit,
           onDeleteAction} = props
    
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
    const [newCategory, setNewCategory] = useState<string | undefined>()
    const [nameButton, setNameButton] = useState('Editar movimentação')
    const {editExpense, loading, disableExpense, getDetailsAboutFixedExpense} = useExpense()
    const [installmentValue, setInstallmentValue] = useState<number>(0)
    const [installmentNumber, setInstallmentNumber] = useState<number | string>(0)
    const [installmentRemaining, setInstallmentRemaining] = useState<number>(0)
    const [fixedExpenseendDate, setFixedExpenseEndDate] = useState<string>('')
    const [fixedExpenseStartDate, setFixedExpenseStartDate] = useState<string>('')
    const [totalValueOfFixedExpense, setTotalValueOfFixedExpense] = useState<number>(0)
    const [paidInstallments, setPaidInstallments] = useState<number>(0)
    const [typeOfCharge, setTypeOfCharge] = useState<string>('')
    const [dateOfThisPayment, setDateOfThisPayment] = useState(parseDate(initialDateString)) //corrigir para poder aparecer a data q ta setada
    const [dateOfLastPayment, setDateOfLastPayment] = useState<any>(null) //corrigir para poder aparecer a data q ta setada
    const [editedStartDate, setEditedStartDate] = useState<any>(null)
    const [newRecurrencyOfPayment, setNewRecurrencyOfPayment] = useState<string | number | undefined>()
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(true);
    const [selectedDeleteType, setSelectedDeleteType] = useState('this');

    useEffect(() =>{
        console.log('ola mundo')
        console.log(come_of_fixed)
        
        const fetchDetails = async () => {
            try {
                const details = await getDetailsAboutFixedExpense(come_of_fixed);
                setInstallmentNumber(details.total_installments); //quant de parcelas
                setInstallmentValue(details.installment_value); //valor de cada parcela
                setInstallmentRemaining(details.remaining_installments); //quant de parcelas restantes
                setFixedExpenseEndDate(details.end_date); //data final do pagamento
                setFixedExpenseStartDate(details.start_date); //data q começou
                setTotalValueOfFixedExpense(details.total_value); //valor total da despesa fixa
                setPaidInstallments(details.paid_installments); //quant de parcelas pagas
                setTypeOfCharge(details.type_of_charge); //tipo de cobrança
                if (details.end_date) {
                    const endString = details.end_date.split('T')[0];
                    setDateOfLastPayment(parseDate(endString));
                }

                if (details.start_date) {
                    const startString = details.start_date.split('T')[0];
                    setEditedStartDate(parseDate(startString));
                }
            } catch (error) {  
                console.error('Erro ao buscar detalhes da despesa fixa:', error);
            }
        };
        if(come_of_fixed != null){
            fetchDetails();
        }
    },[])

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
                editedDate.toString(),
                typeOfCharge,
                dateOfThisPayment,
                dateOfLastPayment,
                editedStartDate,
                come_of_fixed
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



    const onClickFatherDelTransaction = async () => {
        // Se for despesa fixa, abre o modal. Se for simples, já manda a faca!
        if (come_of_fixed != null) {
            setIsDeleteModalOpen(true);
        } else {
            await executeDelete('simple');
        }
    }


    const executeDelete = async (typeOfDelete: string) => {
        const payload = {
            delete_type: typeOfDelete,
            come_of_fixed: come_of_fixed,
            date: currentDate // Manda a data exata da parcela que ele clicou
        }

        await disableExpense(idExpense, payload);
        
        setIsDeleteModalOpen(false); // Fecha o modal
        
        if (onSuccessEdit) {
            await onSuccessEdit();
            if (onDeleteAction) {
                onDeleteAction();
            }
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


    const typesOfExpense = () => {
        if(come_of_fixed == null){
            return (
                [
                    { label: 'Dinheiro Físico', value: 'Dinheiro Físico' },
                    { label: 'Pix', value: 'Pix' },
                    { label: 'Cartão de Crédito', value: 'Cartão de Crédito' },
                    { label: 'Cartão de Débito', value: 'Cartão de Débito' }
                ]
            )
        } else{
            return (
                [
                    { label: 'Dinheiro Físico', value: 'Dinheiro Físico' },
                    { label: 'Pix', value: 'Pix' },
                    { label: 'Cartão de Crédito', value: 'Cartão de Crédito' },
                    { label: 'Cartão de Débito', value: 'Cartão de Débito' },
                    { label: 'Automatico', value: 'Automatico' }
                ]
            )
        }
    }
    
    const paymentIsRecurrent = () => {
        if(come_of_fixed == null){
            return(null)
        }else{
            if(fixedExpenseendDate != null){
                return (
                    <>
                        <div className='flex w-full pt-2 pb-2 justify-between items-baseline'>
                            <h3 className='text-base flex shrink-0 text-white font-light'>
                                Data desse {typeExpense ? 'pagamento' : 'recebimento'}:
                            </h3>
                            {isEditMode ? (
                                <>
                                    <div className='ml-4 pt-1'>
                                        <I18nProvider locale="pt-BR">
                                            <DatePicker 
                                                aria-label="Data da transação"
                                                value={dateOfThisPayment}
                                                onChange={setDateOfThisPayment} //vai ta editando a data daquele primeiro pagamento
                                                isDisabled={come_of_fixed != null}
                                                className="w-full flex items-center justify-between rounded-[14px] h-10 text-white focus:outline-none"
                                            />
                                        </I18nProvider>
                                    </div>
                                </>
                            ):(
                                <h1 className='text-white text-lg font-normal '>
                                {formatDateShow(currentDate)}
                            </h1>
                            )}
                            
                        </div>
                        <div className='border-b border-white/30'>
                        </div>

                        {isEditMode ? (
                            null
                        ): (
                            <>
                                

                                <div className='flex pt-2 pb-2 justify-between items-baseline'>
                                    <h3 className='text-base flex shrink-0 text-white font-light'>
                                        Parcela atual:
                                    </h3>
                                    <h1 className='text-white text-lg font-normal '>
                                        {paidInstallments} de {installmentNumber}
                                    </h1>
                                </div>

                                <div className='border-b border-white/30'>
                                </div>

                                <div className='flex pt-2 pb-2 justify-between items-baseline'>
                                    <h3 className='text-base flex shrink-0 text-white font-light'>
                                        Parcelas a serem pagas:
                                    </h3>
                                    <h1 className='text-white text-lg font-normal '>
                                        {installmentRemaining}
                                    </h1>
                                </div>

                                <div className='border-b border-white/30'>
                                </div>

                                <div className='flex pt-2 pb-2 justify-between items-baseline'>
                                    <h3 className='text-base flex shrink-0 text-white font-light'>
                                        Valor total a ser pago:
                                    </h3>
                                    {isEditMode ? (null):(
                                        <h1 className='text-white text-lg font-normal '>
                                            {formatValue(totalValueOfFixedExpense)}
                                        </h1>
                                    )}
                                    
                                </div>

                                <div className='border-b border-white/30'>
                                </div>

                                <div className='flex pt-2 pb-2 justify-between items-baseline'>
                                    <h3 className='text-base flex shrink-0 text-white font-light'>
                                        Valor restante a ser pago:
                                    </h3>
                                    <h1 className='text-white text-lg font-normal '>
                                        {formatValue(totalValueOfFixedExpense - (installmentValue * paidInstallments))}
                                    </h1>
                                </div>

                                <div className='border-b border-white/30'>
                                </div>
            
                                <div className='flex pt-2 pb-2 justify-between items-baseline'>
                                    <h3 className='text-base flex shrink-0 text-white font-light'>
                                        Valor ja pago:
                                    </h3>
                                    <h1 className='text-white text-lg font-normal '>
                                        {formatValue(installmentValue * paidInstallments)}
                                    </h1>
                                </div>

                                <div className='border-b border-white/30'>
                                </div>
                            </>
                        )}    
                        

    
                        <div className='flex pt-2 pb-2 justify-between items-baseline'>
                            <h3 className='text-base flex shrink-0 text-white font-light'>
                                Data do {typeExpense ? "pagamento" : "recebimento"} final:
                            </h3>
                            {isEditMode ? (
                                <>
                                    <div className='ml-4 pt-1'>
                                        <I18nProvider locale="pt-BR">
                                            <DatePicker 
                                                aria-label="Data da transação"
                                                value={dateOfLastPayment}
                                                onChange={setDateOfLastPayment} //vai ta editando a data daquele primeiro pagamento
                                                className="w-full flex items-center justify-between rounded-[14px] h-10 text-white focus:outline-none"
                                            />
                                        </I18nProvider>
                                    </div>
                                </>
                            ):(
                                <h1 className='text-white text-lg font-normal '>
                                    {formatDateShow(fixedExpenseendDate)}
                                </h1>
                            )}
                            
                        </div>

                        <div className='border-b border-white/30'>
                        </div>
                        <div className='flex pt-2 pb-2 justify-between items-baseline'>
                            <h3 className='text-base flex shrink-0 text-white font-light'>
                                Cobranças realizadas no período:
                            </h3>
                            {isEditMode ? (
                                <div className=''>
                                    <SelectionComp useFor='select-category'
                                                   options={[
                                                    {label: 'Anual', value: 'anual'},
                                                    {label: 'Mensal', value: 'mensal'},
                                                    {label: 'Quinzenal', value: 'quinzenal'},
                                                    {label: 'Semanal', value: 'semanal'},
                                                    {label: 'Diario', value: 'diario'},
                                                   ]}
                                                   placeholder={typeOfCharge} 
                                                   initialValue={typeOfCharge}
                                                   onChange={(value) => setNewRecurrencyOfPayment(value)}
                                    />
                                </div>
                            ):(
                                <h1 className='text-white text-lg font-normal '>
                                    {typeOfCharge}
                                </h1>
                            )}
                            
                        </div>
                        <div className='border-b border-white/30'>
                        </div>
                    </>
                )
            } else{
                return(
                    <>
                        <div className='flex pt-2 pb-2 justify-between items-baseline'>
                            <h3 className='text-base flex shrink-0 text-white font-light'>
                                Data desse {typeExpense ? 'pagamento' : 'recebimento'}:
                            </h3>
                            {isEditMode ? (
                                <>
                                    <div className='ml-4 pt-1'>
                                        <I18nProvider locale="pt-BR">
                                            <DatePicker 
                                                aria-label="Data da transação"
                                                value={dateOfThisPayment}
                                                onChange={setDateOfThisPayment} //vai ta editando a data daquele primeiro pagamento
                                                className="w-full flex items-center justify-between rounded-[14px] h-10 text-white focus:outline-none"
                                            />
                                        </I18nProvider>
                                    </div>
                                </>
                            ):(
                                <h1 className='text-white text-lg font-normal '>
                                {formatDateShow(currentDate)}
                            </h1>
                            )}
                        </div>

                        <div className='border-b border-white/30'>
                        </div>
                        {isEditMode ? (null
                        ):(
                            <>
                                <div className='flex pt-2 pb-2 justify-between items-baseline'>
                                    <h3 className='text-base flex shrink-0 text-white font-light'>
                                        Recorrência do {typeExpense ? "pagamento" : "recebimento"}:
                                    </h3>
                                    {isEditMode ? (
                                        null
                                    ):(
                                        <h1 className='text-white text-lg font-normal '>
                                            Contínuo
                                        </h1>
                                    )}
                                    
                                </div>

                                <div className='border-b border-white/30'>
                                </div>
                            </>
                        )}
                        

                        {isEditMode ? (null):(
                            <>
                                <div className='flex pt-2 pb-2 justify-between items-baseline'>
                                    <h3 className='text-base flex shrink-0 text-white font-light'>
                                        Valor ja pago:
                                    </h3>
                                    <h1 className='text-white text-lg font-normal '>
                                        {formatValue(installmentValue * paidInstallments)}
                                    </h1>
                                </div>

                                <div className='border-b border-white/30'>
                                </div>
                            </>
                        )}
                        
                        <div className='flex pt-2 pb-2 justify-between items-baseline'>
                            <h3 className='text-base flex shrink-0 text-white font-light'>
                                Cobranças realizadas no período:
                            </h3>
                            {isEditMode ? (
                                <div className=''>
                                    <SelectionComp useFor='select-category'
                                                   options={[
                                                    {label: 'Anual', value: 'anual'},
                                                    {label: 'Mensal', value: 'mensal'},
                                                    {label: 'Quinzenal', value: 'quinzenal'},
                                                    {label: 'Semanal', value: 'semanal'},
                                                    {label: 'Diario', value: 'diario'},
                                                   ]}
                                                   placeholder={typeOfCharge} 
                                                   initialValue={typeOfCharge}
                                                   onChange={(value) => setNewRecurrencyOfPayment(value)}
                                    />
                                </div>
                            ):(
                                <h1 className='text-white text-lg font-normal '>
                                    {typeOfCharge}
                                </h1>
                            )}
                        </div>

                        <div className='border-b border-white/30'>
                        </div>
                    </>
                )
            }
        
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
                        {isEditMode && come_of_fixed == null ? (
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

                    {/*
                        Começa aqui a parte q eh diferente entre desepesa fixa vs despesa normal
                    */}
                    <div className='flex pt-2 pb-2 justify-between items-baseline'>
                        {come_of_fixed == null ? (
                            <>
                                <h3 className='text-base flex shrink-0 text-white font-light'>
                                    Data do {typeExpense ? 'pagamento' : 'recebimento'}:
                                </h3>
                                {isEditMode ? (
                                    <>
                                        <div className='w-full ml-4 pt-1'>
                                            <I18nProvider locale="pt-BR">
                                                <DatePicker 
                                                    aria-label="Data da transação"
                                                    value={editedDate}
                                                    onChange={setEditedDate}
                                                    className="w-full flex items-center justify-between rounded-[14px] h-10 text-white focus:outline-none"
                                                />
                                            </I18nProvider>
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
                            </>
                        ):
                        (
                        <>
                            <div className='w-full flex justify-between items-center'>
                                <h3 className='text-base flex shrink-0 text-white font-light'>
                                    Data do primeiro {typeExpense ? 'pagamento' : 'recebimento'}:
                                </h3>
                                {isEditMode ? (
                                    <>
                                        <div className='w-full ml-4 pt-1'>
                                            <I18nProvider locale="pt-BR">
                                                <DatePicker 
                                                    aria-label="Data da transação"
                                                    value={editedStartDate}
                                                    isDisabled={paidInstallments > 0}
                                                    onChange={setEditedStartDate} //vai ta editando a data daquele primeiro pagamento
                                                    className="w-full flex items-center justify-between rounded-[14px] h-10 text-white focus:outline-none"
                                                />
                                            </I18nProvider>
                                        </div>
                                    </>
                                ) : 
                                    (
                                        <>
                                            <h1 className='text-white text-lg font-normal '>
                                                {formatDateShow(fixedExpenseStartDate)}
                                            </h1>
                                        </>
                                    )}
                            </div>
                        </>)}
                    </div>

                    <div className='border-b border-white/30'>
                    </div>

                    {paymentIsRecurrent()}

                    <div className='flex pt-2 pb-5 justify-between items-baseline'>
                        <h3 className='flex shrink-0 text-base text-white font-light'>
                            {typeExpense ? 'Pagamento' : 'Recebimento'} via:
                        </h3>
                        {isEditMode ? (
                            <>
                                <div className='w-full pl-4'>
                                    <SelectionComp useFor='select-type-payment'
                                                   options={typesOfExpense()}
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
           {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-sm px-4">
                    
                    {/* Contêiner Principal - Mesmo estilo da ExtractPage */}
                    <div className="rounded-[29px] w-full max-w-sm flex-1 max-h-[85vh] bg-linear-to-tl from-white/50 via-black to-white/50 p-px shadow-2xl">
                        
                        {/* Fundo de Vidro com Imagem */}
                        <div className="w-full h-full p-6 flex flex-col backdrop-blur-3xl rounded-[28px] overflow-auto bg-cover bg-center bg-no-repeat" 
                             style={{backgroundImage: `url("${backgroundDetailsExpense}")`, backgroundColor: 'rgba(0, 0, 0, 0.7)'}}>
                            
                            <h2 className="text-white text-2xl font-medium mb-1">
                                Excluir transação
                            </h2>
                            <p className="text-white/70 text-sm font-light mb-6">
                                Essa é uma despesa recorrente. Como você deseja excluir?
                            </p>

                            <div className="flex flex-col gap-3">
                                {/* OPÇÃO 1 */}
                                <label className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${selectedDeleteType === 'this' ? 'border-red-500 bg-red-500/10' : 'border-white/15 hover:bg-white/5'}`}>
                                    <input type="radio" name="deleteType" value="this" className="hidden" checked={selectedDeleteType === 'this'} onChange={() => setSelectedDeleteType('this')} />
                                    <div className="flex flex-col">
                                        <span className="text-white font-normal text-sm">Pular somente esta</span>
                                        <span className="text-white/50 text-xs font-light mt-0.5">Exclui a parcela atual, mas mantém as próximas intactas.</span>
                                    </div>
                                </label>

                                {/* OPÇÃO 2 */}
                                <label className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${selectedDeleteType === 'next' ? 'border-red-500 bg-red-500/10' : 'border-white/15 hover:bg-white/5'}`}>
                                    <input type="radio" name="deleteType" value="next" className="hidden" checked={selectedDeleteType === 'next'} onChange={() => setSelectedDeleteType('next')} />
                                    <div className="flex flex-col">
                                        <span className="text-white font-normal text-sm">As próximas</span>
                                        <span className="text-white/50 text-xs font-light mt-0.5">Mantém a de hoje paga, e cancela todas do mês que vem em diante.</span>
                                    </div>
                                </label>

                                {/* OPÇÃO 3 */}
                                <label className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${selectedDeleteType === 'this_and_next' ? 'border-red-500 bg-red-500/10' : 'border-white/15 hover:bg-white/5'}`}>
                                    <input type="radio" name="deleteType" value="this_and_next" className="hidden" checked={selectedDeleteType === 'this_and_next'} onChange={() => setSelectedDeleteType('this_and_next')} />
                                    <div className="flex flex-col">
                                        <span className="text-white font-normal text-sm">Esta e as próximas</span>
                                        <span className="text-white/50 text-xs font-light mt-0.5">Cancela o contrato agora. Estorna a de hoje e cancela as futuras.</span>
                                    </div>
                                </label>

                                {/* OPÇÃO 4 */}
                                <label className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${selectedDeleteType === 'all' ? 'border-red-500 bg-red-500/10' : 'border-white/15 hover:bg-white/5'}`}>
                                    <input type="radio" name="deleteType" value="all" className="hidden" checked={selectedDeleteType === 'all'} onChange={() => setSelectedDeleteType('all')} />
                                    <div className="flex flex-col">
                                        <span className="text-white font-normal text-sm text-red-400">Apagar todo o histórico</span>
                                        <span className="text-white/50 text-xs font-light mt-0.5">Apaga do sistema e estorna todo o dinheiro pago no passado.</span>
                                    </div>
                                </label>
                            </div>

                            {/* DIVISÓRIA (Estilo Onyx) */}
                            <div className="mt-6 mb-4 h-px w-full"></div>

                            {/* BOTÕES DE AÇÃO DO MODAL */}
                            <div className="flex justify-between gap-3 mt-auto">
                                <button 
                                    onClick={() => setIsDeleteModalOpen(false)} 
                                    className="w-full py-3 rounded-[14px] text-white/80 bg-white/10 hover:bg-white/20 transition-all font-light text-sm">
                                    Cancelar
                                </button>
                                <button 
                                    onClick={() => executeDelete(selectedDeleteType)} 
                                    disabled={loading}
                                    className="w-full py-3 rounded-[14px] text-white bg-red-600/80 hover:bg-red-700/90 transition-all font-medium text-sm flex justify-center">
                                    {loading ? 'Excluindo...' : 'Confirmar'}
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default DetailsExpense