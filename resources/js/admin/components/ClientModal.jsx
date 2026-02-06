import { useEffect, useState } from "react";

export default function ClientModal({ isOpen, onClose, onSave, client }) {
    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        telefone: '',
        endereco: '',
        cidade: '',
        estado: '',
        cep: '',
        cnpj: '',
        cpf: '',
        inscricao_estadual: '',
        inscricao_municipal: '',
        status: 'ativo',
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (client) {
            // Modo edição
            setFormData({
                nome: client.nome || '',
                email: client.email || '',
                telefone: client.telefone || '',
                endereco: client.endereco || '',
                cidade: client.cidade || '',
                estado: client.estado || '',
                cep: client.cep || '',
                cnpj: client.cnpj || '',
                cpf: client.cpf || '',
                inscricao_estadual: client.inscricao_estadual || '',
                inscricao_municipal: client.inscricao_municipal || '',
                status: client.status || 'ativo',
            });
        } else {
            // Modo criação
            setFormData({
                nome: '',
                email: '',
                telefone: '',
                endereco: '',
                cidade: '',
                estado: '',
                cep: '',
                cnpj: '',
                cpf: '',
                inscricao_estadual: '',
                inscricao_municipal: '',
                status: 'ativo',
            });
        }
        setErrors({});
    }, [client, isOpen]);

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

        if (!formData.email.trim()) {
            newErrors.email = 'Email é obrigatório';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email inválido';
        }

        if (formData.estado && formData.estado.length !== 2) {
            newErrors.estado = 'Estado deve ter 2 caracteres (ex: SP)';
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
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-green-600 text-white px-6 py-4 rounded-t-lg">
                    <h2 className="text-xl font-bold">
                        {client ? 'Editar Cliente' : 'Novo Cliente'}
                    </h2>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Informações Básicas */}
                    <div className="border-b pb-4 mb-4">
                        <h3 className="text-lg font-semibold text-gray-700 mb-3">Informações Básicas</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Nome */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nome *
                                </label>
                                <input
                                    type="text"
                                    name="nome"
                                    value={formData.nome}
                                    onChange={handleChange}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.nome ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="Nome do cliente ou empresa"
                                />
                                {errors.nome && (
                                    <p className="text-red-500 text-xs mt-1">{errors.nome}</p>
                                )}
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="email@exemplo.com"
                                />
                                {errors.email && (
                                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                                )}
                            </div>

                            {/* Telefone */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Telefone
                                </label>
                                <input
                                    type="text"
                                    name="telefone"
                                    value={formData.telefone}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="(00) 00000-0000"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Documentos */}
                    <div className="border-b pb-4 mb-4">
                        <h3 className="text-lg font-semibold text-gray-700 mb-3">Documentos</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* CNPJ */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    CNPJ
                                </label>
                                <input
                                    type="text"
                                    name="cnpj"
                                    value={formData.cnpj}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="00.000.000/0000-00"
                                />
                            </div>

                            {/* CPF */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    CPF
                                </label>
                                <input
                                    type="text"
                                    name="cpf"
                                    value={formData.cpf}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="000.000.000-00"
                                />
                            </div>

                            {/* Inscrição Estadual */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Inscrição Estadual
                                </label>
                                <input
                                    type="text"
                                    name="inscricao_estadual"
                                    value={formData.inscricao_estadual}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="Inscrição Estadual"
                                />
                            </div>

                            {/* Inscrição Municipal */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Inscrição Municipal
                                </label>
                                <input
                                    type="text"
                                    name="inscricao_municipal"
                                    value={formData.inscricao_municipal}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="Inscrição Municipal"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Endereço */}
                    <div className="border-b pb-4 mb-4">
                        <h3 className="text-lg font-semibold text-gray-700 mb-3">Endereço</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Endereço */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Endereço
                                </label>
                                <input
                                    type="text"
                                    name="endereco"
                                    value={formData.endereco}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="Rua, número, complemento"
                                />
                            </div>

                            {/* Cidade */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Cidade
                                </label>
                                <input
                                    type="text"
                                    name="cidade"
                                    value={formData.cidade}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="Cidade"
                                />
                            </div>

                            {/* Estado */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Estado
                                </label>
                                <input
                                    type="text"
                                    name="estado"
                                    value={formData.estado}
                                    onChange={handleChange}
                                    maxLength={2}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.estado ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="SP"
                                />
                                {errors.estado && (
                                    <p className="text-red-500 text-xs mt-1">{errors.estado}</p>
                                )}
                            </div>

                            {/* CEP */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    CEP
                                </label>
                                <input
                                    type="text"
                                    name="cep"
                                    value={formData.cep}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="00000-000"
                                />
                            </div>
                        </div>
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
