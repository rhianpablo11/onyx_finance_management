import {Navigate, Outlet} from 'react-router-dom'
import { getToken } from '../services/tokenService'


function PrivateRoute(){
    const isTokenExists = getToken()

    if(!isTokenExists){
        return <Outlet />
    } else{
        return <Navigate to='/login' replace />
    }
}

export {PrivateRoute}