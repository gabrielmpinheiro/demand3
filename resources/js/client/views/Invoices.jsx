import { useState, useEffect } from "react";
import { useStateContext } from "../contexts/ContextProvider";
import axiosClient from "../axios-client";
import PaymentInfoModal from "../components/PaymentInfoModal";
import InvoiceDetailModal from "../components/InvoiceDetailModal";

export default function Invoices() {
    const { theme } = useStateContext();
    const [invoices, setInvoices] = useState([]);
    const [domains, setDomains] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [filterDomain, setFilterDomain] = useState('');
    const [filterDateFrom, setFilterDateFrom] = useState('');
    const [filterDateTo, setFilterDateTo] = useState('');
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const isDark = theme.mode === 'dark';
    const card = `${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-sm border`;
    const inputClass = `px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-200 text-gray-700'}`;

    const fetchInvoices = () => {
        const params = new URLSearchParams();
        if (filter) params.set('status', filter);
        if (filterDomain) params.set('dominio_id', filterDomain);
        if (filterDateFrom) params.set('data_inicio', filterDateFrom);
        if (filterDateTo) params.set('data_fim', filterDateTo);
        const qs = params.toString() ? `?${params.toString()}` : '';

        axiosClient.get(`/pagamentos${qs}`).then(({ data }) => {
            setInvoices(data.data || []);
            setLoading(false);
        }).catch(() => setLoading(false));
    };

    useEffect(() => {
        axiosClient.get('/dominios').then(({ data }) => setDomains(data.data || [])).catch(() => { });
    }, []);

    useEffect(() => {
        fetchInvoices();
    }, [filter, filterDomain, filterDateFrom, filterDateTo]);

    const openPaymentModal = (invoice) => {
        setSelectedInvoice(invoice);
        setShowPaymentModal(true);
    };

    const openDetailModal = (invoice) => {
        setSelectedInvoice(invoice);
        setShowDetailModal(true);
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

    const clearFilters = () => {
        setFilter('');
        setFilterDomain('');
        setFilterDateFrom('');
        setFilterDateTo('');
    };

    const hasActiveFilters = filter || filterDomain || filterDateFrom || filterDateTo;

    if (loading) return <div className="flex justify-center py-12"><svg className="animate-spin h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg></div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4">
                {/* Title row */}
                <div className="flex justify-between items-center">
                    <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Faturas</h2>
                    {hasActiveFilters && (
                        <button onClick={clearFilters} className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                            Limpar filtros
                        </button>
                    )}
                </div>

                {/* Status filter */}
                <div className="flex gap-2 flex-wrap">
                    {['', 'aberto', 'pago', 'pendente_conferencia'].map(f => (
                        <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 text-xs rounded-lg font-medium transition ${filter === f ? 'bg-indigo-600 text-white' : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                            {f === '' ? 'Todas' : statusLabel(f)}
                        </button>
                    ))}
                </div>

                {/* Date and domain filters */}
                <div className="flex flex-wrap gap-3 items-center">
                    {/* Domain select */}
                    <select
                        value={filterDomain}
                        onChange={e => setFilterDomain(e.target.value)}
                        className={inputClass}
                    >
                        <option value="">Todos os domínios</option>
                        {domains.map(d => <option key={d.id} value={d.id}>{d.nome}</option>)}
                    </select>

                    {/* Date range */}
                    <div className="flex items-center gap-2">
                        <label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>De:</label>
                        <input
                            type="date"
                            value={filterDateFrom}
                            onChange={e => setFilterDateFrom(e.target.value)}
                            className={inputClass}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Até:</label>
                        <input
                            type="date"
                            value={filterDateTo}
                            onChange={e => setFilterDateTo(e.target.value)}
                            className={inputClass}
                        />
                    </div>
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
                                        {inv.assinatura?.dominio?.nome || inv.suporte?.dominio?.nome || 'N/A'}
                                        {inv.referencia_mes ? ` • ${inv.referencia_mes}` : ''}
                                        {inv.suporte && ` • Chamado #${inv.suporte.id} - ${inv.suporte.mensagem?.substring(0, 30)}...`}
                                    </p>
                                    <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                        Vencimento: {inv.data_vencimento ? new Date(inv.data_vencimento).toLocaleDateString('pt-BR') : 'N/A'}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3 flex-wrap">
                                    <p className="text-xl font-bold text-indigo-600">R$ {parseFloat(inv.valor).toFixed(2).replace('.', ',')}</p>
                                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor(inv.status)}`}>{statusLabel(inv.status)}</span>
                                    {/* Detail button */}
                                    <button onClick={() => openDetailModal(inv)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                                        Detalhes
                                    </button>
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

            {showDetailModal && selectedInvoice && (
                <InvoiceDetailModal
                    isOpen={showDetailModal}
                    onClose={() => setShowDetailModal(false)}
                    invoice={selectedInvoice}
                />
            )}
        </div>
    );
}
