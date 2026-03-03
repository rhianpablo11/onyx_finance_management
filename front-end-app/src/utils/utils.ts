import { endOfMonth } from 'date-fns';
import {v4 as uuidv4} from 'uuid'
import { removeCookie } from '../services/cookiesService';
import { removeToken } from '../services/tokenService';
import { getIdUser, removeIdUser, setBiometricExistence } from '../services/localStorageService';


export const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
};

export const getDateRangeByOption = (optionValue: string) => {
    const today = new Date();
    let endDate = new Date(today); // Por padrão, o fim é hoje
    let startDate = new Date(today);

    switch (optionValue) {
        case "1": // Este mês
            // Do dia 1º até hoje
            startDate = new Date(today.getFullYear(), today.getMonth(), 1);
            endDate = endOfMonth(today); 
            
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


export const getDeviceId = () =>{
    let deviceId = localStorage.getItem('onyxDeviceId')

    if(!deviceId){
        deviceId = uuidv4()
        localStorage.setItem('onyxDeviceId', deviceId)
    }
    return deviceId
}


export const getGreting = () => {
    const hour = new Date().getHours()
    console.log(hour)
    if(hour >= 0 && hour < 6){
        return 'uma ótima madrugada'
    } else if( hour > 6 && hour < 12){
        return 'uma ótima manhã'
    } else if( hour > 12 && hour < 18){
        return 'uma ótima tarde'
    } else if( hour > 18){
        return 'uma ótima noite'
    }
    return 'um excelente dia'
}


export const makeLogout = () => {
    
    removeCookie('user_name')
    removeCookie('user_email')
    removeCookie('this_device_has_biometric')
    setBiometricExistence(false)
    const idUserLogged = getIdUser()
    console.log(idUserLogged)
    if(idUserLogged){
        console.log(removeIdUser())
    }
    removeToken()
    
}


export const formatValue = (value: number) =>{
    return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export const formatDateShow = (date: string | undefined) => {
    if(!date){
        return ''
    }

    const [year, month, day] = date.split('-')
    const shortYear = year.slice(-2)
    
    return `${day}/${month}/${shortYear}`
}

export function getFitName(fullName: string): string {

  if (!fullName) return "";


  const nameParts = fullName.trim().split(/\s+/);

  if (nameParts.length === 1) {
    return nameParts[0];
  }

  console.log(`${nameParts[0]} ${nameParts[1]}`)
  return `${nameParts[0]} ${nameParts[1]}`;
}