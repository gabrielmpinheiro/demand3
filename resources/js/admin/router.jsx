import { createBrowserRouter, Navigate } from "react-router-dom";
import DefaultLayout from "./layouts/DefaultLayout";
import GuestLayout from "./layouts/GuestLayout";
import Login from "./views/Login";
import Dashboard from "./views/Dashboard";
import Users from "./views/Users";
import Clients from "./views/Clients";
import Demands from "./views/Demands";
import Plans from "./views/Plans";
import Subscriptions from "./views/Subscriptions";
import Payments from "./views/Payments";
import Support from "./views/Support";
import Notifications from "./views/Notifications";
import Vault from "./views/Vault";

const router = createBrowserRouter([
    {
        path: "/admpanel",
        element: <DefaultLayout />,
        children: [
            {
                path: '/admpanel',
                element: <Navigate to="/admpanel/dashboard" />
            },
            {
                path: '/admpanel/dashboard',
                element: <Dashboard />
            },
            {
                path: '/admpanel/users',
                element: <Users />
            },
            {
                path: '/admpanel/clients',
                element: <Clients />
            },
            {
                path: '/admpanel/demands',
                element: <Demands />
            },
            {
                path: '/admpanel/plans',
                element: <Plans />
            },
            {
                path: '/admpanel/subscriptions',
                element: <Subscriptions />
            },
            {
                path: '/admpanel/payments',
                element: <Payments />
            },
            {
                path: '/admpanel/support',
                element: <Support />
            },
            {
                path: '/admpanel/notifications',
                element: <Notifications />
            },
            {
                path: '/admpanel/vault',
                element: <Vault />
            }
        ]
    },
    {
        path: "/admpanel",
        element: <GuestLayout />,
        children: [
            {
                path: '/admpanel/login',
                element: <Login />
            }
        ]
    },
]);

export default router;
