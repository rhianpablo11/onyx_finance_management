
import BalanceMonthsBarChart from "../components/balanceMonthsBarChart"
import CategoryOfExpenses from "../components/categoryOfExpenses"
import FinanceComportment from "../components/financeComportment"
import MonthAnalisys from "../components/monthAnalisys"



function InsightsPage(){
    

    return(
        <>
            <div className="flex flex-col w-full items-center">
                {/* <FinanceComportment title="Comportamento Financeiro"
                                    description="Ao investir na manutenção do veículo, percebemos que você também compra ferramentas e itens de manutenção. Um bom planejamento pode te ajudar a economizar nessas aquisições."
                /> */}
                {/* <CategoryOfExpenses title="Onde você gasta:" /> */}
                <BalanceMonthsBarChart />
            </div>
           
           <MonthAnalisys />
           
           
        </>
    )
}


export default InsightsPage