import { useEffect, useState } from "react";
import axiosClient from "../axios-client";
import Table from "../components/Table";
import VaultModal from "../components/VaultModal";
import { toast } from "react-toastify";

export default function Vault() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [pagination, setPagination] = useState({});

    // Filters
    const [clients, setClients] = useState([]);
    const [domains, setDomains] = useState([]);
    const [filterClienteId, setFilterClienteId] = useState('');
    const [filterDominioId, setFilterDominioId] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Revealed passwords
    const [revealedPasswords, setRevealedPasswords] = useState({});

    // Fetch clients for filter
    useEffect(() => {
        axiosClient.get('/clientes')
            .then(({ data }) => setClients(data.data))
            .catch(err => console.error("Erro ao buscar clientes:", err));
    }, []);

    // Fetch domains when client filter changes
    useEffect(() => {
        if (filterClienteId) {
            axiosClient.get(`/dominios?cliente_id=${filterClienteId}`)
                .then(({ data }) => setDomains(data.data))
                .catch(err => {
                    console.error("Erro ao buscar domínios:", err);
                    setDomains([]);
                });
        } else {
            setDomains([]);
            setFilterDominioId('');
        }
    }, [filterClienteId]);

    const fetchItems = (page = 1) => {
        setLoading(true);
        setRevealedPasswords({});

        let url = `/vault?page=${page}`;
        if (filterClienteId) url += `&cliente_id=${filterClienteId}`;
        if (filterDominioId) url += `&dominio_id=${filterDominioId}`;
        if (searchTerm.trim()) url += `&search=${encodeURIComponent(searchTerm.trim())}`;

        axiosClient.get(url)
            .then(({ data }) => {
                setItems(data.data);
                setPagination(data.meta || {});
            })
            .catch(() => {
                toast.error("Erro ao buscar credenciais");
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchItems();
    }, [filterClienteId, filterDominioId]);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchItems(1);
    };

    const handleDelete = (item) => {
        if (!window.confirm("Tem certeza que deseja excluir esta credencial?")) return;

        axiosClient.delete(`/vault/${item.id}`)
            .then(() => {
                toast.success("Credencial excluída com sucesso");
                fetchItems(pagination.current_page || 1);
            })
            .catch(err => {
                const message = err.response?.data?.message || "Erro ao excluir credencial.";
                toast.error(message);
            });
    };

    const handleEdit = (item) => {
        setCurrentItem(item);
        setModalOpen(true);
    };

    const handleCreate = () => {
        setCurrentItem(null);
        setModalOpen(true);
    };

    const handleSave = async (formData) => {
        if (currentItem) {
            await axiosClient.put(`/vault/${currentItem.id}`, formData);
            toast.success("Credencial atualizada com sucesso");
        } else {
            await axiosClient.post('/vault', formData);
            toast.success("Credencial criada com sucesso");
        }
        fetchItems(pagination.current_page || 1);
    };

    const handleRevealPassword = async (id) => {
        if (revealedPasswords[id]) {
            // Toggle hide
            setRevealedPasswords(prev => {
                const copy = { ...prev };
                delete copy[id];
                return copy;
            });
            return;
        }

        try {
            const { data } = await axiosClient.get(`/vault/${id}/revelar-senha`);
            setRevealedPasswords(prev => ({
                ...prev,
                [id]: data.data.senha
            }));
        } catch (err) {
            toast.error("Erro ao revelar senha");
        }
    };

    const handleCopyPassword = async (id) => {
        let senha = revealedPasswords[id];

        if (!senha) {
            try {
                const { data } = await axiosClient.get(`/vault/${id}/revelar-senha`);
                senha = data.data.senha;
            } catch (err) {
                toast.error("Erro ao copiar senha");
                return;
            }
        }

        try {
            await navigator.clipboard.writeText(senha);
            toast.success("Senha copiada!");
        } catch {
            toast.error("Erro ao copiar para a área de transferência");
        }
    };

    const columns = [
        { key: 'id', label: 'ID' },
        { key: 'servico', label: 'Serviço' },
        {
            key: 'cliente',
            label: 'Cliente',
            render: (val) => val?.nome || 'N/A'
        },
        {
            key: 'dominio',
            label: 'Domínio',
            render: (val) => val?.nome || '—'
        },
        { key: 'login', label: 'Login' },
        {
            key: 'url', label: 'URL/Acesso', render: (val) => {
                if (!val) return '—';
                const isUrl = /^https?:\/\//i.test(val);
                return isUrl ? (
                    <a href={val} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs truncate block max-w-[150px]" title={val}>
                        {val.replace(/^https?:\/\//, '')}
                    </a>
                ) : (
                    <span className="text-xs text-gray-700 truncate block max-w-[150px]" title={val}>{val}</span>
                );
            }
        },
        {
            key: 'senha_actions',
            label: 'Senha',
            render: (val, row) => (
                <div className="flex items-center gap-1">
                    <span className="text-xs font-mono">
                        {revealedPasswords[row.id] || '••••••••'}
                    </span>
                    <button
                        onClick={() => handleRevealPassword(row.id)}
                        className="text-gray-500 hover:text-gray-700 p-1"
                        title={revealedPasswords[row.id] ? "Ocultar" : "Revelar"}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {revealedPasswords[row.id] ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"></path>
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                            )}
                        </svg>
                    </button>
                    <button
                        onClick={() => handleCopyPassword(row.id)}
                        className="text-gray-500 hover:text-green-600 p-1"
                        title="Copiar senha"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                        </svg>
                    </button>
                </div>
            )
        },
        {
            key: 'status',
            label: 'Status',
            render: (val) => {
                let color = 'bg-gray-100 text-gray-800';
                if (val === 'ativo') color = 'bg-green-100 text-green-800';
                if (val === 'inativo') color = 'bg-yellow-100 text-yellow-800';
                if (val === 'cancelado') color = 'bg-red-100 text-red-800';
                const label = (val || 'ativo').charAt(0).toUpperCase() + (val || 'ativo').slice(1);
                return (
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${color}`}>
                        {label}
                    </span>
                );
            }
        },
        { key: 'updated_at', label: 'Atualizado', render: (val) => val ? new Date(val).toLocaleDateString('pt-BR') : '—' },
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-gray-800">Vault (Senhas)</h1>
                <button
                    onClick={handleCreate}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                >
                    Nova Credencial
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow mb-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Cliente</label>
                        <select
                            value={filterClienteId}
                            onChange={(e) => setFilterClienteId(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <option value="">Todos os clientes</option>
                            {clients.map(c => (
                                <option key={c.id} value={c.id}>{c.nome}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Domínio</label>
                        <select
                            value={filterDominioId}
                            onChange={(e) => setFilterDominioId(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                            disabled={!filterClienteId}
                        >
                            <option value="">Todos os domínios</option>
                            {domains.map(d => (
                                <option key={d.id} value={d.id}>{d.nome}</option>
                            ))}
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-gray-600 mb-1">Buscar</label>
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Buscar por serviço, login ou URL..."
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                            <button
                                type="submit"
                                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition text-sm"
                            >
                                Buscar
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
                {loading && <div className="text-center py-4">Carregando...</div>}

                {!loading && (
                    <Table
                        columns={columns}
                        data={items}
                        onDelete={handleDelete}
                        onEdit={handleEdit}
                    />
                )}

                {/* Pagination */}
                {pagination.last_page > 1 && (
                    <div className="flex justify-center gap-2 mt-4">
                        {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map(page => (
                            <button
                                key={page}
                                onClick={() => fetchItems(page)}
                                className={`px-3 py-1 rounded text-sm ${page === pagination.current_page
                                    ? 'bg-green-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                {page}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <VaultModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSave={handleSave}
                vault={currentItem}
            />
        </div>
    );
}
