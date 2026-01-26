

export const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
};

export const getDateRangeByOption = (optionValue: string) => {
    const today = new Date();
    const endDate = new Date(today); // Por padrão, o fim é hoje
    let startDate = new Date(today);

    switch (optionValue) {
        case "1": // Este mês
            // Do dia 1º até hoje
            startDate = new Date(today.getFullYear(), today.getMonth(), 1);
            break;

        case "6": // Últimos 7 dias
            startDate.setDate(today.getDate() - 7);
            break;

        case "2": // Mês passado
            // Fim: Último dia do mês passado (dia 0 do mês atual)
            endDate.setDate(0); 
            // Início: Dia 1º do mês passado
            startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
            break;

        case "3": // Últimos 3 meses
            startDate.setMonth(today.getMonth() - 3);
            break;

        case "4": // Últimos 6 meses
            startDate.setMonth(today.getMonth() - 6);
            break;

        case "5": // Período personalizado
            return null; // Retorna null para sinalizar que o usuário deve escolher
            
        default:
            // Padrão: Este mês
            startDate = new Date(today.getFullYear(), today.getMonth(), 1);
            break;
    }

    return {
        startDate: formatDate(startDate),
        endDate: formatDate(endDate)
    };
};