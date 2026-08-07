
import { useEffect, useState } from "react";
import BalanceMonthsBarChart from "../components/balanceMonthsBarChart"
import CategoryOfExpenses from "../components/categoryOfExpenses"
import FinanceComportment from "../components/financeComportment"
import MonthAnalisys from "../components/monthAnalisys"
import { useInsights } from "../hooks/useInsights";
import type { 
    CategorieExpense, 
    monthlyBalanceData, 
    ProphetData 
} from '../interfaces/interfacesComponents';

// const data = [
//   { 
//     name: 'Alimentação',  
//     amount: 850,
//     percentage: 50
//   },
//   { 
//     name: 'Ferramentas e Manutenção',
//     amount: 320, 
//     percentage: 50
//   },
//   { 
//     name: 'Serviços de Telecomunicações',
//     amount: 1500, 
//     percentage: 50
//   },
//   { 
//     name: 'Outros',
//     amount: 100, 
//     percentage: 50
//   },
// ] ;

// const monthlyData = [
  
//   { name: 'Dez', Entradas: 5100, Saídas: 4900 },
//   { name: 'Jan', Entradas: 4800, Saídas: 3200 },
//   { name: 'Fev', Entradas: 3900, Saídas: 4100 }, 
//   { name: 'Mar', Entradas: 6200, Saídas: 4500 },
//   { name: 'Abr', Entradas: 5500, Saídas: 3100 },
// ];



// const prophetData: ProphetData[] = [
//   // --- HISTÓRICO REAL (Linha Verde) ---
//   { date: '01 Jan', real: 65, prev: null, band: null },
//   { date: '07 Jan', real: 88, prev: null, band: null },
//   { date: '12 Jan', real: -1077, prev: null, band: null },
//   { date: '14 Jan', real: -991, prev: null, band: null },
//   { date: '16 Jan', real: -926, prev: null, band: null },
//   { date: '20 Jan', real: -852, prev: null, band: null },
//   { date: '25 Jan', real: -829, prev: null, band: null },
//   { date: '01 Fev', real: -816, prev: null, band: null },
//   { date: '03 Fev', real: -793, prev: null, band: null },
//   { date: '10 Fev', real: -1793, prev: null, band: null },
//   { date: '12 Fev', real: -1767, prev: null, band: null },
//   { date: '14 Fev', real: -1702, prev: null, band: null },
//   { date: '15 Fev', real: -1663, prev: null, band: null },
//   { date: '20 Fev', real: -1488, prev: null, band: null },
//   { date: '25 Fev', real: -1463, prev: null, band: null },
//   { date: '28 Fev', real: -1447, prev: null, band: null },
//   { date: '05 Mar', real: -1424, prev: null, band: null },
//   { date: '09 Mar', real: -2224, prev: null, band: null },
//   { date: '12 Mar', real: -2141, prev: null, band: null },
//   { date: '16 Mar', real: -2076, prev: null, band: null },
//   { date: '20 Mar', real: -1897, prev: null, band: null },
//   { date: '25 Mar', real: -1757, prev: null, band: null },
//   { date: '04 Abr', real: -1687, prev: null, band: null },
//   { date: '05 Abr', real: -1632, prev: null, band: null },
//   { date: '06 Abr', real: -1757, prev: null, band: null },
//   { date: '09 Abr', real: -2457, prev: null, band: null },

//   // --- PONTO DE CONEXÃO (Último dia com saldo real - 11 de Abril) ---
//   // A Costura perfeita: O futuro nasce do valor exato do passado.
//   { date: '11 Abr', real: -2378, prev: -2378, band: [-2378, -2378] },

//   // --- FUTURO PREDITO PELA IA (Linha Roxa + Margem de Erro) ---
//   { date: '12 Abr', real: null, prev: -2117, band: [-2553, -1686] },
//   { date: '13 Abr', real: null, prev: -2460, band: [-2916, -2015] },
//   { date: '14 Abr', real: null, prev: -2361, band: [-2795, -1901] },
//   { date: '15 Abr', real: null, prev: -2118, band: [-2560, -1678] },
//   { date: '16 Abr', real: null, prev: -2391, band: [-2837, -1965] },
//   { date: '17 Abr', real: null, prev: -2417, band: [-2832, -1978] },
//   { date: '18 Abr', real: null, prev: -2362, band: [-2811, -1954] },
//   { date: '19 Abr', real: null, prev: -2234, band: [-2666, -1816] },
//   { date: '20 Abr', real: null, prev: -2577, band: [-3017, -2147] },
//   { date: '21 Abr', real: null, prev: -2479, band: [-2936, -2072] },
//   { date: '22 Abr', real: null, prev: -2236, band: [-2677, -1821] },
//   { date: '23 Abr', real: null, prev: -2509, band: [-2974, -2058] },
//   { date: '24 Abr', real: null, prev: -2534, band: [-2963, -2116] },
//   { date: '25 Abr', real: null, prev: -2480, band: [-2895, -2045] },
//   { date: '26 Abr', real: null, prev: -2352, band: [-2785, -1957] }
// ];


