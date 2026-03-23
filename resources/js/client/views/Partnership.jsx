import { useEffect, useState } from "react";
import axiosClient from "../axios-client";
import { useStateContext } from "../contexts/ContextProvider";

function formatCurrency(value) {
    if (!value && value !== 0) return '—';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function formatDate(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR');
}

export default function Partnership() {
    const { theme } = useStateContext();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const isDark = theme.mode === 'dark';

    const card = `${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-sm border`;
    const text = isDark ? 'text-white' : 'text-gray-800';
    const subtext = isDark ? 'text-gray-400' : 'text-gray-500';

    useEffect(() => {
        Promise.all([
            axiosClient.get('/auth/user'),
        ]).then(([userRes]) => {
            const cliente = userRes.data?.data?.cliente;
            if (cliente?.is_parceiro) {
                setData(cliente);
            }
        }).catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <svg className="animate-spin h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="space-y-6">
                <h2 className={`text-2xl font-bold ${text}`}>Parceria</h2>
                <div className={`${card} p-12 text-center`}>
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p className={subtext}>Você não possui uma parceria ativa no momento.</p>
                    <p className={`text-sm mt-1 ${subtext}`}>Entre em contato com o suporte para mais informações.</p>
                </div>
            </div>
        );
    }

    const stats = data.parceria_stats || {};

    const metricas = [
        { label: 'Chamados Gerados', value: stats.chamados_gerados ?? 0, color: 'blue' },
        { label: 'Chamados Concluídos', value: stats.chamados_concluidos ?? 0, color: 'green' },
        { label: 'Demandas Geradas', value: stats.demandas_geradas ?? 0, color: 'purple' },
        { label: 'Demandas Concluídas', value: stats.demandas_concluidas ?? 0, color: 'teal' },
    ];

    const colorMap = {
        blue:   { bg: isDark ? 'bg-blue-900/30' : 'bg-blue-50',   border: 'border-blue-200', num: 'text-blue-600', label: isDark ? 'text-blue-400' : 'text-blue-500' },
        green:  { bg: isDark ? 'bg-green-900/30' : 'bg-green-50',  border: 'border-green-200', num: 'text-green-600', label: isDark ? 'text-green-400' : 'text-green-500' },
        purple: { bg: isDark ? 'bg-purple-900/30' : 'bg-purple-50', border: 'border-purple-200', num: 'text-purple-600', label: isDark ? 'text-purple-400' : 'text-purple-500' },
        teal:   { bg: isDark ? 'bg-teal-900/30' : 'bg-teal-50',   border: 'border-teal-200', num: 'text-teal-600', label: isDark ? 'text-teal-400' : 'text-teal-500' },
    };

    return (
        <div className="space-y-6">
            {/* Title */}
            <div className="flex items-center gap-3">
                <h2 className={`text-2xl font-bold ${text}`}>Parceria</h2>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                    Ativo
                </span>
            </div>

            {/* Vigência e Valores */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Vigência */}
                <div className={`${card} p-5`}>
                    <div className="flex items-center gap-2 mb-4">
                        <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <h3 className={`font-semibold ${text}`}>Vigência da Parceria</h3>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className={`text-sm ${subtext}`}>Início</span>
                            <span className={`font-medium text-sm ${text}`}>{formatDate(data.parceria_inicio)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className={`text-sm ${subtext}`}>Término</span>
                            <span className={`font-medium text-sm ${text}`}>{formatDate(data.parceria_fim)}</span>
                        </div>
                    </div>
                </div>

                {/* Valores */}
                <div className={`${card} p-5`}>
                    <div className="flex items-center gap-2 mb-4">
                        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className={`font-semibold ${text}`}>Valores da Hora Técnica</h3>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className={`text-sm ${subtext}`}>Hora avulsa</span>
                            <span className="font-semibold text-sm text-green-600">{formatCurrency(data.valor_hora_avulsa)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className={`text-sm ${subtext}`}>Hora subsidiada (plano)</span>
                            <span className="font-semibold text-sm text-indigo-600">{formatCurrency(data.valor_hora_subsidiada)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Métricas */}
            <div className={card}>
                <div className="p-5 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <h3 className={`font-semibold ${text}`}>Resumo de Atividades</h3>
                    </div>
                </div>
                <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {metricas.map(({ label, value, color }) => {
                        const c = colorMap[color];
                        return (
                            <div key={label} className={`${c.bg} border ${c.border} rounded-xl p-4 text-center`}>
                                <p className={`text-3xl font-bold ${c.num}`}>{value}</p>
                                <p className={`text-xs font-medium mt-1 ${c.label}`}>{label}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
