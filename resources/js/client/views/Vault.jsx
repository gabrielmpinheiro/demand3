import { useState, useEffect } from "react";
import { useStateContext } from "../contexts/ContextProvider";
import axiosClient from "../axios-client";
import VaultModal from "../components/VaultModal";

export default function Vault() {
    const { theme } = useStateContext();
    const isDark = theme.mode === 'dark';
    const card = `${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-sm border`;

    const [vaults, setVaults] = useState([]);
    const [domains, setDomains] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editVault, setEditVault] = useState(null);
    const [revealedPasswords, setRevealedPasswords] = useState({});

    const fetchVaults = () => {
        const params = search ? `?search=${encodeURIComponent(search)}` : '';
        axiosClient.get(`/vault${params}`).then(({ data }) => {
            setVaults(data.data || []);
            setLoading(false);
        }).catch(() => setLoading(false));
    };

    useEffect(() => {
        Promise.all([
            axiosClient.get('/vault'),
            axiosClient.get('/dominios'),
        ]).then(([v, d]) => {
            setVaults(v.data.data || []);
            setDomains(d.data.data || []);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => fetchVaults(), 300);
        return () => clearTimeout(timer);
    }, [search]);

    const handleDelete = (id) => {
        if (!confirm('Excluir esta credencial?')) return;
        axiosClient.delete(`/vault/${id}`).then(() => fetchVaults());
    };

    const handleReveal = (id) => {
        if (revealedPasswords[id]) {
            setRevealedPasswords(prev => { const copy = { ...prev }; delete copy[id]; return copy; });
            return;
        }
        axiosClient.get(`/vault/${id}/revelar-senha`).then(({ data }) => {
            setRevealedPasswords(prev => ({ ...prev, [id]: data.data.senha }));
            // Auto-hide after 10 seconds
            setTimeout(() => {
                setRevealedPasswords(prev => { const copy = { ...prev }; delete copy[id]; return copy; });
            }, 10000);
        });
    };

    const handleEdit = (vault) => {
        setEditVault(vault);
        setShowModal(true);
    };

    if (loading) return <div className="flex justify-center py-12"><svg className="animate-spin h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg></div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    <svg className="w-6 h-6 inline-block mr-2 -mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    Vault
                </h2>
                <div className="flex gap-2 w-full sm:w-auto">
                    <input
                        type="text"
                        placeholder="Buscar..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className={`flex-1 sm:w-48 px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-200'}`}
                    />
                    <button onClick={() => { setEditVault(null); setShowModal(true); }} className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 text-xs rounded-lg font-medium whitespace-nowrap">+ Nova Credencial</button>
                </div>
            </div>

            {vaults.length === 0 ? (
                <div className={`${card} p-12 text-center`}>
                    <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>Nenhuma credencial salva.</p>
                    <button onClick={() => { setEditVault(null); setShowModal(true); }} className="mt-3 text-indigo-600 font-medium">Adicionar primeira credencial →</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {vaults.map(v => (
                        <div key={v.id} className={`${card} p-5`}>
                            <div className="flex justify-between items-start">
                                <div className="flex-1 min-w-0">
                                    <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>{v.servico}</p>
                                    <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{v.login}</p>
                                    {v.url && <a href={v.url} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-500 hover:underline mt-1 block truncate">{v.url}</a>}
                                    {v.dominio && <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Domínio: {v.dominio.nome}</p>}
                                    {v.notas && <p className={`text-xs mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'} line-clamp-2`}>{v.notas}</p>}
                                </div>
                                <div className="flex gap-1 flex-shrink-0 ml-3">
                                    <button onClick={() => handleReveal(v.id)} className={`p-1.5 rounded-lg transition text-xs ${revealedPasswords[v.id] ? 'bg-green-100 text-green-700' : isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`} title={revealedPasswords[v.id] ? 'Ocultar' : 'Revelar senha'}>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={revealedPasswords[v.id] ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" : "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"} /></svg>
                                    </button>
                                    <button onClick={() => handleEdit(v)} className={`p-1.5 rounded-lg transition ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                    </button>
                                    <button onClick={() => handleDelete(v.id)} className="p-1.5 rounded-lg transition hover:bg-red-100 text-red-400 hover:text-red-600">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>
                            </div>
                            {revealedPasswords[v.id] && (
                                <div className={`mt-3 p-2 rounded-lg text-sm font-mono ${isDark ? 'bg-gray-700 text-green-400' : 'bg-gray-50 text-green-700'}`}>
                                    {revealedPasswords[v.id]}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <VaultModal
                    isOpen={showModal}
                    onClose={() => { setShowModal(false); setEditVault(null); }}
                    onSuccess={fetchVaults}
                    domains={domains}
                    vault={editVault}
                />
            )}
        </div>
    );
}
