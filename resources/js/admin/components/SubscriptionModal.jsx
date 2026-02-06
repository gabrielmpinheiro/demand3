import { useEffect, useState } from "react";
import axiosClient from "../axios-client";

export default function SubscriptionModal({ isOpen, onClose, onSave, subscription }) {
    const [formData, setFormData] = useState({
        cliente_id: '',
        dominio_id: '',
        plano_id: '',
        data_inicio: '',
        status: 'ativo',
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [clients, setClients] = useState([]);
    const [domains, setDomains] = useState([]);
    const [plans, setPlans] = useState([]);
    const [loadingData, setLoadingData] = useState(false);

    // Carregar clientes e planos ao abrir o modal
    useEffect(() => {
        if (isOpen) {
            fetchClients();
            fetchPlans();
        }
    }, [isOpen]);

    // Carregar domínios quando selecionar cliente
    useEffect(() => {
        if (formData.cliente_id) {
            fetchDomains(formData.cliente_id);
        } else {
            setDomains([]);
        }
    }, [formData.cliente_id]);

    // Preencher form ao editar
    useEffect(() => {
        if (subscription) {
            setFormData({
                cliente_id: subscription.cliente_id || '',
                dominio_id: subscription.dominio_id || '',
                plano_id: subscription.plano_id || '',
                data_inicio: subscription.data_inicio ? subscription.data_inicio.split('T')[0] : '',
                status: subscription.status || 'ativo',
            });
        } else {
            setFormData({
                cliente_id: '',
                dominio_id: '',
                plano_id: '',
                data_inicio: new Date().toISOString().split('T')[0],
                status: 'ativo',
            });
        }
        setErrors({});
    }, [subscription, isOpen]);

    const fetchClients = async () => {
        setLoadingData(true);
        try {
            const { data } = await axiosClient.get('/clientes?per_page=100');
            setClients(data.data || []);
        } catch (error) {
            console.error('Erro ao carregar clientes:', error);
        } finally {
            setLoadingData(false);
        }
    };

    const fetchDomains = async (clienteId) => {
        try {
            const { data } = await axiosClient.get(`/dominios?cliente_id=${clienteId}&per_page=100`);
            setDomains(data.data || []);
        } catch (error) {
            console.error('Erro ao carregar domínios:', error);
        }
    };

    const fetchPlans = async () => {
        try {
            const { data } = await axiosClient.get('/planos?status=ativo&per_page=100');
            setPlans(data.data || []);
        } catch (error) {
            console.error('Erro ao carregar planos:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Limpar domínio se mudar cliente
        if (name === 'cliente_id') {
            setFormData(prev => ({
                ...prev,
                cliente_id: value,
                dominio_id: ''
            }));
        }

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.cliente_id) {
            newErrors.cliente_id = 'Cliente é obrigatório';
        }

        if (!formData.dominio_id) {
            newErrors.dominio_id = 'Domínio é obrigatório';
        }

        if (!formData.plano_id) {
            newErrors.plano_id = 'Plano é obrigatório';
        }

        if (!formData.data_inicio) {
            newErrors.data_inicio = 'Data de início é obrigatória';
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
        await onSave(formData);
        setLoading(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-green-600 text-white px-6 py-4 rounded-t-lg">
                    <h2 className="text-xl font-bold">
                        {subscription ? 'Editar Assinatura' : 'Nova Assinatura'}
                    </h2>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {loadingData ? (
                        <div className="flex justify-center py-8">
                            <svg className="animate-spin h-8 w-8 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        </div>
                    ) : (
                        <>
                            {/* Cliente */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Cliente *
                                </label>
                                <select
                                    name="cliente_id"
                                    value={formData.cliente_id}
                                    onChange={handleChange}
                                    disabled={!!subscription}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.cliente_id ? 'border-red-500' : 'border-gray-300'} ${subscription ? 'bg-gray-100' : ''}`}
                                >
                                    <option value="">Selecione um cliente</option>
                                    {clients.map(client => (
                                        <option key={client.id} value={client.id}>
                                            {client.nome} ({client.email})
                                        </option>
                                    ))}
                                </select>
                                {errors.cliente_id && (
                                    <p className="text-red-500 text-xs mt-1">{errors.cliente_id}</p>
                                )}
                            </div>

                            {/* Domínio */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Domínio *
                                </label>
                                <select
                                    name="dominio_id"
                                    value={formData.dominio_id}
                                    onChange={handleChange}
                                    disabled={!formData.cliente_id || !!subscription}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.dominio_id ? 'border-red-500' : 'border-gray-300'} ${!formData.cliente_id || subscription ? 'bg-gray-100' : ''}`}
                                >
                                    <option value="">
                                        {!formData.cliente_id ? 'Selecione um cliente primeiro' : 'Selecione um domínio'}
                                    </option>
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
                                    <p className="text-yellow-600 text-xs mt-1">Cliente não possui domínios cadastrados</p>
                                )}
                            </div>

                            {/* Plano */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Plano *
                                </label>
                                <select
                                    name="plano_id"
                                    value={formData.plano_id}
                                    onChange={handleChange}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.plano_id ? 'border-red-500' : 'border-gray-300'}`}
                                >
                                    <option value="">Selecione um plano</option>
                                    {plans.map(plan => (
                                        <option key={plan.id} value={plan.id}>
                                            {plan.nome} - R$ {parseFloat(plan.preco).toFixed(2)} ({plan.limite_horas_tecnicas}h)
                                        </option>
                                    ))}
                                </select>
                                {errors.plano_id && (
                                    <p className="text-red-500 text-xs mt-1">{errors.plano_id}</p>
                                )}
                            </div>

                            {/* Data Início e Status */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Data Início */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Data de Início *
                                    </label>
                                    <input
                                        type="date"
                                        name="data_inicio"
                                        value={formData.data_inicio}
                                        onChange={handleChange}
                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.data_inicio ? 'border-red-500' : 'border-gray-300'}`}
                                    />
                                    {errors.data_inicio && (
                                        <p className="text-red-500 text-xs mt-1">{errors.data_inicio}</p>
                                    )}
                                </div>

                                {/* Status */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Status
                                    </label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    >
                                        <option value="ativo">Ativo</option>
                                        <option value="inativo">Inativo</option>
                                        <option value="cancelado">Cancelado</option>
                                    </select>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Footer */}
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
                            disabled={loading || loadingData}
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
