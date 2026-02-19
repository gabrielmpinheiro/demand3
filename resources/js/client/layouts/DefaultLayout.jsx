import { Navigate, Outlet, Link, useLocation } from "react-router-dom";
import { useStateContext } from "../contexts/ContextProvider";
import { useState, useEffect } from "react";
import axiosClient from "../axios-client";

const sidebarColors = {
    indigo: { bg: 'bg-indigo-900', hover: 'hover:bg-indigo-800', border: 'border-indigo-800', accent: 'text-indigo-400' },
    blue: { bg: 'bg-blue-900', hover: 'hover:bg-blue-800', border: 'border-blue-800', accent: 'text-blue-400' },
    slate: { bg: 'bg-slate-900', hover: 'hover:bg-slate-800', border: 'border-slate-800', accent: 'text-slate-400' },
    emerald: { bg: 'bg-emerald-900', hover: 'hover:bg-emerald-800', border: 'border-emerald-800', accent: 'text-emerald-400' },
    purple: { bg: 'bg-purple-900', hover: 'hover:bg-purple-800', border: 'border-purple-800', accent: 'text-purple-400' },
};

export default function DefaultLayout() {
    const { user, token, setUser, setCliente, setToken, notificationCount, setNotificationCount, theme, setTheme } = useStateContext();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [themeMenuOpen, setThemeMenuOpen] = useState(false);
    const location = useLocation();

    const colors = sidebarColors[theme.sidebarColor] || sidebarColors.indigo;

    const onLogout = (ev) => {
        ev.preventDefault();
        axiosClient.post('/auth/logout')
            .then(() => {
                setUser({});
                setCliente({});
                setToken(null);
            });
    };

    useEffect(() => {
        if (token && !user.name) {
            axiosClient.get('/auth/user')
                .then(({ data }) => {
                    setUser(data.data);
                    if (data.data.cliente) {
                        setCliente(data.data.cliente);
                    }
                    setLoading(false);
                })
                .catch(err => {
                    setLoading(false);
                    if (err.response && err.response.status === 401) {
                        setUser({});
                        setCliente({});
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
                    setNotificationCount(data.total || 0);
                })
                .catch(() => { });
        }
    }, [token]);

    if (!token) {
        return <Navigate to="/login" />;
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <svg className="animate-spin h-10 w-10 text-indigo-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-gray-500">Carregando...</p>
                </div>
            </div>
        );
    }

    const navItems = [
        { to: '/dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
        { to: '/domains', label: 'Domínios', icon: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9' },
        { to: '/subscriptions', label: 'Planos', icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z' },
        { to: '/invoices', label: 'Faturas', icon: 'M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z' },
        { to: '/tickets', label: 'Chamados', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' },
        { to: '/notifications', label: 'Notificações', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
        { to: '/profile', label: 'Meu Perfil', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
        { to: '/users', label: 'Usuários', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <div id="clientLayout" className={`flex min-h-screen ${theme.mode === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} font-sans relative`} style={{ fontFamily: "'Inter', sans-serif" }}>
            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden transition-opacity"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}

            {/* Sidebar */}
            <aside className={`
                fixed md:static inset-y-0 left-0 z-30 w-64 ${colors.bg} text-white min-h-screen transform transition-transform duration-300 ease-in-out flex flex-col
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                <div className={`p-4 font-bold text-xl border-b ${colors.border} flex justify-between items-center`}>
                    <div className="flex items-center gap-3">
                        <img src="/logo.png" alt="Demand3" className="h-10" onError={(e) => { e.target.style.display = 'none'; }} />
                        <span className="text-lg font-semibold">Demand3</span>
                    </div>
                    <button className="md:hidden text-white" onClick={() => setSidebarOpen(false)}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                {/* New Ticket Button */}
                <div className="px-4 pt-4">
                    <Link
                        to="/tickets"
                        className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg text-white font-medium transition-all duration-200 backdrop-blur-sm"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                        Novo Chamado
                    </Link>
                </div>

                <nav className="mt-4 flex-1 overflow-y-auto pb-20">
                    {navItems.map((item) => (
                        <Link
                            key={item.to}
                            to={item.to}
                            onClick={() => setSidebarOpen(false)}
                            className={`flex items-center gap-3 py-2.5 px-4 transition duration-200 ${isActive(item.to)
                                    ? 'bg-white bg-opacity-20 border-r-4 border-white'
                                    : `${colors.hover} opacity-80 hover:opacity-100`
                                }`}
                        >
                            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon}></path>
                            </svg>
                            <span>{item.label}</span>
                            {item.label === 'Notificações' && notificationCount > 0 && (
                                <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{notificationCount}</span>
                            )}
                        </Link>
                    ))}
                </nav>

                {/* Theme Customization */}
                <div className={`border-t ${colors.border} p-4`}>
                    <button
                        onClick={() => setThemeMenuOpen(!themeMenuOpen)}
                        className={`flex items-center gap-2 w-full text-sm opacity-70 hover:opacity-100 transition`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        Personalizar
                    </button>
                    {themeMenuOpen && (
                        <div className="mt-3 space-y-3">
                            <div>
                                <label className="text-xs opacity-60 block mb-1">Cor da sidebar</label>
                                <div className="flex gap-2">
                                    {Object.keys(sidebarColors).map(color => (
                                        <button
                                            key={color}
                                            onClick={() => setTheme({ sidebarColor: color })}
                                            className={`w-6 h-6 rounded-full border-2 transition-transform ${theme.sidebarColor === color ? 'border-white scale-110' : 'border-transparent'
                                                } bg-${color === 'slate' ? 'slate' : color}-600`}
                                            style={{ backgroundColor: { indigo: '#4f46e5', blue: '#2563eb', slate: '#475569', emerald: '#059669', purple: '#9333ea' }[color] }}
                                            title={color}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="text-xs opacity-60 block mb-1">Modo</label>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setTheme({ mode: 'light' })}
                                        className={`px-3 py-1 text-xs rounded ${theme.mode === 'light' ? 'bg-white text-gray-800' : 'bg-white bg-opacity-20'}`}
                                    >☀️ Claro</button>
                                    <button
                                        onClick={() => setTheme({ mode: 'dark' })}
                                        className={`px-3 py-1 text-xs rounded ${theme.mode === 'dark' ? 'bg-white text-gray-800' : 'bg-white bg-opacity-20'}`}
                                    >🌙 Escuro</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </aside>

            <div className="flex-1 flex flex-col min-w-0">
                <header className={`${theme.mode === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'} shadow-sm p-4 flex justify-between items-center z-10 sticky top-0`}>
                    <div className="flex items-center gap-3">
                        <button className="md:hidden text-gray-500" onClick={() => setSidebarOpen(true)}>
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                        </button>
                        <h1 className={`text-lg font-semibold ${theme.mode === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                            Olá, {user.name || 'Cliente'} 👋
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link to="/notifications" className="relative p-2 text-gray-400 hover:text-indigo-600 transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                            </svg>
                            {notificationCount > 0 && (
                                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-500 rounded-full animate-pulse">
                                    {notificationCount}
                                </span>
                            )}
                        </Link>
                        <Link to="/profile" className="hidden sm:flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 transition-colors">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-sm">
                                {(user.name || 'C').charAt(0).toUpperCase()}
                            </div>
                            <span>{user.name}</span>
                        </Link>
                        <a href="#" onClick={onLogout} className="text-sm text-red-500 hover:text-red-700 whitespace-nowrap transition-colors">Sair</a>
                    </div>
                </header>

                <main className={`flex-1 p-4 md:p-6 overflow-y-auto w-full pb-20 md:pb-6`}>
                    <Outlet />
                </main>

                {/* Bottom Navigation for Mobile */}
                <div className={`md:hidden fixed bottom-0 left-0 right-0 ${theme.mode === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-t flex justify-around p-2 z-40 pb-safe`}>
                    <Link to="/dashboard" className={`flex flex-col items-center p-2 text-xs ${isActive('/dashboard') ? 'text-indigo-600' : 'text-gray-500'} transition-colors`}>
                        <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                        <span>Home</span>
                    </Link>
                    <Link to="/tickets" className={`flex flex-col items-center p-2 text-xs ${isActive('/tickets') ? 'text-indigo-600' : 'text-gray-500'} transition-colors`}>
                        <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
                        <span>Chamados</span>
                    </Link>
                    <Link to="/notifications" className={`flex flex-col items-center p-2 text-xs ${isActive('/notifications') ? 'text-indigo-600' : 'text-gray-500'} transition-colors`}>
                        <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                        <span>Avisos {notificationCount > 0 && `(${notificationCount})`}</span>
                    </Link>
                    <button onClick={() => setSidebarOpen(true)} className="flex flex-col items-center p-2 text-xs text-gray-500 transition-colors">
                        <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                        <span>Menu</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
