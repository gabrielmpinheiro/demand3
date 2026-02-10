import { useEffect, useState } from "react";
import axiosClient from "../axios-client";

export default function DemandModal({ isOpen, onClose, onSave, demand, suporteId, clienteId, dominioId }) {
    const [formData, setFormData] = useState({
        dominio_id: '',
        titulo: '',
        descricao: '',
        quantidade_horas_tecnicas: 1,
        status: 'pendente',
        suporte_id: '',
    });
    const [domains, setDomains] = useState([]);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && clienteId) {
            // Fetch domains for the specific client
            axiosClient.get(`/dominios?cliente_id=${clienteId}`)
                .then(({ data }) => {
                    setDomains(data.data);
                })
                .catch(err => {
                    console.error("Erro ao buscar domínios:", err);
                });
        }
    }, [isOpen, clienteId]);

    useEffect(() => {
        if (demand) {
            setFormData({
                dominio_id: demand.dominio_id || '',
                titulo: demand.titulo || '',
                descricao: demand.descricao || '',
                quantidade_horas_tecnicas: demand.quantidade_horas_tecnicas || 1,
                status: demand.status || 'pendente',
                suporte_id: demand.suporte_id || suporteId || '',
            });
        } else {
            setFormData({
                dominio_id: dominioId || '',
                titulo: '',
                descricao: '',
                quantidade_horas_tecnicas: 1,
                status: 'pendente',
                suporte_id: suporteId || '',
            });
        }
        setErrors({});
    }, [demand, isOpen, suporteId]);

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

        if (!formData.dominio_id) {
            newErrors.dominio_id = 'Domínio é obrigatório';
        }

        if (!formData.titulo.trim()) {
            newErrors.titulo = 'Título é obrigatório';
        }

        if (formData.quantidade_horas_tecnicas < 0.5) {
            newErrors.quantidade_horas_tecnicas = 'Mínimo de 0.5 horas';
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
            await onSave(formData);
            onClose();
        } catch (error) {
            console.error("Erro ao salvar demanda:", error);
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
                        {demand ? 'Editar Demanda' : 'Nova Demanda'}
                    </h2>
                    <button onClick={onClose} className="text-white hover:text-gray-200">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Domínio *
                            </label>
                            <select
                                name="dominio_id"
                                value={formData.dominio_id}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.dominio_id ? 'border-red-500' : 'border-gray-300'}`}
                                disabled={loading}
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
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Título *
                            </label>
                            <input
                                type="text"
                                name="titulo"
                                value={formData.titulo}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.titulo ? 'border-red-500' : 'border-gray-300'}`}
                                placeholder="Título da demanda"
                                disabled={loading}
                            />
                            {errors.titulo && (
                                <p className="text-red-500 text-xs mt-1">{errors.titulo}</p>
                            )}
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Descrição
                            </label>
                            <textarea
                                name="descricao"
                                value={formData.descricao}
                                onChange={handleChange}
                                rows="3"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="Detalhes da demanda"
                                disabled={loading}
                            ></textarea>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Horas Técnicas *
                            </label>
                            <input
                                type="number"
                                name="quantidade_horas_tecnicas"
                                value={formData.quantidade_horas_tecnicas}
                                onChange={handleChange}
                                min="0.5"
                                step="0.5"
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.quantidade_horas_tecnicas ? 'border-red-500' : 'border-gray-300'}`}
                                disabled={loading}
                            />
                            {errors.quantidade_horas_tecnicas && (
                                <p className="text-red-500 text-xs mt-1">{errors.quantidade_horas_tecnicas}</p>
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
                                <option value="pendente">Pendente</option>
                                <option value="em_andamento">Em Andamento</option>
                                <option value="em_aprovacao">Em Aprovação</option>
                                <option value="concluido">Concluído</option>
                                <option value="cancelado">Cancelado</option>
                            </select>
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
