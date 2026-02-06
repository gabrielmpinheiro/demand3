import { useEffect, useState } from "react";
import axiosClient from "../axios-client";

export default function PaymentModal({ isOpen, onClose, onSave, payment }) {
    const [formData, setFormData] = useState({
        cliente_id: '',
        assinatura_id: '',
        valor: '',
        valor_horas_avulsas: '',
        data_vencimento: '',
        data_pagamento: '',
        forma_pagamento: '',
        referencia_mes: '',
        descricao: '',
        status: 'aberto',
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [clients, setClients] = useState([]);
    const [subscriptions, setSubscriptions] = useState([]);
    const [loadingData, setLoadingData] = useState(false);
    const [isDemandaAvulsa, setIsDemandaAvulsa] = useState(false);

    // Carregar clientes ao abrir o modal
    useEffect(() => {
        if (isOpen) {
            fetchClients();
        }
    }, [isOpen]);

    // Carregar assinaturas quando selecionar cliente
    useEffect(() => {
        if (formData.cliente_id && !isDemandaAvulsa) {
            fetchSubscriptions(formData.cliente_id);
        } else {
            setSubscriptions([]);
        }
    }, [formData.cliente_id, isDemandaAvulsa]);

    // Preencher form ao editar
    useEffect(() => {
        if (payment) {
            setFormData({
                cliente_id: payment.cliente_id || '',
                assinatura_id: payment.assinatura_id || '',
                valor: payment.valor || '',
                valor_horas_avulsas: payment.valor_horas_avulsas || '',
                data_vencimento: payment.data_vencimento ? payment.data_vencimento.split('T')[0] : '',
                data_pagamento: payment.data_pagamento ? payment.data_pagamento.split('T')[0] : '',
                forma_pagamento: payment.forma_pagamento || '',
                referencia_mes: payment.referencia_mes || '',
                descricao: payment.descricao || '',
                status: payment.status || 'aberto',
            });
            setIsDemandaAvulsa(!payment.assinatura_id);
        } else {
            const currentMonth = new Date().toISOString().slice(0, 7);
            const nextMonth = new Date();
            nextMonth.setMonth(nextMonth.getMonth() + 1);
            nextMonth.setDate(10);

            setFormData({
                cliente_id: '',
                assinatura_id: '',
                valor: '',
                valor_horas_avulsas: '',
                data_vencimento: nextMonth.toISOString().split('T')[0],
                data_pagamento: '',
                forma_pagamento: '',
                referencia_mes: currentMonth,
                descricao: '',
                status: 'aberto',
            });
            setIsDemandaAvulsa(false);
        }
        setErrors({});
    }, [payment, isOpen]);

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

    const fetchSubscriptions = async (clienteId) => {
        try {
            const { data } = await axiosClient.get(`/assinaturas?cliente_id=${clienteId}&status=ativo&per_page=100`);
            setSubscriptions(data.data || []);
        } catch (error) {
            console.error('Erro ao carregar assinaturas:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Limpar assinatura se mudar cliente
        if (name === 'cliente_id') {
            setFormData(prev => ({
                ...prev,
                cliente_id: value,
                assinatura_id: ''
            }));
        }

        // Ao selecionar assinatura, preencher valor do plano
        if (name === 'assinatura_id' && value) {
            const sub = subscriptions.find(s => s.id === parseInt(value));
            if (sub && sub.plano) {
                setFormData(prev => ({
                    ...prev,
                    assinatura_id: value,
                    valor: sub.plano.preco,
                    descricao: `Mensalidade - ${sub.plano.nome} (${sub.dominio?.nome || ''})`
                }));
            }
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

        if (!isDemandaAvulsa && !formData.assinatura_id) {
            newErrors.assinatura_id = 'Assinatura é obrigatória (ou marque como demanda avulsa)';
        }

        if (!formData.valor || parseFloat(formData.valor) < 0) {
            newErrors.valor = 'Valor é obrigatório';
        }

        if (!formData.data_vencimento) {
            newErrors.data_vencimento = 'Data de vencimento é obrigatória';
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

        const dataToSend = {
            ...formData,
            valor: parseFloat(formData.valor),
            valor_horas_avulsas: formData.valor_horas_avulsas ? parseFloat(formData.valor_horas_avulsas) : null,
            assinatura_id: isDemandaAvulsa ? null : formData.assinatura_id,
        };

        await onSave(dataToSend);
        setLoading(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-green-600 text-white px-6 py-4 rounded-t-lg">
                    <h2 className="text-xl font-bold">
                        {payment ? 'Editar Pagamento' : 'Novo Pagamento'}
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
                            {/* Demanda Avulsa Checkbox */}
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="demandaAvulsa"
                                    checked={isDemandaAvulsa}
                                    onChange={(e) => {
                                        setIsDemandaAvulsa(e.target.checked);
                                        if (e.target.checked) {
                                            setFormData(prev => ({ ...prev, assinatura_id: '' }));
                                        }
                                    }}
                                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                />
                                <label htmlFor="demandaAvulsa" className="ml-2 text-sm text-gray-700">
                                    Demanda Avulsa (sem assinatura vinculada)
                                </label>
                            </div>

                            {/* Cliente */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Cliente *
                                </label>
                                <select
                                    name="cliente_id"
                                    value={formData.cliente_id}
                                    onChange={handleChange}
                                    disabled={!!payment}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.cliente_id ? 'border-red-500' : 'border-gray-300'} ${payment ? 'bg-gray-100' : ''}`}
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

                            {/* Assinatura (se não for demanda avulsa) */}
                            {!isDemandaAvulsa && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Assinatura *
                                    </label>
                                    <select
                                        name="assinatura_id"
                                        value={formData.assinatura_id}
                                        onChange={handleChange}
                                        disabled={!formData.cliente_id || !!payment}
                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.assinatura_id ? 'border-red-500' : 'border-gray-300'} ${!formData.cliente_id || payment ? 'bg-gray-100' : ''}`}
                                    >
                                        <option value="">
                                            {!formData.cliente_id ? 'Selecione um cliente primeiro' : 'Selecione uma assinatura'}
                                        </option>
                                        {subscriptions.map(sub => (
                                            <option key={sub.id} value={sub.id}>
                                                {sub.dominio?.nome} - {sub.plano?.nome} (R$ {parseFloat(sub.plano?.preco).toFixed(2)})
                                            </option>
                                        ))}
                                    </select>
                                    {errors.assinatura_id && (
                                        <p className="text-red-500 text-xs mt-1">{errors.assinatura_id}</p>
                                    )}
                                </div>
                            )}

                            {/* Valores */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Valor do Plano (R$) *
                                    </label>
                                    <input
                                        type="number"
                                        name="valor"
                                        value={formData.valor}
                                        onChange={handleChange}
                                        step="0.01"
                                        min="0"
                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.valor ? 'border-red-500' : 'border-gray-300'}`}
                                        placeholder="0.00"
                                    />
                                    {errors.valor && (
                                        <p className="text-red-500 text-xs mt-1">{errors.valor}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Horas Avulsas (R$)
                                    </label>
                                    <input
                                        type="number"
                                        name="valor_horas_avulsas"
                                        value={formData.valor_horas_avulsas}
                                        onChange={handleChange}
                                        step="0.01"
                                        min="0"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            {/* Datas */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Data de Vencimento *
                                    </label>
                                    <input
                                        type="date"
                                        name="data_vencimento"
                                        value={formData.data_vencimento}
                                        onChange={handleChange}
                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.data_vencimento ? 'border-red-500' : 'border-gray-300'}`}
                                    />
                                    {errors.data_vencimento && (
                                        <p className="text-red-500 text-xs mt-1">{errors.data_vencimento}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Período de Referência
                                    </label>
                                    <input
                                        type="month"
                                        name="referencia_mes"
                                        value={formData.referencia_mes}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>
                            </div>

                            {/* Forma de Pagamento e Status */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Forma de Pagamento
                                    </label>
                                    <select
                                        name="forma_pagamento"
                                        value={formData.forma_pagamento}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    >
                                        <option value="">Selecione</option>
                                        <option value="pix">PIX</option>
                                        <option value="boleto">Boleto</option>
                                        <option value="cartao_credito">Cartão de Crédito</option>
                                        <option value="cartao_debito">Cartão de Débito</option>
                                        <option value="transferencia">Transferência</option>
                                        <option value="dinheiro">Dinheiro</option>
                                    </select>
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
                                    >
                                        <option value="aberto">Aberto</option>
                                        <option value="pago">Pago</option>
                                        <option value="cancelado">Cancelado</option>
                                    </select>
                                </div>
                            </div>

                            {/* Data de Pagamento (se pago) */}
                            {formData.status === 'pago' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Data de Pagamento
                                    </label>
                                    <input
                                        type="date"
                                        name="data_pagamento"
                                        value={formData.data_pagamento}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>
                            )}

                            {/* Descrição */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Descrição
                                </label>
                                <textarea
                                    name="descricao"
                                    value={formData.descricao}
                                    onChange={handleChange}
                                    rows={2}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="Descrição do pagamento..."
                                />
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
