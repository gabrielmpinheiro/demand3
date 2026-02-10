import { useEffect, useState } from "react";
import Table from "../components/Table";
import axiosClient from "../axios-client";
import { toast } from "react-toastify";
import { useStateContext } from "../contexts/ContextProvider";

export default function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [meta, setMeta] = useState({}); // For pagination
    const [filter, setFilter] = useState('all'); // all, unread, read
    const { setNotificationCount, user } = useStateContext();

    const fetchNotifications = async (page = 1) => {
        try {
            setLoading(true);

            let queryParams = `?page=${page}`;
            if (filter === 'unread') queryParams += '&lida=0';
            if (filter === 'read') queryParams += '&lida=1';

            const response = await axiosClient.get(`/notificacoes${queryParams}`);
            setNotifications(response.data.data);
            setMeta(response.data.meta || {}); // Handle Laravel pagination meta

            // Also update global count
            fetchUnreadCount();
        } catch (error) {
            console.error("Erro ao carregar notificações", error);
            toast.error("Erro ao carregar notificações");
        } finally {
            setLoading(false);
        }
    };

    const fetchUnreadCount = async () => {
        try {
            const response = await axiosClient.get('/notificacoes?lida=0&per_page=1');
            setNotificationCount(response.data.total);
        } catch (e) {
            console.error("Failed to update unread count", e);
        }
    }

    useEffect(() => {
        fetchNotifications(1);
    }, [filter]); // Reload when filter changes

    const handleMarkAsRead = async (id) => {
        try {
            await axiosClient.put(`/notificacoes/${id}/lida`);
            toast.success("Notificação marcada como lida");
            fetchNotifications(meta.current_page || 1);
        } catch (error) {
            console.error("Erro ao marcar como lida", error);
            toast.error("Erro ao marcar notificação como lida");
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            if (!user || !user.id) {
                toast.error("Usuário não identificado");
                return;
            }

            await axiosClient.post(`/notificacoes/marcar-todas-lidas`, { user_id: user.id });
            toast.success("Todas as notificações foram marcadas como lidas");
            fetchNotifications(1);
        } catch (error) {
            console.error("Erro ao marcar todas como lidas", error);
            toast.error("Erro ao marcar todas como lidas");
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Tem certeza que deseja excluir esta notificação?")) return;

        try {
            await axiosClient.delete(`/notificacoes/${id}`);
            toast.success("Notificação excluída com sucesso");
            fetchNotifications(meta.current_page || 1);
        } catch (error) {
            console.error("Erro ao excluir notificação", error);
            toast.error("Erro ao excluir notificação");
        }
    };

    const onPageChange = (link) => {
        if (link.url) {
            const url = new URL(link.url);
            const page = url.searchParams.get('page');
            fetchNotifications(page);
        }
    }

    const columns = [
        { key: 'tipo', label: 'Tipo', render: (value, row) => <span className="capitalize">{row.tipo}</span> },
        {
            key: 'titulo',
            label: 'Título',
            render: (value, row) => (
                <span className={!row.lida ? "font-bold text-gray-900" : "text-gray-700"}>
                    {row.titulo}
                </span>
            )
        },
        { key: 'mensagem', label: 'Mensagem' },
        {
            key: 'lida',
            label: 'Status',
            render: (value, row) => (
                <span className={`px-2 py-1 rounded text-xs ${row.lida ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-700 font-bold'}`}>
                    {row.lida ? 'Lida' : 'Nova'}
                </span>
            )
        },
        { key: 'created_at', label: 'Data', render: (value, row) => new Date(row.created_at).toLocaleString() },
        {
            key: 'actions',
            label: 'Ações',
            render: (value, row) => (
                <div className="flex gap-2">
                    {!row.lida && (
                        <button
                            onClick={() => handleMarkAsRead(row.id)}
                            className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                            title="Marcar como lida"
                        >
                            Ler
                        </button>
                    )}
                    <button
                        onClick={() => handleDelete(row.id)}
                        className="text-red-600 hover:text-red-900 text-sm font-medium"
                        title="Excluir"
                    >
                        Excluir
                    </button>
                </div>
            )
        }
    ];

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h1 className="text-2xl font-bold text-gray-800">Notificações</h1>
                <div className="flex gap-2">
                    <button
                        onClick={handleMarkAllAsRead}
                        className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded shadow transition text-sm"
                    >
                        Marcar todas como lidas
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Tabs */}
                <div className="flex border-b">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-6 py-3 text-sm font-medium transition-colors ${filter === 'all' ? 'border-b-2 border-green-500 text-green-600 bg-green-50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                    >
                        Todas
                    </button>
                    <button
                        onClick={() => setFilter('unread')}
                        className={`px-6 py-3 text-sm font-medium transition-colors ${filter === 'unread' ? 'border-b-2 border-green-500 text-green-600 bg-green-50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                    >
                        Não Lidas
                    </button>
                    <button
                        onClick={() => setFilter('read')}
                        className={`px-6 py-3 text-sm font-medium transition-colors ${filter === 'read' ? 'border-b-2 border-green-500 text-green-600 bg-green-50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                    >
                        Lidas
                    </button>
                </div>

                <div className="p-6">
                    {loading ? (
                        <div className="text-center py-10 text-gray-500">
                            <svg className="animate-spin h-8 w-8 text-green-500 mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Carregando...
                        </div>
                    ) : (
                        <>
                            <Table
                                columns={columns}
                                data={notifications}
                            />

                            {/* Pagination */}
                            {meta.links && meta.links.length > 3 && (
                                <div className="mt-4 flex justify-center">
                                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                        {meta.links.map((link, index) => (
                                            <button
                                                key={index}
                                                onClick={() => onPageChange(link)}
                                                disabled={!link.url || link.active}
                                                className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${link.active
                                                    ? 'z-10 bg-green-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600'
                                                    : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 bg-white'
                                                    } ${index === 0 ? 'rounded-l-md' : ''} ${index === meta.links.length - 1 ? 'rounded-r-md' : ''} ${!link.url ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
                                    </nav>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
