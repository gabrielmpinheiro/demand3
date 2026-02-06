import { useEffect, useState } from "react";

export default function PlanModal({ isOpen, onClose, onSave, plan }) {
    const [formData, setFormData] = useState({
        nome: '',
        descricao: '',
        preco: '',
        limite_horas_tecnicas: '',
        valor_hora: '',
        status: 'ativo',
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (plan) {
            // Modo edição
            setFormData({
                nome: plan.nome || '',
                descricao: plan.descricao || '',
                preco: plan.preco || '',
                limite_horas_tecnicas: plan.limite_horas_tecnicas || '',
                valor_hora: plan.valor_hora || '',
                status: plan.status || 'ativo',
            });
        } else {
            // Modo criação
            setFormData({
                nome: '',
                descricao: '',
                preco: '',
                limite_horas_tecnicas: '',
                valor_hora: '50.00',
                status: 'ativo',
            });
        }
        setErrors({});
    }, [plan, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.nome.trim()) {
            newErrors.nome = 'Nome é obrigatório';
        }

        if (formData.preco === '' || formData.preco === null) {
            newErrors.preco = 'Preço é obrigatório';
        } else if (isNaN(formData.preco) || parseFloat(formData.preco) < 0) {
            newErrors.preco = 'Preço deve ser um número válido';
        }

        if (formData.limite_horas_tecnicas === '' || formData.limite_horas_tecnicas === null) {
            newErrors.limite_horas_tecnicas = 'Limite de horas é obrigatório';
        } else if (isNaN(formData.limite_horas_tecnicas) || parseInt(formData.limite_horas_tecnicas) < 0) {
            newErrors.limite_horas_tecnicas = 'Limite de horas deve ser um número inteiro válido';
        }

        if (formData.valor_hora && (isNaN(formData.valor_hora) || parseFloat(formData.valor_hora) < 0)) {
            newErrors.valor_hora = 'Valor hora deve ser um número válido';
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
            preco: parseFloat(formData.preco),
            limite_horas_tecnicas: parseInt(formData.limite_horas_tecnicas),
            valor_hora: formData.valor_hora ? parseFloat(formData.valor_hora) : null,
        };

        await onSave(dataToSend);
        setLoading(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-green-600 text-white px-6 py-4 rounded-t-lg">
                    <h2 className="text-xl font-bold">
                        {plan ? 'Editar Plano' : 'Novo Plano'}
                    </h2>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Nome */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nome *
                        </label>
                        <input
                            type="text"
                            name="nome"
                            value={formData.nome}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.nome ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="Ex: Starter, Basic, Growth..."
                        />
                        {errors.nome && (
                            <p className="text-red-500 text-xs mt-1">{errors.nome}</p>
                        )}
                    </div>

                    {/* Descrição */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Descrição
                        </label>
                        <textarea
                            name="descricao"
                            value={formData.descricao}
                            onChange={handleChange}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="Descrição do plano..."
                        />
                    </div>

                    {/* Preço e Horas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Preço */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Preço (R$) *
                            </label>
                            <input
                                type="number"
                                name="preco"
                                value={formData.preco}
                                onChange={handleChange}
                                step="0.01"
                                min="0"
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.preco ? 'border-red-500' : 'border-gray-300'}`}
                                placeholder="0.00"
                            />
                            {errors.preco && (
                                <p className="text-red-500 text-xs mt-1">{errors.preco}</p>
                            )}
                        </div>

                        {/* Limite de Horas Técnicas */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Horas Técnicas *
                            </label>
                            <input
                                type="number"
                                name="limite_horas_tecnicas"
                                value={formData.limite_horas_tecnicas}
                                onChange={handleChange}
                                step="1"
                                min="0"
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.limite_horas_tecnicas ? 'border-red-500' : 'border-gray-300'}`}
                                placeholder="0"
                            />
                            {errors.limite_horas_tecnicas && (
                                <p className="text-red-500 text-xs mt-1">{errors.limite_horas_tecnicas}</p>
                            )}
                        </div>
                    </div>

                    {/* Valor Hora e Status */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Valor Hora */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Valor Hora Extra (R$)
                            </label>
                            <input
                                type="number"
                                name="valor_hora"
                                value={formData.valor_hora}
                                onChange={handleChange}
                                step="0.01"
                                min="0"
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.valor_hora ? 'border-red-500' : 'border-gray-300'}`}
                                placeholder="50.00"
                            />
                            {errors.valor_hora && (
                                <p className="text-red-500 text-xs mt-1">{errors.valor_hora}</p>
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
