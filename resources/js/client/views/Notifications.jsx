import { useState, useEffect } from "react";
import { useStateContext } from "../contexts/ContextProvider";
import axiosClient from "../axios-client";

export default function Notifications() {
    const { theme, setNotificationCount } = useStateContext();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const isDark = theme.mode === 'dark';
    const card = `${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-sm border`;

    const fetch = () => {
        axiosClient.get('/notificacoes').then(({ data }) => {
            setNotifications(data.data || []);
            setLoading(false);
        }).catch(() => setLoading(false));
    };

    useEffect(() => { fetch(); }, []);

    const markRead = (id) => {
        axiosClient.post(`/notificacoes/${id}/marcar-lida`).then(() => {
            fetch();
            axiosClient.get('/notificacoes?lida=0&per_page=1').then(({ data }) => setNotificationCount(data.total || 0));
        });
    };

    const markAllRead = () => {
        axiosClient.post('/notificacoes/marcar-todas-lidas').then(() => {
            fetch();
            setNotificationCount(0);
        });
    };

    if (loading) return <div className="flex justify-center py-12"><svg className="animate-spin h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg></div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Notificações</h2>
                {notifications.some(n => !n.lida) && (
                    <button onClick={markAllRead} className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">Marcar todas como lidas</button>
                )}
            </div>

            {notifications.length === 0 ? (
                <div className={`${card} p-12 text-center`}>
                    <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                    <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>Nenhuma notificação.</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {notifications.map(n => (
                        <div key={n.id} className={`${card} p-4 flex items-start gap-3 ${!n.lida ? (isDark ? 'border-l-4 border-l-indigo-500' : 'border-l-4 border-l-indigo-500 bg-indigo-50') : ''} hover:shadow-md transition-all`}>
                            <div className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${!n.lida ? 'bg-indigo-600' : 'bg-transparent'}`} />
                            <div className="flex-1 min-w-0">
                                <p className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-800'}`}>{n.titulo}</p>
                                <p className={`text-sm mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{n.mensagem}</p>
                                <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{new Date(n.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                            {!n.lida && (
                                <button onClick={() => markRead(n.id)} className="text-xs text-indigo-600 hover:text-indigo-700 font-medium whitespace-nowrap flex-shrink-0">Marcar como lida</button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
