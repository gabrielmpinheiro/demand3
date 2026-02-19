import { Navigate, Outlet } from "react-router-dom";
import { useStateContext } from "../contexts/ContextProvider";

export default function GuestLayout() {
    const { token } = useStateContext();

    if (token) {
        return <Navigate to="/dashboard" />;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-blue-50">
            <div className="w-full max-w-2xl px-4">
                <Outlet />
            </div>
        </div>
    );
}
