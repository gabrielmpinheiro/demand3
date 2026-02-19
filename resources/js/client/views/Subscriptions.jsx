import { useState, useEffect } from "react";
import { useStateContext } from "../contexts/ContextProvider";
import axiosClient from "../axios-client";

export default function Subscriptions() {
    const { theme } = useStateContext();
    const [subscriptions, setSubscriptions] = useState([]);
    const [plans, setPlans] = useState([]);
    const [domains, setDomains] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedDomain, setSelectedDomain] = useState('');
    const [selectedPlan, setSelectedPlan] = useState('');
    const [saving, setSaving] = useState(false);
    const isDark = theme.mode === 'dark';
    const card = `${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-sm border`;

    useEffect(() => {
        Promise.all([
            axiosClient.get('/assinaturas'),
            axiosClient.get('/planos'),
            axiosClient.get('/dominios'),
        ]).then(([s, p, d]) => {
            setSubscriptions(s.data.data || []);
            setPlans(p.data.data || []);
            setDomains(d.data.data || []);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    const handleSubscribe = (ev) => {
        ev.preventDefault();
        setSaving(true);
        axiosClient.post('/assinaturas', { dominio_id: selectedDomain, plano_id: selectedPlan })
            .then(() => { setShowModal(false); axiosClient.get('/assinaturas').then(({ data }) => setSubscriptions(data.data || [])); })
            .catch(err => alert(err.response?.data?.message || 'Erro'))
            .finally(() => setSaving(false));
    };

    if (loading) return <div className="flex justify-center py-12"><svg className="animate-spin h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg></div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Planos e Assinaturas</h2>
                <button onClick={() => setShowModal(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium">Assinar Plano</button>
            </div>

            {plans.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {plans.map(p => (
                        <div key={p.id} className={`${card} p-5 hover:shadow-md transition-all`}>
                            <h4 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-800'}`}>{p.nome}</h4>
                            <div className="mt-3"><span className="text-3xl font-bold text-indigo-600">R$ {parseFloat(p.preco).toFixed(2).replace('.', ',')}</span><span className={isDark ? 'text-gray-400' : 'text-gray-500'}>/mês</span></div>
                            <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>⏱ {p.limite_horas_tecnicas}h incluídas</p>
                        </div>
                    ))}
                </div>
            )}

            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>Minhas Assinaturas</h3>
            {subscriptions.length === 0 ? (
                <div className={`${card} p-8 text-center`}><p className={isDark ? 'text-gray-400' : 'text-gray-500'}>Nenhuma assinatura ativa.</p></div>
            ) : (
                <div className="space-y-3">
                    {subscriptions.map(s => (
                        <div key={s.id} className={`${card} p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3`}>
                            <div>
                                <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>{s.dominio?.nome}</p>
                                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Plano: {s.plano?.nome}</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <p className="text-lg font-bold text-indigo-600">{parseFloat(s.horas_disponiveis).toFixed(1)}h</p>
                                <span className={`text-xs px-2.5 py-1 rounded-full ${s.status === 'ativo' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{s.status}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-xl max-w-md w-full p-6`}>
                        <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>Assinar Plano</h3>
                        <form onSubmit={handleSubscribe} className="space-y-4">
                            <select value={selectedDomain} onChange={e => setSelectedDomain(e.target.value)} className={`w-full px-4 py-3 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-200'}`} required>
                                <option value="">Selecione um domínio</option>
                                {domains.map(d => <option key={d.id} value={d.id}>{d.nome}</option>)}
                            </select>
                            <select value={selectedPlan} onChange={e => setSelectedPlan(e.target.value)} className={`w-full px-4 py-3 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-200'}`} required>
                                <option value="">Selecione um plano</option>
                                {plans.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                            </select>
                            <div className="flex gap-3 justify-end">
                                <button type="button" onClick={() => setShowModal(false)} className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>Cancelar</button>
                                <button type="submit" disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50">{saving ? 'Assinando...' : 'Assinar'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
