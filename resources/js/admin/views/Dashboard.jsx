import { useEffect, useState } from "react";
import axiosClient from "../axios-client";

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axiosClient.get('/dashboard/stats')
            .then(({ data }) => {
                setStats(data);
            })
            .catch(err => {
                console.error("Erro ao buscar dados do dashboard:", err);
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="text-center py-20 text-gray-500">
                Erro ao carregar dados do dashboard.
            </div>
        );
    }

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    const statusColors = {
        aberto: 'bg-yellow-100 text-yellow-800',
        em_andamento: 'bg-blue-100 text-blue-800',
        concluido: 'bg-green-100 text-green-800',
        cancelado: 'bg-red-100 text-red-800',
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Dashboard</h2>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-gray-500 text-sm uppercase font-semibold">Faturamento (Mês)</div>
                            <div className="text-2xl font-bold mt-2 text-gray-800">{formatCurrency(stats.faturamento)}</div>
                        </div>
                        <div className="text-green-500">
                            <svg className="w-10 h-10 opacity-30" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.94s4.18 1.36 4.18 3.85c0 1.89-1.44 2.95-3.12 3.19z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-gray-500 text-sm uppercase font-semibold">Demandas Abertas</div>
                            <div className="text-2xl font-bold mt-2 text-gray-800">{stats.demandas_abertas}</div>
                        </div>
                        <div className="text-blue-500">
                            <svg className="w-10 h-10 opacity-30" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-yellow-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-gray-500 text-sm uppercase font-semibold">Clientes Ativos</div>
                            <div className="text-2xl font-bold mt-2 text-gray-800">{stats.clientes_ativos}</div>
                        </div>
                        <div className="text-yellow-500">
                            <svg className="w-10 h-10 opacity-30" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-purple-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-gray-500 text-sm uppercase font-semibold">Assinaturas Ativas</div>
                            <div className="text-2xl font-bold mt-2 text-gray-800">{stats.assinaturas_ativas}</div>
                        </div>
                        <div className="text-purple-500">
                            <svg className="w-10 h-10 opacity-30" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Support Tickets & Notifications */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Últimos Chamados */}
                <div className="bg-white rounded-lg shadow-sm">
                    <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-800">Últimos Chamados</h3>
                        <span className="text-xs text-gray-400 uppercase">Suporte</span>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {stats.ultimos_suportes.length > 0 ? (
                            stats.ultimos_suportes.map(suporte => (
                                <div key={suporte.id} className="px-6 py-3 hover:bg-gray-50 transition">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-800 truncate">
                                                {suporte.cliente}
                                            </p>
                                            <p className="text-xs text-gray-500 truncate mt-0.5">
                                                {suporte.mensagem}
                                            </p>
                                        </div>
                                        <div className="ml-3 flex flex-col items-end gap-1">
                                            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${statusColors[suporte.status] || 'bg-gray-100 text-gray-800'}`}>
                                                {suporte.status.replace('_', ' ')}
                                            </span>
                                            <span className="text-xs text-gray-400">{suporte.created_at}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="px-6 py-8 text-center text-gray-400 text-sm">
                                Nenhum chamado encontrado.
                            </div>
                        )}
                    </div>
                </div>

                {/* Últimas Notificações */}
                <div className="bg-white rounded-lg shadow-sm">
                    <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-800">Últimas Notificações</h3>
                        <span className="text-xs text-gray-400 uppercase">Notificações</span>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {stats.ultimas_notificacoes.length > 0 ? (
                            stats.ultimas_notificacoes.map(notif => (
                                <div key={notif.id} className={`px-6 py-3 hover:bg-gray-50 transition ${!notif.lida ? 'bg-blue-50/50' : ''}`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-800 flex items-center gap-2">
                                                {!notif.lida && (
                                                    <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"></span>
                                                )}
                                                {notif.titulo}
                                            </p>
                                            <p className="text-xs text-gray-500 truncate mt-0.5">
                                                {notif.mensagem}
                                            </p>
                                        </div>
                                        <span className="text-xs text-gray-400 ml-3 flex-shrink-0">{notif.created_at}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="px-6 py-8 text-center text-gray-400 text-sm">
                                Nenhuma notificação encontrada.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Assinaturas em Atraso */}
            <div className="bg-white rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-800">Assinaturas em Atraso</h3>
                    {stats.assinaturas_atraso.length > 0 && (
                        <span className="bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-1 rounded-full">
                            {stats.assinaturas_atraso.length} em atraso
                        </span>
                    )}
                </div>
                <div className="overflow-x-auto">
                    {stats.assinaturas_atraso.length > 0 ? (
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                    <th className="py-3 px-6">Cliente</th>
                                    <th className="py-3 px-6">Plano</th>
                                    <th className="py-3 px-6">Domínio</th>
                                    <th className="py-3 px-6">Valor</th>
                                    <th className="py-3 px-6">Vencimento</th>
                                    <th className="py-3 px-6">Dias em Atraso</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.assinaturas_atraso.map(item => (
                                    <tr key={item.id} className="bg-white border-b hover:bg-red-50/30">
                                        <td className="py-4 px-6 font-medium text-gray-800">{item.cliente}</td>
                                        <td className="py-4 px-6">{item.plano}</td>
                                        <td className="py-4 px-6">{item.dominio}</td>
                                        <td className="py-4 px-6">{formatCurrency(item.valor)}</td>
                                        <td className="py-4 px-6">{item.data_vencimento}</td>
                                        <td className="py-4 px-6">
                                            <span className={`px-2 py-1 rounded text-xs font-semibold ${item.dias_atraso > 15 ? 'bg-red-200 text-red-900' :
                                                    item.dias_atraso > 7 ? 'bg-red-100 text-red-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {item.dias_atraso} dias
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="px-6 py-8 text-center text-gray-400 text-sm">
                            <svg className="w-12 h-12 mx-auto mb-3 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            Nenhuma assinatura em atraso. Tudo em dia! 🎉
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
