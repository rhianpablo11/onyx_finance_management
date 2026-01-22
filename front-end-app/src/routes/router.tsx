import { createBrowserRouter } from "react-router-dom";
import InitialPage from "../pages/initialPage";
import { PrivateRoute } from "./privateRoute";
import { DashboardLayout } from "../layouts/dashboardLayout";
import TestingPage from "../pages/testingPage";
import LoginPage from "../pages/loginPage";


export const router = createBrowserRouter([
    //public routes
    {
        path: '/',
        element: <InitialPage />
    },
    {
        path:'/login',
        element: <LoginPage />
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
                        element: <TestingPage />
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