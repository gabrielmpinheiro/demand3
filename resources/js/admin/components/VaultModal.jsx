import { useEffect, useState } from "react";
import axiosClient from "../axios-client";

export default function VaultModal({ isOpen, onClose, onSave, vault }) {
    const [formData, setFormData] = useState({
        cliente_id: '',
        dominio_id: '',
        servico: '',
        login: '',
        senha: '',
        url: '',
        notas: '',
        status: 'ativo',
    });
    const [clients, setClients] = useState([]);
    const [domains, setDomains] = useState([]);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    // Fetch clients
    useEffect(() => {
        axiosClient.get('/clientes')
            .then(({ data }) => setClients(data.data))
            .catch(err => console.error("Erro ao buscar clientes:", err));
    }, []);

    // Fetch domains when client changes
    useEffect(() => {
        if (formData.cliente_id) {
            axiosClient.get(`/dominios?cliente_id=${formData.cliente_id}`)
                .then(({ data }) => setDomains(data.data))
                .catch(err => {
                    console.error("Erro ao buscar domínios:", err);
                    setDomains([]);
                });
        } else {
            setDomains([]);
        }
    }, [formData.cliente_id]);

    useEffect(() => {
        if (vault) {
            setFormData({
                cliente_id: vault.cliente_id || '',
                dominio_id: vault.dominio_id || '',
                servico: vault.servico || '',
                login: vault.login || '',
                senha: '', // Never prefill password
                url: vault.url || '',
                notas: vault.notas || '',
                status: vault.status || 'ativo',
            });
        } else {
            setFormData({
                cliente_id: '',
                dominio_id: '',
                servico: '',
                login: '',
                senha: '',
                url: '',
                notas: '',
                status: 'ativo',
            });
        }
        setErrors({});
    }, [vault, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const updated = { ...prev, [name]: value };
            if (name === 'cliente_id') {
                updated.dominio_id = '';
            }
            return updated;
        });
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.cliente_id) {
            newErrors.cliente_id = 'Cliente é obrigatório';
        }
        if (!formData.servico.trim()) {
            newErrors.servico = 'Serviço é obrigatório';
        }
        if (!formData.login.trim()) {
            newErrors.login = 'Login é obrigatório';
        }
        if (!vault && !formData.senha.trim()) {
            newErrors.senha = 'Senha é obrigatória para novas credenciais';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return;

        setLoading(true);
        try {
            const payload = { ...formData };
            // Don't send empty password on edit
            if (vault && !payload.senha.trim()) {
                delete payload.senha;
            }
            await onSave(payload);
            onClose();
        } catch (error) {
            console.error("Erro ao salvar credencial:", error);
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            }
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="bg-green-600 text-white px-6 py-4 rounded-t-lg flex justify-between items-center">
                    <h2 className="text-xl font-bold">
                        {vault ? 'Editar Credencial' : 'Nova Credencial'}
                    </h2>
                    <button onClick={onClose} className="text-white hover:text-gray-200">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Cliente *
                            </label>
                            <select
                                name="cliente_id"
                                value={formData.cliente_id}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.cliente_id ? 'border-red-500' : 'border-gray-300'}`}
                                disabled={loading}
                            >
                                <option value="">Selecione um cliente</option>
                                {clients.map(client => (
                                    <option key={client.id} value={client.id}>
                                        {client.nome}
                                    </option>
                                ))}
                            </select>
                            {errors.cliente_id && (
                                <p className="text-red-500 text-xs mt-1">{errors.cliente_id}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Domínio
                            </label>
                            <select
                                name="dominio_id"
                                value={formData.dominio_id}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.dominio_id ? 'border-red-500' : 'border-gray-300'}`}
                                disabled={loading || !formData.cliente_id}
                            >
                                <option value="">Selecione um domínio</option>
                                {domains.map(domain => (
                                    <option key={domain.id} value={domain.id}>
                                        {domain.nome}
                                    </option>
                                ))}
                            </select>
                            {errors.dominio_id && (
                                <p className="text-red-500 text-xs mt-1">{errors.dominio_id}</p>
                            )}
                            {formData.cliente_id && domains.length === 0 && (
                                <p className="text-gray-400 text-xs mt-1">Nenhum domínio encontrado.</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Serviço *
                            </label>
                            <input
                                type="text"
                                name="servico"
                                value={formData.servico}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.servico ? 'border-red-500' : 'border-gray-300'}`}
                                placeholder="Ex: cPanel, WordPress, FTP..."
                                disabled={loading}
                            />
                            {errors.servico && (
                                <p className="text-red-500 text-xs mt-1">{errors.servico}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                URL
                            </label>
                            <input
                                type="text"
                                name="url"
                                value={formData.url}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.url ? 'border-red-500' : 'border-gray-300'}`}
                                placeholder="URL ou caminho de acesso (ex: https://... ou servidor:21)"
                                disabled={loading}
                            />
                            {errors.url && (
                                <p className="text-red-500 text-xs mt-1">{errors.url}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Login *
                            </label>
                            <input
                                type="text"
                                name="login"
                                value={formData.login}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.login ? 'border-red-500' : 'border-gray-300'}`}
                                placeholder="Nome de usuário"
                                disabled={loading}
                            />
                            {errors.login && (
                                <p className="text-red-500 text-xs mt-1">{errors.login}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Senha {!vault && '*'}
                            </label>
                            <input
                                type="password"
                                name="senha"
                                value={formData.senha}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.senha ? 'border-red-500' : 'border-gray-300'}`}
                                placeholder={vault ? "Deixe vazio para manter a atual" : "Senha"}
                                disabled={loading}
                            />
                            {errors.senha && (
                                <p className="text-red-500 text-xs mt-1">{errors.senha}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Status
                            </label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                disabled={loading}
                            >
                                <option value="ativo">Ativo</option>
                                <option value="inativo">Inativo</option>
                                <option value="cancelado">Cancelado</option>
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Notas
                            </label>
                            <textarea
                                name="notas"
                                value={formData.notas}
                                onChange={handleChange}
                                rows="3"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="Anotações adicionais..."
                                disabled={loading}
                            ></textarea>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition disabled:opacity-50 flex items-center gap-2"
                        >
                            {loading && (
                                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            )}
                            {loading ? 'Salvando...' : 'Salvar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
