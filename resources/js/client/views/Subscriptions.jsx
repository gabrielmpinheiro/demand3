import { useState, useEffect } from "react";
import { useStateContext } from "../contexts/ContextProvider";
import axiosClient from "../axios-client";

export default function Subscriptions() {
    const { theme } = useStateContext();
    const [subscriptions, setSubscriptions] = useState([]);
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const isDark = theme.mode === 'dark';
    const card = `${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-sm border`;

    useEffect(() => {
        Promise.all([
            axiosClient.get('/assinaturas'),
            axiosClient.get('/planos'),
        ]).then(([s, p]) => {
            setSubscriptions(s.data.data || []);
            setPlans(p.data.data || []);
            setLoading(false);
        }).catch(() => setLoading(false));
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

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Meu Plano</h2>
                    <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        Consulte os detalhes do plano contratado para os seus domínios
                    </p>
                </div>
            </div>

            {/* Detalhes do Plano Atribuído ao Cliente */}
            {plans.length > 0 ? (
                <div className="space-y-4">
                    <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        {plans.length === 1 ? 'Detalhes do Plano Contratado' : 'Planos Contratados'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {plans.map(p => {
                            // Domínios vinculados a este plano
                            const linkedSubscriptions = subscriptions.filter(s => s.plano_id === p.id);

                            return (
                                <div key={p.id} className={`${card} p-6 hover:shadow-md transition-all relative overflow-hidden flex flex-col justify-between`}>
                                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 to-purple-600"></div>

                                    <div>
                                        <div className="flex justify-between items-start">
                                            <h4 className={`font-bold text-xl ${isDark ? 'text-white' : 'text-gray-800'}`}>{p.nome}</h4>
                                            <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-green-100 text-green-700">
                                                Plano Ativo
                                            </span>
                                        </div>

                                        <div className="mt-4 flex items-baseline gap-1">
                                            <span className="text-3xl font-extrabold text-indigo-600">
                                                R$ {parseFloat(p.preco || 0).toFixed(2).replace('.', ',')}
                                            </span>
                                            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>/mês</span>
                                        </div>

                                        {p.descricao && (
                                            <p className={`text-sm mt-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                                {p.descricao}
                                            </p>
                                        )}

                                        <div className="mt-5 space-y-2.5 border-t border-b py-4 my-4 border-gray-100 dark:border-gray-700">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className={`flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                                    <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                                    Horas técnicas inclusas:
                                                </span>
                                                <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                                    {p.limite_horas_tecnicas}h / mês
                                                </span>
                                            </div>

                                            {p.valor_hora && (
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className={`flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                                        <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                                        Hora técnica adicional:
                                                    </span>
                                                    <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                                        R$ {parseFloat(p.valor_hora).toFixed(2).replace('.', ',')}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Domínios atendidos por este plano */}
                                    <div className="mt-2 pt-2">
                                        <p className={`text-xs font-medium uppercase tracking-wider mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                            Domínio(s) com este plano:
                                        </p>
                                        {linkedSubscriptions.length > 0 ? (
                                            <div className="flex flex-wrap gap-1.5">
                                                {linkedSubscriptions.map(sub => (
                                                    <span key={sub.id} className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                                                        {sub.dominio?.nome || 'Domínio'}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Nenhum domínio vinculado</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div className={`${card} p-8 text-center max-w-2xl mx-auto my-4`}>
                    <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        Nenhum plano atribuído no momento
                    </h3>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} mb-4 leading-relaxed`}>
                        A definição e atribuição de planos aos seus domínios é realizada exclusivamente pela nossa equipe de administração. Se você precisa contratar ou alterar seu plano, entre em contato com nosso suporte através da abertura de um chamado.
                    </p>
                </div>
            )}

            {/* Lista detalhada das Assinaturas ativas */}
            <div className="space-y-4 pt-4">
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    Assinaturas por Domínio
                </h3>
                {subscriptions.length === 0 ? (
                    <div className={`${card} p-8 text-center`}>
                        <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                            Nenhuma assinatura ativa encontrada para os seus domínios.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {subscriptions.map(s => (
                            <div key={s.id} className={`${card} p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <p className={`font-semibold text-base ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                            {s.dominio?.nome}
                                        </p>
                                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${s.status === 'ativo' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                            {s.status}
                                        </span>
                                    </div>
                                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                        Plano: <span className="font-medium text-indigo-600 dark:text-indigo-400">{s.plano?.nome || 'Não definido'}</span>
                                        {s.data_inicio && ` • Início em: ${new Date(s.data_inicio).toLocaleDateString('pt-BR')}`}
                                    </p>
                                </div>
                                <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-700/50 px-4 py-2 rounded-lg border border-gray-100 dark:border-gray-700">
                                    <div className="text-right">
                                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Horas Disponíveis</p>
                                        <p className="text-xl font-bold text-indigo-600">
                                            {parseFloat(s.horas_disponiveis || 0).toFixed(1)}h
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
