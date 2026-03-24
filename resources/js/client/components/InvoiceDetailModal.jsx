import { useStateContext } from "../contexts/ContextProvider";

export default function InvoiceDetailModal({ isOpen, onClose, invoice }) {
    const { theme } = useStateContext();
    const isDark = theme.mode === 'dark';

    if (!isOpen || !invoice) return null;

    const statusLabel = (s) => {
        const map = { aberto: 'Em Aberto', pago: 'Pago', pendente_conferencia: 'Aguardando Conferência', cancelado: 'Cancelado' };
        return map[s] || s;
    };
    const statusColor = (s) => {
        const map = { aberto: 'bg-yellow-100 text-yellow-700', pago: 'bg-green-100 text-green-700', pendente_conferencia: 'bg-blue-100 text-blue-700', cancelado: 'bg-red-100 text-red-700' };
        return map[s] || 'bg-gray-100 text-gray-600';
    };

    const rows = [
        { label: 'Fatura #', value: invoice.id },
        { label: 'Domínio', value: invoice.assinatura?.dominio?.nome || invoice.suporte?.dominio?.nome || 'N/A' },
        { label: 'Chamado vinculado', value: invoice.suporte ? `#${invoice.suporte.id} – ${invoice.suporte.mensagem?.substring(0, 60) || ''}` : 'Nenhum' },
        { label: 'Referência', value: invoice.suporte ? `Chamado #${invoice.suporte.id} - ${invoice.suporte.mensagem?.substring(0, 40) || ''}` : (invoice.referencia_mes || 'N/A') },
        { label: 'Data de vencimento', value: invoice.data_vencimento ? new Date(invoice.data_vencimento).toLocaleDateString('pt-BR') : 'N/A' },
        { label: 'Valor', value: `R$ ${parseFloat(invoice.valor || 0).toFixed(2).replace('.', ',')}` },
        { label: 'Status', value: statusLabel(invoice.status), badge: statusColor(invoice.status) },
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-xl max-w-md w-full`}>
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                    <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        Detalhes da Fatura
                    </h3>
                    <button onClick={onClose} className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-5 space-y-3">
                    {rows.map(row => (
                        <div key={row.label} className="flex justify-between items-start gap-4">
                            <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'} whitespace-nowrap`}>{row.label}</span>
                            {row.badge ? (
                                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${row.badge}`}>{row.value}</span>
                            ) : (
                                <span className={`text-sm text-right ${isDark ? 'text-white' : 'text-gray-800'} font-medium`}>{row.value}</span>
                            )}
                        </div>
                    ))}
                </div>

                <div className="p-5 pt-0">
                    <button onClick={onClose} className={`w-full py-2.5 rounded-lg font-medium text-sm ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'} hover:opacity-80 transition`}>
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
}
