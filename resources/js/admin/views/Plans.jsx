import { useEffect, useState } from "react";
import axiosClient, { initCsrf } from "../axios-client";
import Table from "../components/Table";
import PlanModal from "../components/PlanModal";

export default function Plans() {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState(null);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });

    const showNotification = (message, type = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
    };

    const fetchPlans = async () => {
        setLoading(true);
        try {
            const { data } = await axiosClient.get('/planos');
            setPlans(data.data || []);
        } catch (error) {
            console.error('Erro ao carregar planos:', error);
            showNotification('Erro ao carregar planos', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        initCsrf().then(() => fetchPlans());
    }, []);

    const handleAdd = () => {
        setEditingPlan(null);
        setIsModalOpen(true);
    };

    const handleEdit = (plan) => {
        setEditingPlan(plan);
        setIsModalOpen(true);
    };

    const handleDelete = async (plan) => {
        // Verificar se tem assinaturas ativas
        if (plan.assinaturas_count > 0) {
            showNotification(`Não é possível excluir plano com ${plan.assinaturas_count} assinatura(s) ativa(s)`, 'error');
            return;
        }

        if (!window.confirm(`Tem certeza que deseja excluir o plano "${plan.nome}"?`)) {
            return;
        }

        try {
            await axiosClient.delete(`/planos/${plan.id}`);
            setPlans(prev => prev.filter(p => p.id !== plan.id));
            showNotification('Plano excluído com sucesso');
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Erro ao excluir plano';
            showNotification(errorMsg, 'error');
        }
    };

    const handleSave = async (formData) => {
        try {
            if (editingPlan) {
                await axiosClient.put(`/planos/${editingPlan.id}`, formData);
                showNotification('Plano atualizado com sucesso');
            } else {
                await axiosClient.post('/planos', formData);
                showNotification('Plano criado com sucesso');
            }

            setIsModalOpen(false);
            await fetchPlans();
        } catch (error) {
            const errorMsg = error.response?.data?.errors
                ? Object.values(error.response.data.errors).flat().join(', ')
                : error.response?.data?.message || 'Erro ao salvar plano';
            showNotification(errorMsg, 'error');
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value || 0);
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
        { key: 'nome', label: 'Nome' },
        {
            key: 'preco',
            label: 'Preço',
            render: (val) => formatCurrency(val)
        },
        {
            key: 'limite_horas_tecnicas',
            label: 'Horas Técnicas',
            render: (val) => `${val}h`
        },
        {
            key: 'valor_hora',
            label: 'Valor Hora',
            render: (val) => formatCurrency(val)
        },
        {
            key: 'assinaturas_count',
            label: 'Assinaturas',
            render: (val) => (
                <span className={`px-2 py-1 rounded text-xs font-semibold ${val > 0 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                    {val || 0} ativas
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
                <h1 className="text-2xl font-bold text-gray-800">Planos</h1>
                <button
                    onClick={handleAdd}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Novo Plano
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
                ) : plans.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                        <p className="text-lg font-medium">Nenhum plano cadastrado</p>
                        <p className="text-sm">Clique em "Novo Plano" para adicionar.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <Table
                            columns={columns}
                            data={plans}
                            onDelete={handleDelete}
                            onEdit={handleEdit}
                        />
                    </div>
                )}
            </div>

            {/* Plan Modal */}
            <PlanModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                plan={editingPlan}
            />
        </div>
    );
}
