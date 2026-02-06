import { useEffect, useState } from "react";

export default function DomainModal({ isOpen, onClose, onSave, domain, clienteId }) {
    const [formData, setFormData] = useState({
        nome: '',
        status: 'ativo',
        cliente_id: clienteId || null,
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (domain) {
            // Modo edição
            setFormData({
                nome: domain.nome || '',
                status: domain.status || 'ativo',
                cliente_id: domain.cliente_id || clienteId,
            });
        } else {
            // Modo criação
            setFormData({
                nome: '',
                status: 'ativo',
                cliente_id: clienteId || null,
            });
        }
        setErrors({});
    }, [domain, clienteId, isOpen]);

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
            newErrors.nome = 'Nome do domínio é obrigatório';
        } else {
            // Validação básica de formato de domínio
            const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-_.]+\.[a-zA-Z]{2,}$/;
            if (!domainRegex.test(formData.nome.trim())) {
                newErrors.nome = 'Formato de domínio inválido (ex: exemplo.com.br)';
            }
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
        await onSave({
            ...formData,
            cliente_id: clienteId || formData.cliente_id,
        });
        setLoading(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-blue-600 text-white px-6 py-4 rounded-t-lg">
                    <h2 className="text-xl font-bold">
                        {domain ? 'Editar Domínio' : 'Novo Domínio'}
                    </h2>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Nome do Domínio */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Domínio *
                        </label>
                        <input
                            type="text"
                            name="nome"
                            value={formData.nome}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.nome ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="exemplo.com.br"
                        />
                        {errors.nome && (
                            <p className="text-red-500 text-xs mt-1">{errors.nome}</p>
                        )}
                        <p className="text-gray-500 text-xs mt-1">
                            O domínio deve ser único no sistema.
                        </p>
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="ativo">Ativo</option>
                            <option value="inativo">Inativo</option>
                            <option value="cancelado">Cancelado</option>
                        </select>
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
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
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
