import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useStateContext } from "../contexts/ContextProvider";
import axiosClient from "../axios-client";

export default function Dashboard() {
    const { theme } = useStateContext();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const isDark = theme.mode === 'dark';

    useEffect(() => {
        axiosClient.get('/dashboard/stats')
            .then(({ data }) => {
                setStats(data.data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            </div>
        );
    }

    const cardClass = `${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-sm border p-6 transition-all duration-200 hover:shadow-md`;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Dashboard</h2>
                <Link to="/tickets" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                    Novo Chamado
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className={cardClass}>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg>
                        </div>
                        <div>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Domínios Ativos</p>
                            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{stats?.dominios_ativos || 0}</p>
                        </div>
                    </div>
                </div>
                <div className={cardClass}>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                            <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z"></path></svg>
                        </div>
                        <div>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Faturas Pendentes</p>
                            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{stats?.faturas_pendentes || 0}</p>
                        </div>
                    </div>
                </div>
                <div className={cardClass}>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </div>
                        <div>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Demandas Concluídas</p>
                            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{stats?.demandas_por_status?.concluido || 0}</p>
                        </div>
                    </div>
                </div>
                <div className={cardClass}>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </div>
                        <div>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Em Andamento</p>
                            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{stats?.demandas_por_status?.em_andamento || 0}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Demand Status Overview */}
            <div className={cardClass}>
                <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>Status das Demandas</h3>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {[
                        { label: 'Pendente', key: 'pendente', color: 'bg-yellow-100 text-yellow-700' },
                        { label: 'Em Andamento', key: 'em_andamento', color: 'bg-blue-100 text-blue-700' },
                        { label: 'Em Aprovação', key: 'em_aprovacao', color: 'bg-purple-100 text-purple-700' },
                        { label: 'Concluído', key: 'concluido', color: 'bg-green-100 text-green-700' },
                        { label: 'Cancelado', key: 'cancelado', color: 'bg-red-100 text-red-700' },
                    ].map(item => (
                        <div key={item.key} className={`${item.color} rounded-lg p-3 text-center`}>
                            <p className="text-2xl font-bold">{stats?.demandas_por_status?.[item.key] || 0}</p>
                            <p className="text-xs font-medium mt-1">{item.label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent Tickets */}
            <div className={cardClass}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>Últimos Chamados</h3>
                    <Link to="/tickets" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">Ver todos →</Link>
                </div>
                {stats?.chamados_recentes?.length > 0 ? (
                    <div className="space-y-3">
                        {stats.chamados_recentes.map(chamado => (
                            <div key={chamado.id} className={`flex items-center justify-between p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                        {chamado.mensagem?.substring(0, 60) || 'Sem mensagem'}...
                                    </p>
                                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                                        {chamado.dominio?.nome || 'Geral'} • {new Date(chamado.created_at).toLocaleDateString('pt-BR')}
                                    </p>
                                </div>
                                <span className={`text-xs font-medium px-2 py-1 rounded-full ml-3 ${chamado.status === 'aberto' ? 'bg-yellow-100 text-yellow-700' :
                                        chamado.status === 'em_andamento' ? 'bg-blue-100 text-blue-700' :
                                            chamado.status === 'concluido' ? 'bg-green-100 text-green-700' :
                                                'bg-gray-100 text-gray-700'
                                    }`}>
                                    {chamado.status === 'aberto' ? 'Aberto' :
                                        chamado.status === 'em_andamento' ? 'Em Andamento' :
                                            chamado.status === 'concluido' ? 'Concluído' : chamado.status}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className={`text-center py-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Nenhum chamado aberto ainda.</p>
                )}
            </div>
        </div>
    );
}
