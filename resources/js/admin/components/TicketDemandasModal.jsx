import { useEffect, useState } from "react";
import axiosClient from "../axios-client";

const STATUS_COLORS = {
    pendente: 'bg-red-100 text-red-800',
    em_andamento: 'bg-yellow-100 text-yellow-800',
    em_aprovacao: 'bg-orange-100 text-orange-800',
    concluido: 'bg-green-100 text-green-800',
    cancelado: 'bg-gray-200 text-gray-600',
};

const STATUS_LABELS = {
    pendente: 'Pendente',
    em_andamento: 'Em Andamento',
    em_aprovacao: 'Em Aprovação',
    concluido: 'Concluído',
    cancelado: 'Cancelado',
};

export default function TicketDemandasModal({ isOpen, onClose, ticket }) {
    const [demandas, setDemandas] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && ticket?.id) {
            setLoading(true);
            axiosClient.get(`/demandas?suporte_id=${ticket.id}&per_page=100`)
                .then(({ data }) => setDemandas(data.data || []))
                .catch(() => setDemandas([]))
                .finally(() => setLoading(false));
        } else {
            setDemandas([]);
        }
    }, [isOpen, ticket]);

    if (!isOpen) return null;

    const total = demandas.length;
    const concluidas = demandas.filter(d => d.status === 'concluido').length;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-green-600 text-white px-6 py-4 rounded-t-lg flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold">Demandas do Chamado #{ticket?.id}</h2>
                        <p className="text-green-100 text-sm mt-0.5 line-clamp-1">{ticket?.mensagem || 'Sem mensagem'}</p>
                    </div>
                    <button onClick={onClose} className="text-white hover:text-gray-200 ml-4 flex-shrink-0">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>

                <div className="p-6">
                    {/* Summary bar */}
                    <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                        <span>Total: <strong>{total}</strong></span>
                        <span>Concluídas: <strong className="text-green-700">{concluidas}</strong></span>
                        <span>Pendentes: <strong className="text-red-700">{total - concluidas}</strong></span>
                    </div>

                    {loading && (
                        <div className="text-center py-8 text-gray-500">Carregando demandas...</div>
                    )}

                    {!loading && demandas.length === 0 && (
                        <div className="text-center py-8 text-gray-400">Nenhuma demanda vinculada a este chamado.</div>
                    )}

                    {!loading && demandas.length > 0 && (
                        <div className="space-y-3">
                            {demandas.map(d => (
                                <div key={d.id} className="border border-gray-200 rounded-lg p-4 flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs text-gray-400">#{d.id}</span>
                                            <h4 className="font-medium text-gray-800 truncate">{d.titulo}</h4>
                                        </div>
                                        {d.descricao && (
                                            <p className="text-xs text-gray-500 line-clamp-2">{d.descricao}</p>
                                        )}
                                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                                </svg>
                                                {Number(d.quantidade_horas_tecnicas).toFixed(1)}h
                                            </span>
                                            {d.dominio?.nome && (
                                                <span>{d.dominio.nome}</span>
                                            )}
                                        </div>
                                    </div>
                                    <span className={`flex-shrink-0 px-2 py-1 rounded text-xs font-semibold ${STATUS_COLORS[d.status] || 'bg-gray-100 text-gray-700'}`}>
                                        {STATUS_LABELS[d.status] || d.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex justify-end mt-6 pt-4 border-t">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
                        >
                            Fechar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
