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
    const [newRecurrencyOfPayment, setNewRecurrencyOfPayment] = useState<string>('')
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedDeleteType, setSelectedDeleteType] = useState('this');
    const [editedInstallments, setEditedInstallments] = useState<number | undefined>()
    const [errorModalMsg, setErrorModalMsg] = useState<string>('')
    const [isEditBehaviorModalOpen, setIsEditBehaviorModalOpen] = useState(false);
    const [selectedEditBehavior, setSelectedEditBehavior] = useState('future_only');

    const fetchDetails = async () => {
        try {
            const details = await getDetailsAboutFixedExpense(come_of_fixed as number);
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

    // O useEffect agora só chama a função que tá lá fora
    useEffect(() =>{
        if(come_of_fixed != null){
            fetchDetails();
        }
    }, [])

    const onClickFather = async () =>{
        if(isEditMode){
            const finalInstallments = editedInstallments !== undefined ? editedInstallments : (installmentNumber as number);
            const valueToSend = editedValue !== undefined ? editedValue : (come_of_fixed != null ? totalValueOfFixedExpense : currentAmount);
            
            // 🧠 VERIFICAÇÃO DE MUDANÇA MATEMÁTICA (Agora sem bloqueio)
            const isMathChanged = come_of_fixed != null && 
                                  installmentNumber !== "Infinito" && 
                                  (finalInstallments !== installmentNumber || valueToSend !== totalValueOfFixedExpense);

            // Se mudou a matemática estrutural E já tem parcelas pagas, abre o Modal!
            if (isMathChanged && paidInstallments > 0) {
                setIsEditBehaviorModalOpen(true);
                return; // Pausa aqui e espera o usuário escolher (Retroativo ou Redistribuir)
            }

            // Se não precisa de modal, salva direto
            await executeEdit('future_only', finalInstallments, valueToSend);

        } else {
            setIsEditMode(true);
            setNameButton('Salvar alterações');
        }
    }


    const executeEdit = async (behavior: string, finalInst: number, valToSend: number) => {
        let categoryIdToSend: string | number | undefined = newCategory;
            
        if (!categoryIdToSend) {
            const currentCategoryObj = categoriesUser.find(c => c.label === currentCategory);
            categoryIdToSend = currentCategoryObj ? currentCategoryObj.value : currentCategory; 
        }

        try {
            await editExpense(
                idExpense, 
                categoryIdToSend,
                valToSend, 
                newPaymentMethod || currentPaymentMethod, 
                editedDate?.toString(),
                newRecurrencyOfPayment,
                dateOfThisPayment?.toString(),
                dateOfLastPayment?.toString(), 
                editedStartDate?.toString(),   
                come_of_fixed,
                finalInst,
                behavior // 🔥 Envia o comportamento (Retroativo ou Futuro)
            );
        } catch (error: any) {
            setIsEditBehaviorModalOpen(false); // Fecha o modal se tiver aberto
            if (error.response && error.response.data && error.response.data.detail) {
                setErrorModalMsg(error.response.data.detail);
            } else {
                setErrorModalMsg("Ocorreu um erro ao salvar as alterações. Tente novamente.");
            }
            return; 
        }

        // Atualiza UI
        if (come_of_fixed == null) {
            setCurrentAmount(valToSend);
        } else {
            await fetchDetails();
        }

        setCurrentPaymentMethod(newPaymentMethod || currentPaymentMethod);
        setCurrentDate(editedDate.toString());
        
        const updatedCategoryObj = categoriesUser.find(c => c.value == categoryIdToSend);
        if (updatedCategoryObj) {
            setCurrentCategory(updatedCategoryObj.label);
        }

        if (onSuccessEdit) {
            await onSuccessEdit();
        }

        setIsEditBehaviorModalOpen(false);
        setIsEditMode(false);
        setNameButton('Editar movimentação');
        setEditedInstallments(undefined);
        setEditedValue(undefined);
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
                        <div className='flex w-full pt-2 pb-2 justify-between items-center'>
                            <h3 className='text-base flex  text-white font-light'>
                                Data desse {typeExpense ? 'pagamento' : 'recebimento'}:
                            </h3>
                            {isEditMode ? (
                                <>
                                    <div className='ml-4 pt-1'>
                                        <I18nProvider locale="pt-BR">
                                            <DatePicker 
                                                aria-label="Data da transação"
                                                value={dateOfThisPayment}
                                                onChange={(date) => date && setDateOfThisPayment(date)} //vai ta editando a data daquele primeiro pagamento
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
                                

                                <div className='flex pt-2 pb-2 justify-between items-center'>
                                    <h3 className='text-base flex  text-white font-light'>
                                        Parcela atual:
                                    </h3>
                                    <h1 className='text-white text-lg font-normal '>
                                        {paidInstallments} de {installmentNumber}
                                    </h1>
                                </div>

                                <div className='border-b border-white/30'>
                                </div>

                                <div className='flex pt-2 pb-2 justify-between items-center'>
                                    <h3 className='text-base flex  text-white font-light'>
                                        Parcelas a serem pagas:
                                    </h3>
                                    <h1 className='text-white text-lg font-normal '>
                                        {installmentRemaining}
                                    </h1>
                                </div>

                                <div className='border-b border-white/30'>
                                </div>

                                <div className='flex pt-2 pb-2 justify-between items-center'>
                                    <h3 className='text-base flex  text-white font-light'>
                                        Valor da parcela:
                                    </h3>
                                    {isEditMode ? (null):(
                                        <h1 className='text-white text-lg font-normal '>
                                            R$ {formatValue(currentAmount)}
                                        </h1>
                                    )}
                                    
                                </div>

                                <div className='border-b border-white/30'>
                                </div>

                                <div className='flex pt-2 pb-2 justify-between items-center'>
                                    <h3 className='text-base flex  text-white font-light'>
                                        Valor restante a ser pago:
                                    </h3>
                                    <h1 className='text-white text-lg font-normal '>
                                        R$ {formatValue(totalValueOfFixedExpense - (installmentValue * paidInstallments))}
                                    </h1>
                                </div>

                                <div className='border-b border-white/30'>
                                </div>
            
                                <div className='flex pt-2 pb-2 justify-between items-center'>
                                    <h3 className='text-base flex  text-white font-light'>
                                        Valor ja pago:
                                    </h3>
                                    <h1 className='text-white text-lg font-normal '>
                                        R$ {formatValue(installmentValue * paidInstallments)}
                                    </h1>
                                </div>

                                <div className='border-b border-white/30'>
                                </div>
                                <div className='flex pt-2 pb-2 justify-between items-center'>
                                    <h3 className='text-base flex  text-white font-light'>
                                        Data do {typeExpense ? "pagamento" : "recebimento"} final:
                                    </h3>
                                    <h1 className='text-white text-lg font-normal '>
                                        {formatDateShow(fixedExpenseendDate)}
                                    </h1>
                                </div>
                            </>
                        )}    
                        

    
                        

                        <div className='border-b border-white/30'>
                        </div>
                        <div className='flex pt-2 pb-2 justify-between items-center'>
                            <h3 className='text-base flex  text-white font-light'>
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
                        <div className='flex pt-2 pb-2 justify-between w-full items-center'>
                            <h3 className='text-base flex min-w-5/8 text-white font-light'>
                                Quantidade de parcelas:
                            </h3>
                            {isEditMode ? (
                                <div className='flex justify-end items-end'>
                                    <Input type='change-installments-of-transaction'
                                        placeholder={installmentNumber.toString()}
                                        onChangeInputChildren={(value) => setEditedInstallments(parseInt(value) || 0)}
                                    />
                                </div>
                            ):(
                                <h1 className='text-white text-lg font-normal '>
                                    {installmentNumber}
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
                        <div className='flex pt-2 pb-2 justify-between items-center'>
                            <h3 className='text-base flex text-white font-light'>
                                Data desse {typeExpense ? 'pagamento' : 'recebimento'}:
                            </h3>
                            {isEditMode ? (
                                <>
                                    <div className='ml-4 pt-1'>
                                        <I18nProvider locale="pt-BR">
                                            <DatePicker 
                                                aria-label="Data da transação"
                                                value={dateOfThisPayment}
                                                onChange={(date) => date && setDateOfThisPayment(date)} //vai ta editando a data daquele primeiro pagamento
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
                        {isEditMode ? (null
                        ):(
                            <>
                                <div className='flex pt-2 pb-2 justify-between items-center'>
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
                                <div className='flex pt-2 pb-2 justify-between items-center'>
                                    <h3 className='text-base flex shrink-0 text-white font-light'>
                                        Valor ja pago:
                                    </h3>
                                    <h1 className='text-white text-lg font-normal '>
                                        R$ {formatValue(installmentValue * paidInstallments)}
                                    </h1>
                                </div>

                                <div className='border-b border-white/30'>
                                </div>
                            </>
                        )}
                        
                        <div className='flex pt-2 pb-2 justify-between items-center'>
                            <h3 className='text-base flex  text-white font-light'>
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
                        {}
                        {come_of_fixed != null ? (
                            isEditMode ? (
                                <div className='flex justify-end items-end w-full ml-3 mt-1'>
                                    <Input type='change-value-transaction'
                                        placeholder={formatValue(totalValueOfFixedExpense).toString()}
                                        onChangeInputChildren={(value) => setEditedValue(parseFloat(value) || 0)}
                                    />
                                </div>
                            ) : (
                                <>
                                    <h1 className='text-white text-[32px] font-normal pl-1'>
                                        {formatValue(totalValueOfFixedExpense)}
                                    </h1>
                                </>
                            )
                            
                        ): (
                           isEditMode && come_of_fixed == null ? (
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
                            )
                        )}
                        
                    </div>

                    <div className='border-b border-white/30'>
                    </div>

                    {/*
                        Começa aqui a parte q eh diferente entre desepesa fixa vs despesa normal
                    */}
                    <div className='flex pt-2 pb-2 justify-between items-center'>
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
                                                    onChange={(date) => date && setEditedDate(date)}
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
                                <h3 className='text-base flex text-white font-light'>
                                    Data do primeiro {typeExpense ? 'pagamento' : 'recebimento'}:
                                </h3>
                                {isEditMode ? (
                                    <>
                                        <div className='pt-1'>
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

                    <div className='flex pt-2 pb-5 justify-between items-center'>
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
                // 🔥 AJUSTE 1: Aumentei o z-index para z-[100] (ou mais, se precisar) e adicionei 'pb-24' para empurrar o centro do modal para cima, fugindo da Navbar.
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/10 backdrop-blur-sm px-4 pb-24">
                    
                    {/* Contêiner Principal */}
                    {/* 🔥 AJUSTE 2: Mudei max-h-[85vh] para max-h-[70vh] para ele não esticar tanto para baixo no mobile */}
                    <div className="rounded-[29px] w-full max-w-sm flex flex-col max-h-[76vh] bg-linear-to-tl from-white/50 via-black to-white/50 p-px shadow-2xl">
                        
                        {/* Fundo de Vidro com Imagem */}
                        {/* 🔥 AJUSTE 3: Troquei 'overflow-auto' por 'overflow-y-auto' para garantir que a rolagem funcione suave no celular */}
                        <div className="w-full h-full p-6 flex flex-col backdrop-blur-3xl rounded-[28px] overflow-y-auto bg-cover bg-center bg-no-repeat" 
                             style={{backgroundImage: `url("${backgroundDetailsExpense}")`, backgroundColor: 'rgba(0, 0, 0, 0.7)'}}>
                            
                            {/* O cabeçalho fica fixo no topo do scroll interno */}
                            <div className="shrink-0">
                                <h2 className="text-white text-2xl font-medium mb-1">
                                    Excluir transação
                                </h2>
                                <p className="text-white/70 text-base font-light mb-6">
                                    Essa é uma despesa recorrente. Como você deseja excluir?
                                </p>
                            </div>

                            <div className="flex flex-col gap-3">
                                {/* OPÇÃO 1 */}
                                <label className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${selectedDeleteType === 'this' ? 'border-red-500 bg-red-500/2' : 'border-white/15 hover:bg-white/5'}`}>
                                    <input type="radio" name="deleteType" value="this" className="hidden" checked={selectedDeleteType === 'this'} onChange={() => setSelectedDeleteType('this')} />
                                    <div className="flex flex-col">
                                        <span className="text-white font-medium text-sm">Pular somente esta</span>
                                        <span className="text-white/50 text-xs font-light mt-0.5">Exclui a parcela atual, mas mantém as próximas intactas.</span>
                                    </div>
                                </label>

                                {/* OPÇÃO 2 */}
                                <label className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${selectedDeleteType === 'next' ? 'border-red-500 bg-red-500/2' : 'border-white/15 hover:bg-white/5'}`}>
                                    <input type="radio" name="deleteType" value="next" className="hidden" checked={selectedDeleteType === 'next'} onChange={() => setSelectedDeleteType('next')} />
                                    <div className="flex flex-col">
                                        <span className="text-white font-medium text-sm">As próximas</span>
                                        <span className="text-white/50 text-xs font-light mt-0.5">Mantém a de hoje paga, e cancela todas do mês que vem em diante.</span>
                                    </div>
                                </label>

                                {/* OPÇÃO 3 */}
                                <label className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${selectedDeleteType === 'this_and_next' ? 'border-red-500 bg-red-500/2' : 'border-white/15 hover:bg-white/5'}`}>
                                    <input type="radio" name="deleteType" value="this_and_next" className="hidden" checked={selectedDeleteType === 'this_and_next'} onChange={() => setSelectedDeleteType('this_and_next')} />
                                    <div className="flex flex-col">
                                        <span className="text-white font-medium text-sm">Esta e as próximas</span>
                                        <span className="text-white/50 text-xs font-light mt-0.5">Cancela o contrato agora. Estorna a de hoje e cancela as futuras.</span>
                                    </div>
                                </label>

                                {/* OPÇÃO 4 */}
                                <label className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${selectedDeleteType === 'all' ? 'border-red-500 bg-red-500/2' : 'border-white/15 hover:bg-white/5'}`}>
                                    <input type="radio" name="deleteType" value="all" className="hidden" checked={selectedDeleteType === 'all'} onChange={() => setSelectedDeleteType('all')} />
                                    <div className="flex flex-col">
                                        <span className="text-white font-medium text-sm text-red-400">Apagar todo o histórico</span>
                                        <span className="text-white/50 text-xs font-light mt-0.5">Apaga do sistema e estorna todo o dinheiro pago no passado.</span>
                                    </div>
                                </label>
                            </div>

                            {/* DIVISÓRIA E BOTÕES - Ficam no final da rolagem */}
                            <div className="mt-auto shrink-0 pt-2">
                                <div className="mt-2 mb-2 h-px w-full"></div>
                                <div className="flex justify-between gap-3">
                                    <Button type='cancel-del-expense'
                                            onClickButtonChildren={()=>{setIsDeleteModalOpen(false)}}
                                            />
                                    <Button type='confirm-del-expense'
                                            onClickButtonChildren={()=>{executeDelete(selectedDeleteType)}}
                                            loading={loading}
                                            />
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            )}
            {errorModalMsg !== '' && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 pb-24">
                    <div className="rounded-[29px] w-full max-w-sm flex flex-col bg-linear-to-tl from-red-500/50 via-black to-red-500/30 p-px shadow-2xl">
                        <div className="w-full p-6 flex flex-col backdrop-blur-3xl rounded-[28px] bg-[#1e1c28]/90">
                            
                            <h2 className="text-white text-xl font-medium mb-3 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-red-500">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                Ação Inválida
                            </h2>
                            
                            <p className="text-white/80 text-sm font-light mb-6">
                                {errorModalMsg}
                            </p>
                            
                            <button 
                                onClick={() => setErrorModalMsg('')} 
                                className="w-full py-3 rounded-[14px] text-white bg-white/10 hover:bg-white/20 transition-all font-medium text-sm flex justify-center">
                                Entendi
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {isEditBehaviorModalOpen && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 pb-24">
                    <div className="rounded-[29px] w-full max-w-sm flex flex-col max-h-[76vh] bg-linear-to-tl from-white/50 via-black to-white/50 p-px shadow-2xl">
                        <div className="w-full h-full p-6 flex flex-col backdrop-blur-3xl rounded-[28px] overflow-y-auto bg-cover bg-center bg-no-repeat" 
                             style={{backgroundImage: `url("${backgroundDetailsExpense}")`, backgroundColor: 'rgba(0, 0, 0, 0.7)'}}>
                            
                            <div className="shrink-0">
                                <h2 className="text-white text-2xl font-medium mb-1">
                                    Aplicar alterações
                                </h2>
                                <p className="text-white/70 text-sm font-light mb-6">
                                    Você alterou o valor ou as parcelas de uma conta que já está em andamento. Como deseja aplicar isso?
                                </p>
                            </div>

                            <div className="flex flex-col gap-3">
                                {/* OPÇÃO 1: RENEGOCIAÇÃO (Redistribuir) */}
                                <label className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${selectedEditBehavior === 'future_only' ? 'border-violet-500 bg-violet-500/10' : 'border-white/15 hover:bg-white/5'}`}>
                                    <input type="radio" name="editBehavior" value="future_only" className="hidden" checked={selectedEditBehavior === 'future_only'} onChange={() => setSelectedEditBehavior('future_only')} />
                                    <div className="flex flex-col">
                                        <span className="text-white font-medium text-sm">Redistribuir o restante (Renegociação)</span>
                                        <span className="text-white/50 text-xs font-light mt-1">O que já foi pago no passado fica intacto. A diferença será dividida apenas nas próximas parcelas.</span>
                                    </div>
                                </label>

                                {/* OPÇÃO 2: RETROATIVO (Corrigir Histórico) */}
                                <label className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${selectedEditBehavior === 'retroactive' ? 'border-violet-500 bg-violet-500/10' : 'border-white/15 hover:bg-white/5'}`}>
                                    <input type="radio" name="editBehavior" value="retroactive" className="hidden" checked={selectedEditBehavior === 'retroactive'} onChange={() => setSelectedEditBehavior('retroactive')} />
                                    <div className="flex flex-col">
                                        <span className="text-white font-medium text-sm">Corrigir o histórico (Erro de digitação)</span>
                                        <span className="text-white/50 text-xs font-light mt-1">Altera o valor das parcelas antigas que já foram pagas e ajusta o seu saldo atual.</span>
                                    </div>
                                </label>
                            </div>

                            <div className="mt-auto shrink-0 pt-2">
                                <div className="mt-4 mb-4 h-px w-full bg-linear-to-r from-violet-900 via-white to-violet-900"></div>
                                <div className="flex justify-between gap-3">
                                    <Button type='cancel-del-expense'
                                            onClickButtonChildren={()=>{setIsEditBehaviorModalOpen(false)}}
                                            />
                                    <Button type='confirm-edit-expense'
                                            onClickButtonChildren={() => executeEdit(
                                            selectedEditBehavior, 
                                            editedInstallments !== undefined ? editedInstallments : (installmentNumber as number), 
                                            editedValue !== undefined ? editedValue : (come_of_fixed != null ? totalValueOfFixedExpense : currentAmount)
                                        )}
                                            loading={loading} />
                                    {/* <button 
                                        onClick={() => executeEdit(
                                            selectedEditBehavior, 
                                            editedInstallments !== undefined ? editedInstallments : (installmentNumber as number), 
                                            editedValue !== undefined ? editedValue : (come_of_fixed != null ? totalValueOfFixedExpense : currentAmount)
                                        )} 
                                        disabled={loading}
                                        className="w-full py-3 rounded-[14px] text-white bg-violet-600/80 hover:bg-violet-700/90 transition-all font-medium text-sm flex justify-center shadow-lg shadow-violet-900/20">
                                        {loading ? 'Salvando...' : 'Confirmar'}
                                    </button> */}
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default DetailsExpense