import { useEffect, useState } from "react";
import axiosClient, { initCsrf } from "../axios-client";
import Table from "../components/Table";
import PaymentModal from "../components/PaymentModal";

export default function Payments() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPayment, setEditingPayment] = useState(null);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    const [filterStatus, setFilterStatus] = useState('');

    const showNotification = (message, type = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
    };

    const fetchPayments = async () => {
        setLoading(true);
        try {
            let url = '/pagamentos?per_page=50';
            if (filterStatus) {
                url += `&status=${filterStatus}`;
            }
            const { data } = await axiosClient.get(url);
            setPayments(data.data || []);
        } catch (error) {
            console.error('Erro ao carregar pagamentos:', error);
            showNotification('Erro ao carregar pagamentos', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        initCsrf().then(() => fetchPayments());
    }, [filterStatus]);

    const handleAdd = () => {
        setEditingPayment(null);
        setIsModalOpen(true);
    };

    const handleEdit = (payment) => {
        setEditingPayment(payment);
        setIsModalOpen(true);
    };

    const handleCancel = async (payment) => {
        if (payment.status !== 'aberto') {
            showNotification('Apenas pagamentos em aberto podem ser cancelados', 'error');
            return;
        }

        if (!window.confirm(`Tem certeza que deseja cancelar este pagamento?`)) {
            return;
        }

        try {
            await axiosClient.post(`/pagamentos/${payment.id}/cancelar`);
            showNotification('Pagamento cancelado com sucesso');
            await fetchPayments();
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Erro ao cancelar pagamento';
            showNotification(errorMsg, 'error');
        }
    };

    const handleMarkPaid = async (payment) => {
        if (payment.status !== 'aberto') {
            showNotification('Apenas pagamentos em aberto podem ser marcados como pago', 'error');
            return;
        }

        if (!window.confirm(`Confirma marcar este pagamento como pago?`)) {
            return;
        }

        try {
            await axiosClient.post(`/pagamentos/${payment.id}/marcar-pago`);
            showNotification('Pagamento marcado como pago');
            await fetchPayments();
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Erro ao marcar pagamento como pago';
            showNotification(errorMsg, 'error');
        }
    };

    const handleSave = async (formData) => {
        try {
            if (editingPayment) {
                await axiosClient.put(`/pagamentos/${editingPayment.id}`, formData);
                showNotification('Pagamento atualizado com sucesso');
            } else {
                await axiosClient.post('/pagamentos', formData);
                showNotification('Pagamento criado com sucesso');
            }

            setIsModalOpen(false);
            await fetchPayments();
        } catch (error) {
            const errorMsg = error.response?.data?.errors
                ? Object.values(error.response.data.errors).flat().join(', ')
                : error.response?.data?.message || 'Erro ao salvar pagamento';
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

    const isOverdue = (payment) => {
        if (payment.status !== 'aberto') return false;
        const vencimento = new Date(payment.data_vencimento);
        return vencimento < new Date();
    };

    const getStatusBadge = (status, payment) => {
        if (status === 'aberto' && isOverdue(payment)) {
            return 'bg-red-100 text-red-800';
        }
        const statusConfig = {
            aberto: 'bg-yellow-100 text-yellow-800',
            pago: 'bg-green-100 text-green-800',
            cancelado: 'bg-gray-100 text-gray-800',
        };
        return statusConfig[status] || 'bg-gray-100 text-gray-800';
    };

    const getStatusLabel = (status, payment) => {
        if (status === 'aberto' && isOverdue(payment)) {
            return 'Em Atraso';
        }
        const labels = {
            aberto: 'Aberto',
            pago: 'Pago',
            cancelado: 'Cancelado',
        };
        return labels[status] || status;
    };

    const columns = [
        { key: 'id', label: 'ID' },
        {
            key: 'cliente',
            label: 'Cliente',
            render: (_, payment) => payment.cliente?.nome || '-'
        },
        {
            key: 'assinatura',
            label: 'Assinatura',
            render: (_, payment) => payment.assinatura?.dominio?.nome || 'Avulso'
        },
        {
            key: 'valor',
            label: 'Valor',
            render: (val) => formatCurrency(val)
        },
        {
            key: 'referencia_mes',
            label: 'Período',
            render: (val) => val || '-'
        },
        {
            key: 'data_vencimento',
            label: 'Vencimento',
            render: (val, payment) => (
                <span className={isOverdue(payment) ? 'text-red-600 font-medium' : ''}>
                    {formatDate(val)}
                </span>
            )
        },
        {
            key: 'status',
            label: 'Status',
            render: (val, payment) => (
                <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusBadge(val, payment)}`}>
                    {getStatusLabel(val, payment)}
                </span>
            )
        },
        {
            key: 'actions',
            label: 'Ações',
            render: (_, payment) => (
                <div className="flex gap-1">
                    {payment.status === 'aberto' && (
                        <>
                            <button
                                onClick={(e) => { e.stopPropagation(); handleMarkPaid(payment); }}
                                className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded"
                                title="Marcar como Pago"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); handleCancel(payment); }}
                                className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                                title="Cancelar Pagamento"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </>
                    )}
                </div>
            )
        },
    ];

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <h1 className="text-2xl font-bold text-gray-800">Pagamentos</h1>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                        <option value="">Todos os Status</option>
                        <option value="aberto">Abertos</option>
                        <option value="pago">Pagos</option>
                        <option value="cancelado">Cancelados</option>
                    </select>
                    <button
                        onClick={handleAdd}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition flex items-center justify-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Novo Pagamento
                    </button>
                </div>
            </div>

            {/* Notification */}
            {notification.show && (
                <div className={`mb-4 p-3 rounded-md ${notification.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {notification.message}
                </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div className="bg-white p-4 rounded-lg shadow">
                    <p className="text-sm text-gray-500">Em Aberto</p>
                    <p className="text-2xl font-bold text-yellow-600">
                        {formatCurrency(payments.filter(p => p.status === 'aberto').reduce((sum, p) => sum + parseFloat(p.valor), 0))}
                    </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <p className="text-sm text-gray-500">Em Atraso</p>
                    <p className="text-2xl font-bold text-red-600">
                        {formatCurrency(payments.filter(p => isOverdue(p)).reduce((sum, p) => sum + parseFloat(p.valor), 0))}
                    </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <p className="text-sm text-gray-500">Pagos (período)</p>
                    <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(payments.filter(p => p.status === 'pago').reduce((sum, p) => sum + parseFloat(p.valor), 0))}
                    </p>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white p-4 rounded-lg shadow">
                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <svg className="animate-spin h-8 w-8 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                ) : payments.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <p className="text-lg font-medium">Nenhum pagamento encontrado</p>
                        <p className="text-sm">Clique em "Novo Pagamento" para adicionar.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <Table
                            columns={columns}
                            data={payments}
                            onDelete={null}
                            onEdit={handleEdit}
                        />
                    </div>
                )}
            </div>

            {/* Payment Modal */}
            <PaymentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                payment={editingPayment}
            />
        </div>
    );
}
