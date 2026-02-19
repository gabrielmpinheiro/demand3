import { useState, useEffect } from "react";
import { useStateContext } from "../contexts/ContextProvider";
import axiosClient from "../axios-client";
import PaymentInfoModal from "../components/PaymentInfoModal";

export default function Invoices() {
    const { theme } = useStateContext();
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const isDark = theme.mode === 'dark';
    const card = `${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-sm border`;

    const fetchInvoices = () => {
        const params = filter ? `?status=${filter}` : '';
        axiosClient.get(`/pagamentos${params}`).then(({ data }) => {
            setInvoices(data.data || []);
            setLoading(false);
        }).catch(() => setLoading(false));
    };

    useEffect(() => { fetchInvoices(); }, [filter]);

    const openPaymentModal = (invoice) => {
        setSelectedInvoice(invoice);
        setShowPaymentModal(true);
    };

    const handlePaymentConfirmed = (id) => {
        axiosClient.post(`/pagamentos/${id}/marcar-pendente`)
            .then(() => fetchInvoices())
            .catch(err => alert(err.response?.data?.message || 'Erro'));
    };

    const statusLabel = (s) => {
        const map = { aberto: 'Em Aberto', pago: 'Pago', pendente_conferencia: 'Aguardando Conferência', cancelado: 'Cancelado' };
        return map[s] || s;
    };
    const statusColor = (s) => {
        const map = { aberto: 'bg-yellow-100 text-yellow-700', pago: 'bg-green-100 text-green-700', pendente_conferencia: 'bg-blue-100 text-blue-700', cancelado: 'bg-red-100 text-red-700' };
        return map[s] || 'bg-gray-100 text-gray-600';
    };

    if (loading) return <div className="flex justify-center py-12"><svg className="animate-spin h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg></div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Faturas</h2>
                <div className="flex gap-2">
                    {['', 'aberto', 'pago', 'pendente_conferencia'].map(f => (
                        <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 text-xs rounded-lg font-medium transition ${filter === f ? 'bg-indigo-600 text-white' : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                            {f === '' ? 'Todas' : statusLabel(f)}
                        </button>
                    ))}
                </div>
            </div>

            {invoices.length === 0 ? (
                <div className={`${card} p-8 text-center`}><p className={isDark ? 'text-gray-400' : 'text-gray-500'}>Nenhuma fatura encontrada.</p></div>
            ) : (
                <div className="space-y-3">
                    {invoices.map(inv => (
                        <div key={inv.id} className={`${card} p-5`}>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div>
                                    <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>Fatura #{inv.id}</p>
                                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                        {inv.assinatura?.dominio?.nome || 'N/A'} • {inv.referencia_mes || 'N/A'}
                                    </p>
                                    <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                        Vencimento: {inv.data_vencimento ? new Date(inv.data_vencimento).toLocaleDateString('pt-BR') : 'N/A'}
                                    </p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <p className="text-xl font-bold text-indigo-600">R$ {parseFloat(inv.valor).toFixed(2).replace('.', ',')}</p>
                                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor(inv.status)}`}>{statusLabel(inv.status)}</span>
                                    {inv.status === 'aberto' && (
                                        <button onClick={() => openPaymentModal(inv)} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition">
                                            Pagar
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showPaymentModal && selectedInvoice && (
                <PaymentInfoModal
                    isOpen={showPaymentModal}
                    onClose={() => setShowPaymentModal(false)}
                    invoice={selectedInvoice}
                    onConfirm={() => handlePaymentConfirmed(selectedInvoice.id)}
                />
            )}
        </div>
    );
}
