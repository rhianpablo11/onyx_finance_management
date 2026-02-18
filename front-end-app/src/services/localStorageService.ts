


export function getIdUser(){
    const idUser = localStorage.getItem('idUser')
    if(idUser){
        return idUser
    }
    return null
}


export function setIdUser(idUser: string){
    localStorage.setItem('idUser', idUser)
}


export function removeIdUser(idUser: string){
    const idUserFounded = localStorage.getItem(idUser)
    if(idUserFounded){
        localStorage.removeItem(idUserFounded)
        return true
    }
    return false   
}


export function setBiometricExistence(isBiometric: boolean){
    if(isBiometric){
        localStorage.setItem('isBiometric', 'true')
    } else{
        localStorage.setItem('isBiometric', 'false')
    }
    
}


export function getBiometricExistence(){
    const isBiometric = localStorage.getItem('isBiometric')
    if(isBiometric == 'true' && getIdUser() != null){
        return true
    }
    return false
}