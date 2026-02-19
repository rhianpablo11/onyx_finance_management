import { Navigate, Outlet } from "react-router-dom";
import { getToken } from "../services/tokenService";



export function PublicRoute(){
    const token = getToken()
    if(token){
        return <Navigate to={'/dashboard'} replace />
    } else{
        return <Outlet />
    }
}