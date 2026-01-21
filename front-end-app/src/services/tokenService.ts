import { jwtDecode } from "jwt-decode";
import { getCookie, removeCookie, setCookie } from "./cookiesService";
import type { userTokenPayload } from "../interfaces/interfacesServices";

//pegar do env
const TOKEN_KEY = 'token';

function DecodeToken(){
    const token = getCookie(TOKEN_KEY);
    if(!token){
        return null
    }

    try{
        return jwtDecode<userTokenPayload>(token)
    } catch(error){
        return null
    }
}


function getToken(){
    const token = getCookie(TOKEN_KEY);
    if(!token){
        return null
    }
    return token
}

function removeToken(){
    removeCookie(TOKEN_KEY)
}

function setToken(token:string){
    setCookie(TOKEN_KEY, token)
}

export {DecodeToken,
        getToken,
        removeToken,
        setToken
       }