function InsightsPage(){
    const {getInsights, loading, error} = useInsights()
    const [categorysOfExpenses, setCategorysOfExpenses] = useState<CategorieExpense[]>([]);
    const [financeComportment, setFinanceComportment] = useState<{title: string, text_content: string}>();
    const [monthlyData, setMonthlyData] = useState<monthlyBalanceData[]>([]);
    const [prophetData, setProphetData] = useState<ProphetData[]>([]);
    const [endMonthBalance, setEndMonthBalance] = useState<number>(0);
    const [anomaliesData, setAnomaliesData] = useState<{title: string, text_content: string}>();

    useEffect(() => {
        const fetchInsightsData = async () => {
            try {
                const insights_data = await getInsights();
                console.log("Dados de Insight do Back-end chegaram:",insights_data)
                if (insights_data) {
                    setCategorysOfExpenses(insights_data.categorys_of_expenses || []);
                    setFinanceComportment(insights_data.investigator);
                    setMonthlyData(insights_data.month_expenses_graphic || []);
                    setEndMonthBalance(insights_data.prophet.value_predicted_to_end_month || 0);
                    setAnomaliesData(insights_data.anomalie);

                    const rawProphet = insights_data.prophet.graphic_data || [];
                    
                    // cleanup data for Recharts: Remove previous AI predictions and connect the last real value to the first AI prediction
                    let lastRealIndex = -1;
                    rawProphet.forEach((item: any, index: number) => {
                        if (item.real !== null) {
                            lastRealIndex = index;
                        }
                    });

                    
                    const cleanedProphet = rawProphet.map((item: any, index: number) => {
                        if (index < lastRealIndex) {
                            // Dias passados: Apaga a linha da IA, deixa só a Verde
                            return { ...item, prev: null, band: null };
                        }
                        if (index === lastRealIndex) {
                            // HOJE: Costura a linha da IA (Roxa) pra nascer do valor Real (Verde)
                            return { ...item, prev: item.real, band: [item.real, item.real] };
                        }
                        // Futuro: Deixa a linha da IA e a Banda aparecerem normal
                        return item;
                    });

                    // Salva os dados pro Recharts!
                    setProphetData(cleanedProphet);
                }
            } catch (error) {
                console.error("Erro ao buscar insights:", error);
            }
        }
    
        fetchInsightsData();
        
    }, [])


    if (loading) {
        return (
            <div className="flex flex-col w-full h-full items-center justify-center">
                {/* Aqui você pode colocar um spinner bonitão do Tailwind se quiser */}
                <p className="text-violet-400 font-medium animate-pulse">Analisando seu financeiro...</p>
            </div>
        );
    }

    // Se a API der pau (ex: servidor desligado)
    if (error) {
        return (
            <div className="flex w-full h-full items-center justify-center">
                <p className="text-rose-500 font-medium">Erro ao carregar dados. Tente novamente.</p>
            </div>
        );
    }

    return(
        <>
            <div className="flex flex-col w-full items-center gap-3 h-full overflow-y-auto ">
                {financeComportment?.title && (
                    <FinanceComportment 
                        title={financeComportment.title}
                        description={financeComportment.text_content}
                    />
                )}
                {anomaliesData?.title && (
                    <FinanceComportment 
                        title={anomaliesData.title}
                        description={anomaliesData.text_content}
                    />
                )}
                {prophetData.length > 0 && (
                    <MonthAnalisys prophetData={prophetData}
                                   endMonthBalance={endMonthBalance} />
                )}

                {categorysOfExpenses.length > 0 && (
                    <CategoryOfExpenses data={categorysOfExpenses} />
                )}

                {monthlyData.length > 0 && (
                    <BalanceMonthsBarChart monthlyData={monthlyData} />
                )}

                
            </div>
        </>
    )
}


export default InsightsPage