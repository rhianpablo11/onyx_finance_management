import { Outlet } from "react-router-dom";

function DashboardLayout(){
    return(
        <>
            <div className="w-full h-dvh bg-black">
                {/* O Outlet is the local to show children pages (Dashboard, Extrato, etc) */}
                <Outlet />
            </div>
        </>
    )
}

export {DashboardLayout}