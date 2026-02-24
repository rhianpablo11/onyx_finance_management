
//use for testing for now

import DetailsExpense from "../components/detailsExpense"

function InsightsPage(){
    

    return(
        <>
            <DetailsExpense nameExpense="Gasto Gasolina"
                            nameUser="Rhian Pablo"
                            telephone="75 98765-4321"
                            amount={900.00}
                            dateExpense="26/fev/26"
                            paymentMethod="Cartão de Crédito"
                            description="Gasto com gasolina para o fiat punto, coloca da gasolina aditivada no posto X."
                            category="Outros"
                            idExpense={1} />
        </>
    )
}


export default InsightsPage