import Cookies from 'js-cookie';


export function getCookie(key:string) {
    const cookieStore = Cookies.get(key)
    return cookieStore
}

export function setCookie(key:string, token: string){
    Cookies.set(key, token, {
        expires: 1, //1 = 1 dia, pode usar o decimal
        secure: true,
        sameSite: 'Strict'
    })
}

export function setLongCookie(key:string, token: string){
    Cookies.set(key, token, {
        secure: true,
        sameSite: 'Strict'
    })
}

export function removeCookie(key:string){
    Cookies.remove(key)
}