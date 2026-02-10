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

    const [selectedIds, setSelectedIds] = useState([]);

    const fetchNotifications = async (page = 1) => {
        try {
            setLoading(true);

            let queryParams = `?page=${page}`;
            if (filter === 'unread') queryParams += '&lida=0';
            if (filter === 'read') queryParams += '&lida=1';

            const response = await axiosClient.get(`/notificacoes${queryParams}`);
            setNotifications(response.data.data);
            setMeta(response.data.meta || {}); 
            setSelectedIds([]); // Clear selection on fetch

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
    }, [filter]);

    const handleMarkAsRead = async (id) => {
        try {
            await axiosClient.post(`/notificacoes/${id}/marcar-lida`);
            toast.success("Notificação marcada como lida");
            fetchNotifications(meta.current_page || 1);
        } catch (error) {
            console.error("Erro ao marcar como lida", error);
            toast.error("Erro ao marcar notificação como lida");
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await axiosClient.post(`/notificacoes/marcar-todas-lidas`);
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

    const handleDeleteMultiple = async () => {
        if (selectedIds.length === 0) return;
        if (!confirm(`Tem certeza que deseja excluir ${selectedIds.length} notificações?`)) return;

        try {
            await axiosClient.post('/notificacoes/excluir-multiplas', { ids: selectedIds });
            toast.success("Notificações excluídas com sucesso");
            fetchNotifications(meta.current_page || 1);
        } catch (error) {
            console.error("Erro ao excluir notificações", error);
            toast.error("Erro ao excluir notificações");
        }
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(notifications.map(n => n.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(i => i !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const onPageChange = (link) => {
        if (link.url) {
            const url = new URL(link.url);
            const page = url.searchParams.get('page');
            fetchNotifications(page);
        }
    }

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h1 className="text-2xl font-bold text-gray-800">Notificações</h1>
                <div className="flex gap-2">
                    {selectedIds.length > 0 && (
                        <button
                            onClick={handleDeleteMultiple}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded shadow transition text-sm flex items-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                            </svg>
                            Excluir ({selectedIds.length})
                        </button>
                    )}
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

                <div className="p-0">
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
                            <div className="overflow-x-auto relative">
                                <table className="w-full text-sm text-left text-gray-500">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                        <tr>
                                            <th scope="col" className="p-4">
                                                <div className="flex items-center">
                                                    <input
                                                        id="checkbox-all"
                                                        type="checkbox"
                                                        className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
                                                        onChange={handleSelectAll}
                                                        checked={notifications.length > 0 && selectedIds.length === notifications.length}
                                                    />
                                                    <label htmlFor="checkbox-all" className="sr-only">checkbox</label>
                                                </div>
                                            </th>
                                            <th scope="col" className="py-3 px-6">Tipo</th>
                                            <th scope="col" className="py-3 px-6">Título</th>
                                            <th scope="col" className="py-3 px-6">Mensagem</th>
                                            <th scope="col" className="py-3 px-6">Status</th>
                                            <th scope="col" className="py-3 px-6">Data</th>
                                            <th scope="col" className="py-3 px-6">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {notifications.length > 0 ? (
                                            notifications.map((notification) => (
                                                <tr key={notification.id} className="bg-white border-b hover:bg-gray-50">
                                                    <td className="p-4 w-4">
                                                        <div className="flex items-center">
                                                            <input
                                                                id={`checkbox-table-${notification.id}`}
                                                                type="checkbox"
                                                                className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
                                                                onChange={() => handleSelectOne(notification.id)}
                                                                checked={selectedIds.includes(notification.id)}
                                                            />
                                                            <label htmlFor={`checkbox-table-${notification.id}`} className="sr-only">checkbox</label>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6 capitalize">{notification.tipo}</td>
                                                    <td className="py-4 px-6">
                                                        <span className={!notification.lida ? "font-bold text-gray-900" : "text-gray-700"}>
                                                            {notification.titulo}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-6">{notification.mensagem}</td>
                                                    <td className="py-4 px-6">
                                                        <span className={`px-2 py-1 rounded text-xs ${notification.lida ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-700 font-bold'}`}>
                                                            {notification.lida ? 'Lida' : 'Nova'}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-6">{new Date(notification.created_at).toLocaleString()}</td>
                                                    <td className="py-4 px-6">
                                                        <div className="flex gap-2">
                                                            {!notification.lida && (
                                                                <button
                                                                    onClick={() => handleMarkAsRead(notification.id)}
                                                                    className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                                                                    title="Marcar como lida"
                                                                >
                                                                    Ler
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => handleDelete(notification.id)}
                                                                className="text-red-600 hover:text-red-900 text-sm font-medium"
                                                                title="Excluir"
                                                            >
                                                                Excluir
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="7" className="py-4 px-6 text-center">
                                                    Nenhuma notificação encontrada.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {meta.links && meta.links.length > 3 && (
                                <div className="p-4 flex justify-center border-t">
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
