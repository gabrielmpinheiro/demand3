import { useEffect, useState } from "react";
import axiosClient from "../axios-client";

const toDatetimeLocal = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export default function SuporteModal({ isOpen, onClose, onSave, suporte }) {
    const [formData, setFormData] = useState({
        cliente_id: '',
        dominio_id: '',
        mensagem: '',
        status: 'aberto',
        created_at: '',
    });
    const [customDate, setCustomDate] = useState(false);
    const [clients, setClients] = useState([]);
    const [domains, setDomains] = useState([]);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Fetch clients for the select dropdown
        axiosClient.get('/clientes')
            .then(({ data }) => {
                setClients(data.data);
            })
            .catch(err => {
                console.error("Erro ao buscar clientes:", err);
            });
    }, []);

    // Fetch domains when client changes
    useEffect(() => {
        if (formData.cliente_id) {
            axiosClient.get(`/dominios?cliente_id=${formData.cliente_id}`)
                .then(({ data }) => {
                    setDomains(data.data);
                })
                .catch(err => {
                    console.error("Erro ao buscar domínios:", err);
                    setDomains([]);
                });
        } else {
            setDomains([]);
        }
    }, [formData.cliente_id]);

    useEffect(() => {
        if (suporte) {
            setFormData({
                cliente_id: suporte.cliente_id || '',
                dominio_id: suporte.dominio_id || '',
                mensagem: suporte.mensagem || '',
                status: suporte.status || 'aberto',
                created_at: toDatetimeLocal(suporte.created_at) || '',
            });
            setCustomDate(Boolean(suporte.created_at));
        } else {
            setFormData({
                cliente_id: '',
                dominio_id: '',
                mensagem: '',
                status: 'aberto',
                created_at: '',
            });
            setCustomDate(false);
        }
        setErrors({});
    }, [suporte, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const updated = { ...prev, [name]: value };
            // Reset dominio_id when client changes
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

        if (!formData.mensagem.trim()) {
            newErrors.mensagem = 'Mensagem é obrigatória';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        setLoading(true);
        try {
            const payload = { ...formData };
            if (!customDate || !payload.created_at) {
                delete payload.created_at;
            }
            await onSave(payload);
            onClose();
        } catch (error) {
            console.error("Erro ao salvar suporte:", error);
            if (error.response && error.response.data && error.response.data.errors) {
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
                        {suporte ? 'Editar Suporte' : 'Novo Suporte'}
                    </h2>
                    <button onClick={onClose} className="text-white hover:text-gray-200">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
                            <p className="text-gray-400 text-xs mt-1">Nenhum domínio encontrado para este cliente.</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Mensagem *
                        </label>
                        <textarea
                            name="mensagem"
                            value={formData.mensagem}
                            onChange={handleChange}
                            rows="4"
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.mensagem ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="Descreva a solicitação de suporte..."
                            disabled={loading}
                        ></textarea>
                        {errors.mensagem && (
                            <p className="text-red-500 text-xs mt-1">{errors.mensagem}</p>
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
                            <option value="aberto">Aberto</option>
                            <option value="em_andamento">Em Andamento</option>
                            <option value="concluido">Concluído</option>
                            <option value="cancelado">Cancelado</option>
                        </select>
                    </div>

                    {/* Data de Criação (Poder Admin para retroativo) */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Data de Criação
                            </label>
                            <label className="flex items-center text-xs text-gray-600 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={customDate}
                                    onChange={(e) => {
                                        const checked = e.target.checked;
                                        setCustomDate(checked);
                                        if (!checked) {
                                            setFormData(prev => ({ ...prev, created_at: '' }));
                                        } else if (!formData.created_at) {
                                            setFormData(prev => ({ ...prev, created_at: toDatetimeLocal(new Date()) }));
                                        }
                                    }}
                                    className="mr-1.5 h-4 w-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                                />
                                Definir data retroativa / específica
                            </label>
                        </div>

                        {customDate ? (
                            <div>
                                <input
                                    type="datetime-local"
                                    name="created_at"
                                    value={formData.created_at || ''}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm bg-white"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    O chamado será registrado no sistema com esta data e hora (útil para relatórios e prestação de contas retroativos).
                                </p>
                            </div>
                        ) : (
                            <p className="text-xs text-gray-500">
                                Será registrada automaticamente com a <strong>data e hora atual</strong> do sistema.
                            </p>
                        )}
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

