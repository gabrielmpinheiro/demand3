import { useState, useEffect } from "react";
import axiosClient from "../axios-client";
import DomainModal from "./DomainModal";

export default function DomainManagementModal({ isOpen, onClose, client, onUpdate }) {
    const [domains, setDomains] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDomain, setEditingDomain] = useState(null);
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });

    // Buscar domínios sempre que o modal abrir ou o cliente mudar
    useEffect(() => {
        if (isOpen && client?.id) {
            fetchDomains();
        }
    }, [isOpen, client?.id]);

    const showNotification = (message, type = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
    };

    const fetchDomains = async () => {
        setLoading(true);
        try {
            const { data } = await axiosClient.get(`/dominios?cliente_id=${client.id}`);
            setDomains(data.data || []);
        } catch (error) {
            console.error('Erro ao carregar domínios:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddDomain = () => {
        setEditingDomain(null);
        setIsModalOpen(true);
    };

    const handleEditDomain = (domain) => {
        setEditingDomain(domain);
        setIsModalOpen(true);
    };

    const handleDeleteDomain = async (domain) => {
        if (!window.confirm(`Tem certeza que deseja excluir o domínio "${domain.nome}"?`)) {
            return;
        }

        setLoading(true);
        try {
            await axiosClient.delete(`/dominios/${domain.id}`);
            setDomains(prev => prev.filter(d => d.id !== domain.id));
            showNotification('Domínio excluído com sucesso');
            if (onUpdate) onUpdate();
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Erro ao excluir domínio';
            showNotification(errorMsg, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveDomain = async (formData) => {
        try {
            if (editingDomain) {
                await axiosClient.put(`/dominios/${editingDomain.id}`, formData);
                showNotification('Domínio atualizado com sucesso');
            } else {
                await axiosClient.post('/dominios', formData);
                showNotification('Domínio criado com sucesso');
            }

            setIsModalOpen(false);
            await fetchDomains();
            if (onUpdate) onUpdate();
        } catch (error) {
            const errorMsg = error.response?.data?.errors
                ? Object.values(error.response.data.errors).flat().join(', ')
                : error.response?.data?.message || 'Erro ao salvar domínio';
            showNotification(errorMsg, 'error');
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            ativo: 'bg-green-100 text-green-800',
            inativo: 'bg-yellow-100 text-yellow-800',
            cancelado: 'bg-red-100 text-red-800',
        };
        return statusConfig[status] || 'bg-gray-100 text-gray-800';
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-green-600 text-white px-6 py-4 rounded-t-lg flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold">Gerenciar Domínios</h2>
                        <p className="text-sm text-green-100">{client?.nome}</p>
                    </div>
                    <button
                        onClick={handleAddDomain}
                        className="bg-white text-green-600 px-4 py-2 rounded-md hover:bg-green-50 transition font-semibold flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Novo Domínio
                    </button>
                </div>

                {/* Notification */}
                {notification.show && (
                    <div className={`mx-6 mt-4 p-3 rounded-md ${notification.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {notification.message}
                    </div>
                )}

                {/* Body */}
                <div className="p-6 flex-1 overflow-y-auto">
                    {loading && (
                        <div className="flex justify-center py-8">
                            <svg className="animate-spin h-8 w-8 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        </div>
                    )}

                    {!loading && domains.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                            </svg>
                            <p className="text-lg font-medium">Nenhum domínio cadastrado</p>
                            <p className="text-sm">Clique em "Novo Domínio" para adicionar.</p>
                        </div>
                    )}

                    {!loading && domains.length > 0 && (
                        <div className="space-y-3">
                            {domains.map((domain) => (
                                <div
                                    key={domain.id}
                                    className="border rounded-lg p-4 hover:shadow-md transition flex justify-between items-center"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3">
                                            <h4 className="font-semibold text-gray-800">{domain.nome}</h4>
                                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusBadge(domain.status)}`}>
                                                {domain.status}
                                            </span>
                                            {domain.assinatura && (
                                                <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                    Assinatura Ativa
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Criado em: {new Date(domain.created_at).toLocaleDateString('pt-BR')}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEditDomain(domain)}
                                            className="text-blue-600 hover:text-blue-800 p-2 rounded hover:bg-blue-50 transition"
                                            title="Editar"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => handleDeleteDomain(domain)}
                                            disabled={domain.assinatura}
                                            className={`p-2 rounded transition ${domain.assinatura
                                                ? 'text-gray-400 cursor-not-allowed'
                                                : 'text-red-600 hover:text-red-800 hover:bg-red-50'
                                                }`}
                                            title={domain.assinatura ? 'Não é possível excluir domínio com assinatura ativa' : 'Excluir'}
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t bg-gray-50">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition"
                    >
                        Fechar
                    </button>
                </div>
            </div>

            {/* Domain Modal */}
            <DomainModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveDomain}
                domain={editingDomain}
                clienteId={client?.id}
            />
        </div>
    );
}
