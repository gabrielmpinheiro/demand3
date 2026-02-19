import { useState, useEffect } from "react";
import { useStateContext } from "../contexts/ContextProvider";
import axiosClient from "../axios-client";

import TicketModal from "../components/TicketModal";

export default function Tickets() {
    const { theme } = useStateContext();
    const [tickets, setTickets] = useState([]);
    const [domains, setDomains] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [filter, setFilter] = useState('');
    const isDark = theme.mode === 'dark';
    const card = `${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-sm border`;

    const fetchTickets = () => {
        const params = filter ? `?status=${filter}` : '';
        axiosClient.get(`/suportes${params}`).then(({ data }) => {
            setTickets(data.data || []);
            setLoading(false);
        }).catch(() => setLoading(false));
    };

    useEffect(() => {
        Promise.all([
            axiosClient.get(`/suportes${filter ? `?status=${filter}` : ''}`),
            axiosClient.get('/dominios'),
        ]).then(([t, d]) => {
            setTickets(t.data.data || []);
            setDomains(d.data.data || []);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, [filter]);

    const statusColor = (s) => ({ aberto: 'bg-yellow-100 text-yellow-700', em_andamento: 'bg-blue-100 text-blue-700', concluido: 'bg-green-100 text-green-700' }[s] || 'bg-gray-100 text-gray-600');

    if (loading) return <div className="flex justify-center py-12"><svg className="animate-spin h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg></div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Chamados</h2>
                <div className="flex gap-2 flex-wrap">
                    {['', 'aberto', 'em_andamento', 'concluido'].map(f => (
                        <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 text-xs rounded-lg font-medium transition ${filter === f ? 'bg-indigo-600 text-white' : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                            {f === '' ? 'Todos' : f === 'aberto' ? 'Aberto' : f === 'em_andamento' ? 'Em Andamento' : 'Concluído'}
                        </button>
                    ))}
                    <button onClick={() => setShowModal(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 text-xs rounded-lg font-medium">+ Novo</button>
                </div>
            </div>

            {tickets.length === 0 ? (
                <div className={`${card} p-12 text-center`}>
                    <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                    <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>Nenhum chamado encontrado.</p>
                    <button onClick={() => setShowModal(true)} className="mt-3 text-indigo-600 font-medium">Abrir primeiro chamado →</button>
                </div>
            ) : (
                <div className="space-y-3">
                    {tickets.map(t => (
                        <div key={t.id} className={`${card} p-5 hover:shadow-md transition-all`}>
                            <div className="flex flex-col sm:flex-row justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>{t.mensagem}</p>
                                    <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                        #{t.id} • {t.dominio?.nome || 'Geral'} • {new Date(t.created_at).toLocaleDateString('pt-BR')}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    {t.demandas_count > 0 && <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t.demandas_count} demanda(s)</span>}
                                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor(t.status)}`}>{t.status}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <TicketModal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    onSuccess={() => {
                        fetchTickets();
                        // Optional: show success message
                    }}
                    domains={domains}
                />
            )}
        </div>
    );
}
