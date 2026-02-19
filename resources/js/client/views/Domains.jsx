import { useState, useEffect } from "react";
import { useStateContext } from "../contexts/ContextProvider";
import axiosClient from "../axios-client";

import DomainModal from "../components/DomainModal";

export default function Domains() {
    const { theme } = useStateContext();
    const [domains, setDomains] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const isDark = theme.mode === 'dark';
    const cardClass = `${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-sm border`;

    const fetchDomains = () => {
        axiosClient.get('/dominios').then(({ data }) => {
            setDomains(data.data || []);
            setLoading(false);
        }).catch(() => setLoading(false));
    };

    useEffect(() => { fetchDomains(); }, []);

    const handleDelete = (id) => {
        if (!confirm('Tem certeza que deseja excluir este domínio?')) return;
        axiosClient.delete(`/dominios/${id}`).then(() => fetchDomains())
            .catch(err => alert(err.response?.data?.message || 'Erro ao excluir'));
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Meus Domínios</h2>
                <button onClick={() => setShowModal(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                    Adicionar Domínio
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-12"><svg className="animate-spin h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg></div>
            ) : domains.length === 0 ? (
                <div className={`${cardClass} p-12 text-center`}>
                    <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg>
                    <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Nenhum domínio cadastrado ainda.</p>
                    <button onClick={() => setShowModal(true)} className="mt-4 text-indigo-600 hover:text-indigo-700 font-medium">Cadastrar primeiro domínio →</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {domains.map(domain => (
                        <div key={domain.id} className={`${cardClass} p-5 hover:shadow-md transition-all`}>
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>{domain.nome}</h3>
                                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full mt-2 inline-block ${domain.status === 'ativo' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                        {domain.status}
                                    </span>
                                </div>
                                <button onClick={() => handleDelete(domain.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                </button>
                            </div>
                            <div className={`mt-3 pt-3 border-t ${isDark ? 'border-gray-700' : 'border-gray-100'} flex justify-between text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                <span>{domain.demandas_count || 0} demandas</span>
                                <span>{domain.assinatura?.plano?.nome || 'Sem plano'}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <DomainModal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    onSuccess={() => fetchDomains()}
                />
            )}
        </div>
    );
}
