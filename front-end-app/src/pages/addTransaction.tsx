import { useEffect, useState } from 'react'
import backgroundExtractPage from '../assets/Group 8.svg?url'
import Input from '../components/ui/input'
import SelectionComp from '../components/ui/selection'
import { I18nProvider } from 'react-aria'
import { useExpense } from '../hooks/useExpense'
import { parseDate } from '@internationalized/date'
import { DatePicker } from '../components/react-aria/DatePicker'
import ToggleButton from '../components/ui/toggleButton'
import Button from '../components/ui/button'

function AddTransaction(){

    const tzOffset = (new Date()).getTimezoneOffset() * 60000;
    const localISOTime = (new Date(Date.now() - tzOffset)).toISOString().slice(0, 10);
    const [nameExpense, setNameExpense] = useState<string>('')
    const [description, setDescription] = useState<string>('')
    const [amount, setAmount] = useState<string>('')
    const [paymentMethod, setPaymentMethod] = useState<string>('Dinheiro físico')
    const [dateOfThisPayment, setDateOfThisPayment] = useState(parseDate(localISOTime))
    const [isInstallment, setIsInstallment] = useState<boolean>(false)
    const [isReceivedMoney, setIsReceivedMoney] = useState<boolean>(false)
    const [stateOfForms, setStateOfForms] = useState<'1' | '2'>('1')
    const { getUserCategories, createManualExpense, loading } = useExpense();
    const [categoriesUser, setCategoriesUser] = useState<{label: string, value: string}[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [isContinuous, setIsContinuous] = useState<boolean>(false)
    
    // 🔥 CORREÇÃO 1: Adicionado o tipo <string> e um valor inicial!
    const [installmentsCount, setInstallmentsCount] = useState<string>('')
    const [paymentRecurrency, setPaymentRecurrency] = useState<string>('Mensal')
    
    // 🔥 CORREÇÃO 2: Criado o estado endDate que o TypeScript tava cobrando!
    const [endDate, setEndDate] = useState(parseDate(localISOTime)) 
    
    const [haveEndDateOfContinuousExpense, setHaveEndDateOfContinuousExpense] = useState(false)
    const nameOfButton = (isInstallment && stateOfForms === '1') ? 'Avançar' : 'Salvar';
    

    const handleButton = async () => {
        if(isInstallment && stateOfForms === '1') {
            // Se for parcelado, só avança de tela
            setStateOfForms('2');
        } else {
            // HORA DE SALVAR NO BANCO!
            try {
                // Formata o valor (Tira os pontos de milhar e troca a vírgula por ponto para o Python entender)
                const formattedValue = parseFloat(amount.replace(/\./g, '').replace(',', '.'));

                const payload = {
                    name: nameExpense,
                    description: description,
                    value: isNaN(formattedValue) ? 0 : formattedValue,
                    payment_method: paymentMethod,
                    category_id: parseInt(selectedCategory), 
                    date: dateOfThisPayment.toString(),
                    type_expense: isReceivedMoney, 
                    is_recurrent: isInstallment,
                    is_continuous: isContinuous,
                    end_date: (isContinuous && haveEndDateOfContinuousExpense && endDate) ? endDate.toString() : null,
                    installments_count: isContinuous ? 1 : parseInt(installmentsCount || '1'),
                    charge_type: paymentRecurrency
                };

                console.log("Enviando pro banco...", payload);

                // Chama a função do hook e manda os dados pro backend!
                await createManualExpense(payload);
                
                alert('Transação salva com sucesso!');
                
                // Aqui você pode limpar os states do formulário ou redirecionar o cara pra Home!
                // window.location.href = '/home' (ou usar o hook de navegação do React Router)

            } catch (error) {
                console.error("Deu ruim na hora de salvar", error);
                alert("Ocorreu um erro ao salvar a transação.");
            }
        }
    }

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const cats = await getUserCategories();
                setCategoriesUser(cats);
            } catch (error) {
                console.error("Erro ao puxar categorias:", error);
            }
        };
        fetchCategories();
    }, []);


    const handleButtonBack = () => {
        console.log('butao voltar')
        setStateOfForms('1')
    }

    const stateToReturn = () => {
        if(stateOfForms == '1'){
            return(
                <>
                    <div className='flex flex-col w-full gap-y-2 mb-2'>
                        <h1 className='text-white font-normal text-sm'>
                            Nome da transação:
                        </h1>
                        <div className=''>
                            <Input type='name-expense'
                                onChangeInputChildren={(value) => setNameExpense(value)}
                                placeholder='Compra de BMW M4 Competition'
                                value={nameExpense} />
                        </div>
                    </div>

                    <div className='border-b border-white/30'></div>

                    <div className='flex flex-col w-full gap-y-2 mb-2 mt-2'>
                        <h1 className='text-white font-normal text-sm'>
                            Descrição da transação:
                        </h1>
                        <div className=''>
                            <Input type='description-expense'
                                onChangeInputChildren={(value) => setDescription(value)}
                                placeholder='Detalhes da transação'
                                value={description} />
                        </div>
                    </div>

                    <div className='border-b border-white/30'></div>


                    <div className='flex flex-col w-full gap-y-2 mb-2 mt-2'>
                        <h1 className='text-white font-normal text-sm'>
                            Valor total:
                        </h1>
                        <div className='flex justify-between items-center gap-x-4'>
                            <h1 className='text-white text-2xl font-normal'>R$</h1>
                            <Input type='change-value-transaction'
                                onChangeInputChildren={(value) => setAmount(value)}
                                placeholder='900.000,00'
                                value={amount} />
                        </div>
                    </div>

                    <div className='border-b border-white/30'></div>

                    <div className='flex justify-between items-center gap-x-4 w-full gap-y-2 mb-2 mt-2'>
                        <h1 className='text-white font-normal text-sm'>
                            Pagamento via:
                        </h1>
                        <div className='flex '>
                            <SelectionComp useFor='select-type-payment'
                                                options={[
                                                        { label: 'Dinheiro Físico', value: 'Dinheiro Físico' },
                                                        { label: 'Pix', value: 'Pix' },
                                                        { label: 'Cartão de Crédito', value: 'Cartão de Crédito' },
                                                        { label: 'Cartão de Débito', value: 'Cartão de Débito' }
                                                    ]}
                                                placeholder={'Dinheiro físico'}
                                                initialValue={'Dinheiro físico'}
                                                onChange={(value) => setPaymentMethod(value)}
                                    />
                        </div>
                    </div>

                    <div className='border-b border-white/30'></div>


                    <div className='flex justify-between items-center gap-x-4 w-full gap-y-2 mb-2 mt-2'>
                        <h1 className='text-white font-normal text-sm'>
                            Categoria:
                        </h1>
                        <div className='flex '>
                            <SelectionComp  useFor='select-category'
                                            options={categoriesUser.length > 0 ? categoriesUser : [{ label: 'Carregando...', value: '0' }]}
                                            placeholder={'Selecione'}
                                            onChange={(value) => setSelectedCategory(value)} initialValue={''}
                                            />
                        </div>
                    </div>

                    <div className='border-b border-white/30'></div>

                    <div className='flex justify-between items-center gap-x-4 w-full gap-y-2 mb-2 mt-2'>
                        <h1 className='text-white font-normal text-sm'>
                            Cobrança inicia:
                        </h1>
                        <div className='flex '>
                            <I18nProvider locale="pt-BR">
                                <DatePicker 
                                    aria-label="Data da transação"
                                    value={dateOfThisPayment}
                                    onChange={(date) => date && setDateOfThisPayment(date)} 
                                    isDisabled={false}
                                    className="w-full flex items-center justify-between rounded-[14px] h-10 text-white focus:outline-none"
                                />
                            </I18nProvider>
                        </div>
                    </div>

                    <div className='border-b border-white/30'></div>

                    
                    <div className='flex justify-between items-center gap-x-4 w-full gap-y-2 mb-2 mt-2'>
                        <h1 className='text-white font-normal text-sm'>
                            Entrada de dinheiro:
                        </h1>
                        <div className='flex '>
                            <ToggleButton isChecked={isReceivedMoney} onChange={setIsReceivedMoney} />
                        </div>
                    </div>

                    <div className='border-b border-white/30'></div>


                    <div className='flex justify-between items-center gap-x-4 w-full gap-y-2 mb-2 mt-2'>
                        <h1 className='text-white font-normal text-sm'>
                            Parcelado/Recorrente:
                        </h1>
                        <div className='flex '>
                            <ToggleButton isChecked={isInstallment} onChange={setIsInstallment} />
                        </div>
                    </div>

                    <div className='border-b border-white/30'></div>

                    <div>

                    <div className='mt-auto pt-4 pb-2 w-full flex justify-center'>
                        <Button type='save-or-next-page-of-add-expense'
                                onClickButtonChildren={handleButton}
                                nameConfig={nameOfButton}
                                loading={loading} />
                    </div>
                        
                </div>
                </>
            )
        } else if (stateOfForms === '2') {
            return (
                <>
                    <div className='w-fit'>
                        <h1 className='text-white font-normal text-base'>Informações para despesa fixa</h1>
                        <div className='border-b border-white/30 mb-2 mt-2'></div>
                    </div>
                    



                    <div className='flex justify-between items-center gap-x-4 w-full gap-y-2 mb-2 mt-2'>
                        <h1 className='text-white font-normal text-sm'>
                            {isReceivedMoney ? 'Recebimento contínuo' : 'Pagamento contínuo'}:
                        </h1>
                        <div className='flex '>
                            <ToggleButton isChecked={isContinuous} onChange={setIsContinuous} />
                        </div>
                    </div>

                    <div className='border-b border-white/30'></div>


                    <div className='flex justify-between items-center gap-x-4 w-full gap-y-2 mb-2 mt-2'>
                        <h1 className='text-white font-normal text-sm'>
                            Há data para terminar:
                        </h1>
                        <div className='flex '>
                            <ToggleButton isChecked={haveEndDateOfContinuousExpense} onChange={setHaveEndDateOfContinuousExpense} />
                        </div>
                    </div>

                    <div className='border-b border-white/30'></div>
                    {isContinuous ? (
                        <>
                            {haveEndDateOfContinuousExpense && (
                                <>
                                <div className='flex justify-between items-center gap-x-4 w-full gap-y-2 mb-2 mt-2'>
                                    <h1 className='text-white font-normal text-sm'>
                                        Data final:
                                    </h1>
                                    <div className='flex '>
                                        <I18nProvider locale="pt-BR">
                                            {/* 🔥 CORREÇÃO 3: Aqui era dateOfThisPayment, mudei pro estado correto endDate! */}
                                            <DatePicker 
                                                aria-label="Data final da transação"
                                                value={endDate}
                                                onChange={(date) => date && setEndDate(date)} 
                                                isDisabled={false}
                                                className="w-full flex items-center justify-between rounded-[14px] h-10 text-white focus:outline-none"
                                            />
                                        </I18nProvider>
                                    </div>
                                </div>
                                <div className='border-b border-white/30'></div>
                            </>
                            )}
                        </>
                    ): (
                        <>
                            <div className='flex justify-between items-center gap-x-4 w-full gap-y-2 mb-2 mt-2'>
                                <h1 className='text-white font-normal text-sm'>
                                    Quantidade de parcelas:
                                </h1>
                                <div className='w-24'>
                                    <Input type='change-installments-of-transaction'
                                        value={installmentsCount}
                                        onChangeInputChildren={(value) => setInstallmentsCount(value)}
                                        placeholder='Ex: 10' />
                                </div>
                            </div>

                            <div className='border-b border-white/30'></div>

                        </>
                    )}
                    {}
                    <div className='flex justify-between items-center gap-x-4 w-full gap-y-2 mb-2 mt-2'>
                        <h1 className='text-white font-normal text-sm'>
                            {isReceivedMoney ? 'Recimento no período' : 'Pagamento no período'}:
                        </h1>
                        <div className='flex '>
                            <SelectionComp useFor='select-type-payment'
                                                options={[
                                                        { label: 'Anual', value: 'Anual' },
                                                        { label: 'Mensal', value: 'Mensal' },
                                                        { label: 'Quinzenal', value: 'Quinzenal' },
                                                        { label: 'Semanal', value: 'Semanal' }
                                                ]}
                                                placeholder={'Mensal'}
                                                initialValue={'Mensal'}
                                                onChange={(value) => setPaymentRecurrency(value)}
                            />
                        </div>
                    </div>

                    <div className='border-b border-white/30'></div>

                    <div className='mt-auto gap-x-3 px-6 pt-4 pb-2 w-full flex justify-center'>
                        <Button type='save-or-next-page-of-add-expense'
                                onClickButtonChildren={handleButtonBack}
                                nameConfig='Voltar' />
                        <Button type='save-or-next-page-of-add-expense'
                                onClickButtonChildren={handleButton}
                                nameConfig={nameOfButton}
                                loading={loading} />
                    </div>


                </>
            )
        }

    }

    

    return(
        <>
            <div className="rounded-[29px] w-full h-full flex-1 bg-linear-to-tl from-white/50 via-black to-white/50 p-px">
                {/* Mantive o pb-[140px] e overflow-y-auto pra sua barra não engolir o fundo kkkk */}
                <div className="w-full h-full px-2.5 pt-4 pb-[140px] flex flex-col  backdrop-blur-3xl  rounded-[28px] overflow-y-auto bg-cover  bg-center bg-no-repeat" style={{backgroundImage: `url("${backgroundExtractPage}")`}}>
                    {stateToReturn()}
                </div>
            </div>
        </>
    )
}

export default AddTransaction