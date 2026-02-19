import { createBrowserRouter } from "react-router-dom";
import InitialPage from "../pages/initialPage";
import { PrivateRoute } from "./privateRoute";
import { DashboardLayout } from "../layouts/dashboardLayout";
import LoginPage from "../pages/loginPage";
import InternalPage from "../pages/internalPage";
import CreateAccountPage from "../pages/createAccountPage";
import { PublicRoute } from "./publicRoute";


export const router = createBrowserRouter([
    //public routes
    {
        element: <PublicRoute />,
        children: [
            {
                path: '/',
                element: <InitialPage />
            },
            {
                path:'/login',
                element: <LoginPage />
            },{
                path:'/sign-up',
                element: <CreateAccountPage />
            }
        ]
    },

    // private routes
    {
        path: '/',
        element: <PrivateRoute />,
        children: [
            {
                element: <DashboardLayout />,
                children: [
                    {
                        path: '/dashboard',
                        element: <InternalPage />
                    }
                ]
            }
        ]
    },

    //not found route
    {
        path: "*",
        element: <div className="text-white text-center mt-10">Página não encontrada</div>
    }
])