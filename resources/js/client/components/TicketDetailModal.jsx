import { useState, useEffect } from "react";
import axiosClient from "../axios-client";
import { useStateContext } from "../contexts/ContextProvider";

export default function TicketDetailModal({ isOpen, onClose, ticketId }) {
    const { theme } = useStateContext();
    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const isDark = theme.mode === 'dark';

    useEffect(() => {
        if (isOpen && ticketId) {
            setLoading(true);
            axiosClient.get(`/suportes/${ticketId}`).then(({ data }) => {
                setTicket(data.data);
                setLoading(false);
            }).catch(() => setLoading(false));
        }
    }, [isOpen, ticketId]);

    if (!isOpen) return null;

    const statusColor = (s) => ({
        pendente: 'bg-yellow-100 text-yellow-700',
        em_andamento: 'bg-blue-100 text-blue-700',
        em_aprovacao: 'bg-purple-100 text-purple-700',
        concluido: 'bg-green-100 text-green-700',
        cancelado: 'bg-red-100 text-red-700',
        aberto: 'bg-yellow-100 text-yellow-700',
    }[s] || 'bg-gray-100 text-gray-600');

    const statusLabel = (s) => ({
        pendente: 'Pendente',
        em_andamento: 'Em Andamento',
        em_aprovacao: 'Em Aprovação',
        concluido: 'Concluído',
        cancelado: 'Cancelado',
        aberto: 'Aberto',
    }[s] || s);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto`}>
                {/* Header */}
                <div className={`p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                    <div className="flex justify-between items-start">
                        <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>Detalhes do Chamado</h3>
                        <button onClick={onClose} className={`p-1 rounded-lg transition ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <svg className="animate-spin h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                    </div>
                ) : ticket ? (
                    <div className="p-6 space-y-6">
                        {/* Ticket Info */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 flex-wrap">
                                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor(ticket.status)}`}>{statusLabel(ticket.status)}</span>
                                <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>#{ticket.id}</span>
                                <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{new Date(ticket.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            {ticket.dominio && (
                                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    <span className="font-medium">Domínio:</span> {ticket.dominio.nome}
                                </p>
                            )}
                            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                <p className={`text-sm ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{ticket.mensagem}</p>
                            </div>
                        </div>

                        {/* Demandas vinculadas */}
                        <div>
                            <h4 className={`text-sm font-semibold uppercase tracking-wider mb-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                Demandas Vinculadas ({ticket.demandas?.length || 0})
                            </h4>
                            {(!ticket.demandas || ticket.demandas.length === 0) ? (
                                <div className={`text-center py-6 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                    <svg className="w-10 h-10 mx-auto text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Nenhuma demanda vinculada ainda.</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {ticket.demandas.map(d => (
                                        <div key={d.id} className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'} flex flex-col sm:flex-row justify-between gap-2`}>
                                            <div className="flex-1 min-w-0">
                                                <p className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-800'}`}>{d.titulo}</p>
                                                {d.descricao && <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'} line-clamp-2`}>{d.descricao}</p>}
                                                <div className={`flex items-center gap-3 mt-2 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                                    <span>{d.quantidade_horas_tecnicas}h técnicas</span>
                                                    {d.dominio && <span>• {d.dominio.nome}</span>}
                                                    <span>• {new Date(d.created_at).toLocaleDateString('pt-BR')}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor(d.status)}`}>{statusLabel(d.status)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Progress overview */}
                        {ticket.demandas && ticket.demandas.length > 0 && (() => {
                            const total = ticket.demandas.length;
                            const concluidas = ticket.demandas.filter(d => d.status === 'concluido').length;
                            const pct = Math.round((concluidas / total) * 100);
                            return (
                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Progresso</span>
                                        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{concluidas}/{total} ({pct}%)</span>
                                    </div>
                                    <div className={`w-full rounded-full h-2 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                                        <div className="bg-indigo-600 h-2 rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                ) : (
                    <div className="p-6 text-center">
                        <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>Chamado não encontrado.</p>
                    </div>
                )}

                {/* Footer */}
                <div className={`p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-100'} flex justify-end`}>
                    <button onClick={onClose} className={`px-4 py-2 rounded-lg font-medium text-sm ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'} transition`}>
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
}
