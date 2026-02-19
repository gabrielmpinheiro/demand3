import { Navigate, Outlet, Link } from "react-router-dom";
import { useStateContext } from "../contexts/ContextProvider";
import { useState, useEffect } from "react";
import axiosClient from "../axios-client";

export default function DefaultLayout() {
    const { user, token, setUser, setToken, notificationCount, setNotificationCount } = useStateContext();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    const onLogout = (ev) => {
        ev.preventDefault();
        axiosClient.post('/auth/logout')
            .then(() => {
                setUser({});
                setToken(null);
            })
    }

    useEffect(() => {
        if (token && !user.name) {
            axiosClient.get('/auth/user')
                .then(({ data }) => {
                    setUser(data);
                    setLoading(false);
                })
                .catch(err => {
                    setLoading(false);
                    if (err.response && err.response.status === 401) {
                        setUser({});
                        setToken(null);
                    }
                });
        } else {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (token) {
            axiosClient.get('/notificacoes?lida=0&per_page=1')
                .then(({ data }) => {
                    // Laravel pagination returns 'total' in the response
                    setNotificationCount(data.total);
                })
                .catch(err => {
                    console.error("Error fetching notifications count", err);
                    if (err.response && err.response.status === 401) {
                        setUser({});
                        setToken(null);
                    }
                });
        }
    }, [token])


    if (!token) {
        return <Navigate to="/admpanel/login" />;
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <svg className="animate-spin h-10 w-10 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            </div>
        );
    }

    return (
        <div id="defaultLayout" className="flex min-h-screen bg-gray-100 font-sans relative">
            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}

            {/* Sidebar */}
            <aside className={`
                fixed md:static inset-y-0 left-0 z-30 w-64 bg-green-900 text-white min-h-screen transform transition-transform duration-300 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                <div className="p-4 font-bold text-xl border-b border-green-800 flex justify-between items-center">
                    <img src="/logo-b.png" alt="SiteCare Admin" className="h-12" />
                    <button className="md:hidden text-white" onClick={() => setSidebarOpen(false)}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                <nav className="mt-4 flex-1 overflow-y-auto pb-20">
                    <Link to="/admpanel" className="block py-2.5 px-4 hover:bg-green-800 transition duration-200">Dashboard</Link>
                    <Link to="/admpanel/users" className="block py-2.5 px-4 hover:bg-green-800 transition duration-200">Usuários</Link>
                    <Link to="/admpanel/clients" className="block py-2.5 px-4 hover:bg-green-800 transition duration-200">Clientes</Link>
                    <Link to="/admpanel/demands" className="block py-2.5 px-4 hover:bg-green-800 transition duration-200">Demandas</Link>
                    <Link to="/admpanel/plans" className="block py-2.5 px-4 hover:bg-green-800 transition duration-200">Planos</Link>
                    <Link to="/admpanel/subscriptions" className="block py-2.5 px-4 hover:bg-green-800 transition duration-200">Assinaturas</Link>
                    <Link to="/admpanel/payments" className="block py-2.5 px-4 hover:bg-green-800 transition duration-200">Pagamentos</Link>
                    <Link to="/admpanel/support" className="block py-2.5 px-4 hover:bg-green-800 transition duration-200">Suporte</Link>
                    <Link to="/admpanel/notifications" className="block py-2.5 px-4 hover:bg-green-800 transition duration-200">Notificações</Link>
                    <Link to="/admpanel/vault" className="block py-2.5 px-4 hover:bg-green-800 transition duration-200">Vault</Link>
                </nav>
            </aside>

            <div className="flex-1 flex flex-col min-w-0">
                <header className="bg-white shadow p-4 flex justify-between items-center z-10 sticky top-0">
                    <div className="flex items-center gap-3">
                        <button className="md:hidden text-gray-600" onClick={() => setSidebarOpen(true)}>
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                        </button>
                        <h1 className="text-xl font-semibold text-gray-800 truncate">Painel</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link to="/admpanel/notifications" className="relative p-2 text-gray-600 hover:text-green-600 transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                            </svg>
                            {notificationCount > 0 && (
                                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
                                    {notificationCount}
                                </span>
                            )}
                        </Link>
                        <span className="hidden sm:inline">{user.name}</span>
                        <a href="#" onClick={onLogout} className="text-sm text-red-600 hover:text-red-800 whitespace-nowrap">Sair</a>
                    </div>
                </header>

                <main className="flex-1 p-4 md:p-6 overflow-y-auto w-full pb-20 md:pb-6">
                    <Outlet />
                </main>

                {/* Bottom Navigation for Mobile */}
                <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around p-2 z-40 pb-safe">
                    <Link to="/admpanel" className="flex flex-col items-center p-2 text-xs text-gray-600 hover:text-green-600 focus:text-green-600">
                        <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                        <span>Home</span>
                    </Link>
                    <Link to="/admpanel/demands" className="flex flex-col items-center p-2 text-xs text-gray-600 hover:text-green-600 focus:text-green-600">
                        <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                        <span>Demandas</span>
                    </Link>
                    <Link to="/admpanel/notifications" className="flex flex-col items-center p-2 text-xs text-gray-600 hover:text-green-600 focus:text-green-600">
                        <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                        <span>Avisos {notificationCount > 0 && `(${notificationCount})`}</span>
                    </Link>
                    <button onClick={() => setSidebarOpen(true)} className="flex flex-col items-center p-2 text-xs text-gray-600 hover:text-green-600 focus:text-green-600">
                        <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                        <span>Menu</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
