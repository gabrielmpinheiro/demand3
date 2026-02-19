import { createBrowserRouter, Navigate } from "react-router-dom";
import DefaultLayout from "./layouts/DefaultLayout";
import GuestLayout from "./layouts/GuestLayout";
import Login from "./views/Login";
import Register from "./views/Register";
import Dashboard from "./views/Dashboard";
import Domains from "./views/Domains";
import Subscriptions from "./views/Subscriptions";
import Invoices from "./views/Invoices";
import Tickets from "./views/Tickets";
import Notifications from "./views/Notifications";
import Profile from "./views/Profile";
import SubUsers from "./views/SubUsers";
import Vault from "./views/Vault";

const router = createBrowserRouter([
    {
        path: "/",
        element: <DefaultLayout />,
        children: [
            {
                path: '/',
                element: <Navigate to="/dashboard" />
            },
            {
                path: '/dashboard',
                element: <Dashboard />
            },
            {
                path: '/domains',
                element: <Domains />
            },
            {
                path: '/subscriptions',
                element: <Subscriptions />
            },
            {
                path: '/invoices',
                element: <Invoices />
            },
            {
                path: '/tickets',
                element: <Tickets />
            },
            {
                path: '/notifications',
                element: <Notifications />
            },
            {
                path: '/profile',
                element: <Profile />
            },
            {
                path: '/users',
                element: <SubUsers />
            },
            {
                path: '/vault',
                element: <Vault />
            }
        ]
    },
    {
        path: "/",
        element: <GuestLayout />,
        children: [
            {
                path: '/login',
                element: <Login />
            },
            {
                path: '/register',
                element: <Register />
            }
        ]
    },
]);

export default router;
