import { useEffect, useState } from "react";
import axiosClient, { initCsrf } from "../axios-client";
import Table from "../components/Table";
import SubscriptionModal from "../components/SubscriptionModal";

export default function Subscriptions() {
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSubscription, setEditingSubscription] = useState(null);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });

    const showNotification = (message, type = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
    };

    const fetchSubscriptions = async () => {
        setLoading(true);
        try {
            const { data } = await axiosClient.get('/assinaturas');
            setSubscriptions(data.data || []);
        } catch (error) {
            console.error('Erro ao carregar assinaturas:', error);
            showNotification('Erro ao carregar assinaturas', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        initCsrf().then(() => fetchSubscriptions());
    }, []);

    const handleAdd = () => {
        setEditingSubscription(null);
        setIsModalOpen(true);
    };

    const handleEdit = (subscription) => {
        setEditingSubscription(subscription);
        setIsModalOpen(true);
    };

    const handleDelete = async (subscription) => {
        // Verificar se tem pagamentos em atraso
        if (subscription.pagamentos_em_atraso_count > 0) {
            showNotification(`Não é possível excluir assinatura com ${subscription.pagamentos_em_atraso_count} pagamento(s) em atraso`, 'error');
            return;
        }

        if (!window.confirm(`Tem certeza que deseja excluir esta assinatura?`)) {
            return;
        }

        try {
            await axiosClient.delete(`/assinaturas/${subscription.id}`);
            setSubscriptions(prev => prev.filter(s => s.id !== subscription.id));
            showNotification('Assinatura excluída com sucesso');
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Erro ao excluir assinatura';
            showNotification(errorMsg, 'error');
        }
    };

    const handleSave = async (formData) => {
        try {
            if (editingSubscription) {
                await axiosClient.put(`/assinaturas/${editingSubscription.id}`, formData);
                showNotification('Assinatura atualizada com sucesso');
            } else {
                await axiosClient.post('/assinaturas', formData);
                showNotification('Assinatura criada com sucesso');
            }

            setIsModalOpen(false);
            await fetchSubscriptions();
        } catch (error) {
            const errorMsg = error.response?.data?.errors
                ? Object.values(error.response.data.errors).flat().join(', ')
                : error.response?.data?.message || 'Erro ao salvar assinatura';
            showNotification(errorMsg, 'error');
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value || 0);
    };

    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('pt-BR');
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            ativo: 'bg-green-100 text-green-800',
            inativo: 'bg-yellow-100 text-yellow-800',
            cancelado: 'bg-red-100 text-red-800',
        };
        return statusConfig[status] || 'bg-gray-100 text-gray-800';
    };

    const columns = [
        { key: 'id', label: 'ID' },
        {
            key: 'cliente',
            label: 'Cliente',
            render: (_, sub) => sub.cliente?.nome || '-'
        },
        {
            key: 'dominio',
            label: 'Domínio',
            render: (_, sub) => sub.dominio?.nome || '-'
        },
        {
            key: 'plano',
            label: 'Plano',
            render: (_, sub) => (
                <div>
                    <span className="font-medium">{sub.plano?.nome || '-'}</span>
                    <span className="text-gray-500 text-sm ml-1">
                        ({formatCurrency(sub.plano?.preco)})
                    </span>
                </div>
            )
        },
        {
            key: 'horas_disponiveis',
            label: 'Horas',
            render: (val, sub) => (
                <span className={`font-medium ${parseFloat(val) === 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {parseFloat(val).toFixed(1)}h / {sub.plano?.limite_horas_tecnicas || 0}h
                </span>
            )
        },
        {
            key: 'data_inicio',
            label: 'Início',
            render: (val) => formatDate(val)
        },
        {
            key: 'pagamentos_em_atraso_count',
            label: 'Atrasos',
            render: (val) => (
                <span className={`px-2 py-1 rounded text-xs font-semibold ${val > 0 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                    {val || 0}
                </span>
            )
        },
        {
            key: 'status',
            label: 'Status',
            render: (val) => (
                <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusBadge(val)}`}>
                    {val || 'ativo'}
                </span>
            )
        },
    ];

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <h1 className="text-2xl font-bold text-gray-800">Assinaturas</h1>
                <button
                    onClick={handleAdd}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Nova Assinatura
                </button>
            </div>

            {/* Notification */}
            {notification.show && (
                <div className={`mb-4 p-3 rounded-md ${notification.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {notification.message}
                </div>
            )}

            {/* Table */}
            <div className="bg-white p-4 rounded-lg shadow">
                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <svg className="animate-spin h-8 w-8 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                ) : subscriptions.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-lg font-medium">Nenhuma assinatura cadastrada</p>
                        <p className="text-sm">Clique em "Nova Assinatura" para adicionar.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <Table
                            columns={columns}
                            data={subscriptions}
                            onDelete={handleDelete}
                            onEdit={handleEdit}
                        />
                    </div>
                )}
            </div>

            {/* Subscription Modal */}
            <SubscriptionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                subscription={editingSubscription}
            />
        </div>
    );
}
