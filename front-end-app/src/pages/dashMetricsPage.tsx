import Balance from "../components/balance"
import TransactionsRecents from "../components/transactionsRecents"
import type { DashMetricsPageProps } from "../interfaces/interfacesComponents"


function DashMetricsPage(props: DashMetricsPageProps){
    const {value, legend, incoming, dayExpenses, monthReceives} = props

    return(
        <>
            <Balance value={value}
                             legend={legend}
                             incoming={incoming} />
            <TransactionsRecents dayExpenses={dayExpenses}
                                monthReceives={monthReceives}/>
        </>
    )
}

export default DashMetricsPage