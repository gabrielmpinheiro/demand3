import { Navigate, Outlet } from "react-router-dom";
import { useStateContext } from "../contexts/ContextProvider";

export default function GuestLayout() {
    const { token } = useStateContext();

    if (token) {
        return <Navigate to="/admpanel" />;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="w-full max-w-md">
                <Outlet />
            </div>
        </div>
    );
}
