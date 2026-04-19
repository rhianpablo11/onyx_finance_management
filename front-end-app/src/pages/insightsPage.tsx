
import BalanceMonthsBarChart from "../components/balanceMonthsBarChart"
import CategoryOfExpenses from "../components/categoryOfExpenses"
import FinanceComportment from "../components/financeComportment"
import MonthAnalisys from "../components/monthAnalisys"

const data = [
  { 
    name: 'Alimentação', 
    value: 50, 
    variant: 'ifood', 
    amount: 'R$ 850', 
    iconColor: 'text-ifood-red-500' 
  },
  { 
    name: 'Transporte', 
    value: 45, 
    variant: 'uber', 
    amount: 'R$ 320', 
    iconColor: 'text-gray-900' 
  },
  { 
    name: 'Investimento', 
    value: 90, 
    variant: 'onyx', 
    amount: 'R$ 1.500', 
    iconColor: 'text-onyx-green-500' 
  },
] ;

const monthlyData = [
  { name: 'Nov', Entradas: 4200, Saídas: 3800 },
  { name: 'Dez', Entradas: 5100, Saídas: 4900 },
  { name: 'Jan', Entradas: 4800, Saídas: 3200 },
  { name: 'Fev', Entradas: 3900, Saídas: 4100 }, 
  { name: 'Mar', Entradas: 6200, Saídas: 4500 },
  { name: 'Abr', Entradas: 5500, Saídas: 3100 },
];


import type { ProphetData } from '../interfaces/interfacesComponents';

const prophetData: ProphetData[] = [
  // --- PASSADO (DADOS REAIS) ---
  { date: '01 Abr', real: 3100, prev: null, band: null },
  { date: '02 Abr', real: 2900, prev: null, band: null },
  { date: '03 Abr', real: 2950, prev: null, band: null },
  { date: '04 Abr', real: 3400, prev: null, band: null },
  { date: '05 Abr', real: 3200, prev: null, band: null },
  { date: '06 Abr', real: 3800, prev: null, band: null },
  { date: '07 Abr', real: 3600, prev: null, band: null },
  { date: '08 Abr', real: 3450, prev: null, band: null },
  { date: '09 Abr', real: 3900, prev: null, band: null },
  { date: '10 Abr', real: 4100, prev: null, band: null },
  { date: '11 Abr', real: 3800, prev: null, band: null },
  { date: '12 Abr', real: 4300, prev: null, band: null },
  { date: '13 Abr', real: 4000, prev: null, band: null },
  { date: '14 Abr', real: 4000, prev: 4000, band: [4150, 4150] },
  
  // --- PONTO DE CONEXÃO (HOJE) ---
  { date: '15 Abr', real: null, prev: 4150, band: [4150, 4150] }, 
  
  // --- FUTURO (PREVISÃO DA IA) ---
  // Repare como a banda (margem de erro) vai ficando cada vez mais larga!
  { date: '16 Abr', real: null, prev: 4000, band: [3800, 4200] },
  { date: '17 Abr', real: null, prev: 3900, band: [3600, 4200] },
  { date: '18 Abr', real: null, prev: 4100, band: [3700, 4500] },
  { date: '19 Abr', real: null, prev: 3800, band: [3300, 4300] },
  { date: '20 Abr', real: null, prev: 4200, band: [3600, 4800] },
  { date: '21 Abr', real: null, prev: 4500, band: [3800, 5200] },
  { date: '22 Abr', real: null, prev: 4300, band: [3500, 5100] },
  { date: '23 Abr', real: null, prev: 4700, band: [3800, 5600] },
  { date: '24 Abr', real: null, prev: 4600, band: [3600, 5600] },
  { date: '25 Abr', real: null, prev: 4900, band: [3800, 6000] },
  { date: '26 Abr', real: null, prev: 4800, band: [3600, 6000] },
  { date: '27 Abr', real: null, prev: 5100, band: [3800, 6400] },
  { date: '28 Abr', real: null, prev: 5300, band: [3900, 6700] },
  { date: '29 Abr', real: null, prev: 5000, band: [3500, 6500] },
  { date: '30 Abr', real: null, prev: 5400, band: [3700, 7100] },
];


function InsightsPage(){
    

    return(
        <>
            <div className="flex flex-col w-full items-center gap-3 h-full overflow-y-auto ">
                <FinanceComportment title="Comportamento Financeiro"
                                    description="Ao investir na manutenção do veículo, percebemos que você também compra ferramentas e itens de manutenção. Um bom planejamento pode te ajudar a economizar nessas aquisições."
                />
                <CategoryOfExpenses data={data} />
                <BalanceMonthsBarChart monthlyData={monthlyData} />
                <MonthAnalisys prophetData={prophetData} />
            </div>
        </>
    )
}


export default InsightsPage