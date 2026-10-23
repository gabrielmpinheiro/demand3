import { useState, useEffect } from "react";
import axiosClient from "../axios-client";
import DomainModal from "./DomainModal";

export default function DomainManagementModal({ isOpen, onClose, client, onUpdate }) {
    const [domains, setDomains] = useState([]);
    const [plans, setPlans] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDomain, setEditingDomain] = useState(null);
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });

    // Estado do modal rápido de Atribuição de Plano
    const [isAssignPlanOpen, setIsAssignPlanOpen] = useState(false);
    const [targetDomain, setTargetDomain] = useState(null);
    const [selectedPlanId, setSelectedPlanId] = useState('');
    const [savingPlan, setSavingPlan] = useState(false);

    // Buscar domínios e planos sempre que o modal abrir ou o cliente mudar
    useEffect(() => {
        if (isOpen && client?.id) {
            fetchDomains();
            fetchPlans();
        }
    }, [isOpen, client?.id]);

    const showNotification = (message, type = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3500);
    };

    const fetchPlans = async () => {
        try {
            const { data } = await axiosClient.get('/planos?status=ativo&per_page=100');
            setPlans(data.data || []);
        } catch (error) {
            console.error('Erro ao carregar planos:', error);
        }
    };

    const fetchDomains = async () => {
        setLoading(true);
        try {
            const { data } = await axiosClient.get(`/dominios?cliente_id=${client.id}&per_page=100`);
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

    // Abre o modal de atribuição de plano para um domínio específico
    const handleOpenAssignPlan = (domain) => {
        setTargetDomain(domain);
        setSelectedPlanId(domain.assinatura?.plano_id || '');
        setIsAssignPlanOpen(true);
    };

    // Salva a atribuição de plano
    const handleSaveAssignPlan = async (e) => {
        e.preventDefault();
        if (!targetDomain) return;

        setSavingPlan(true);
        try {
            const response = await axiosClient.post(`/dominios/${targetDomain.id}/atribuir-plano`, {
                plano_id: selectedPlanId ? Number(selectedPlanId) : null,
            });

            showNotification(response.data.message || 'Plano atualizado com sucesso');
            setIsAssignPlanOpen(false);
            setTargetDomain(null);
            await fetchDomains();
            if (onUpdate) onUpdate();
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Erro ao atribuir plano';
            showNotification(errorMsg, 'error');
        } finally {
            setSavingPlan(false);
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
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white px-6 py-4 rounded-t-xl flex justify-between items-center shadow-sm">
                    <div>
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                            </svg>
                            Gerenciar Domínios e Planos
                        </h2>
                        <p className="text-sm text-green-100 mt-0.5">Cliente: <span className="font-semibold text-white">{client?.nome}</span></p>
                    </div>
                    <button
                        onClick={handleAddDomain}
                        className="bg-white text-green-700 px-4 py-2 rounded-lg hover:bg-green-50 transition font-semibold flex items-center gap-2 shadow-sm text-sm"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Novo Domínio
                    </button>
                </div>

                {/* Notification */}
                {notification.show && (
                    <div className={`mx-6 mt-4 p-3 rounded-lg text-sm font-medium ${notification.type === 'error' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-green-100 text-green-700 border border-green-200'}`}>
                        {notification.message}
                    </div>
                )}

                {/* Body */}
                <div className="p-6 flex-1 overflow-y-auto">
                    {loading && (
                        <div className="flex justify-center py-12">
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
                            <p className="text-lg font-medium text-gray-700">Nenhum domínio cadastrado</p>
                            <p className="text-sm mt-1">Clique em "Novo Domínio" acima para cadastrar um domínio e atribuir um plano a este cliente.</p>
                        </div>
                    )}

                    {!loading && domains.length > 0 && (
                        <div className="space-y-3">
                            {domains.map((domain) => {
                                const plano = domain.assinatura?.plano;

                                return (
                                    <div
                                        key={domain.id}
                                        className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition bg-white flex flex-col md:flex-row md:items-center justify-between gap-4"
                                    >
                                        <div className="flex-1 space-y-1.5">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h4 className="font-bold text-gray-900 text-base">{domain.nome}</h4>
                                                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getStatusBadge(domain.status)}`}>
                                                    {domain.status}
                                                </span>
                                            </div>

                                            {/* Badge do Plano Atribuído */}
                                            <div className="flex items-center gap-2 pt-1">
                                                {plano ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                                        <svg className="w-3.5 h-3.5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138z" />
                                                        </svg>
                                                        Plano: {plano.nome} (R$ {Number(plano.preco || 0).toFixed(2).replace('.', ',')}/mês • {plano.limite_horas_tecnicas}h)
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                                                        <svg className="w-3.5 h-3.5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                        </svg>
                                                        Sem plano atribuído
                                                    </span>
                                                )}

                                                {domain.assinatura && (
                                                    <span className="text-xs text-gray-500">
                                                        • Saldo: <strong className="text-gray-700">{parseFloat(domain.assinatura.horas_disponiveis || 0).toFixed(1)}h</strong>
                                                    </span>
                                                )}
                                            </div>

                                            <p className="text-xs text-gray-400">
                                                Cadastrado em: {new Date(domain.created_at).toLocaleDateString('pt-BR')}
                                            </p>
                                        </div>

                                        {/* Ações */}
                                        <div className="flex items-center gap-2 self-end md:self-center">
                                            {/* Botão Atribuir / Alterar Plano */}
                                            <button
                                                onClick={() => handleOpenAssignPlan(domain)}
                                                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition flex items-center gap-1.5"
                                                title="Atribuir ou alterar plano para este domínio"
                                            >
                                                <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                </svg>
                                                {plano ? 'Alterar Plano' : 'Atribuir Plano'}
                                            </button>

                                            {/* Editar Domínio */}
                                            <button
                                                onClick={() => handleEditDomain(domain)}
                                                className="p-1.5 text-blue-600 hover:text-blue-800 rounded-lg hover:bg-blue-50 transition border border-transparent hover:border-blue-100"
                                                title="Editar Domínio"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>

                                            {/* Excluir Domínio */}
                                            <button
                                                onClick={() => handleDeleteDomain(domain)}
                                                disabled={domain.assinatura && domain.assinatura.status === 'ativo'}
                                                className={`p-1.5 rounded-lg transition border border-transparent ${domain.assinatura && domain.assinatura.status === 'ativo'
                                                    ? 'text-gray-300 cursor-not-allowed'
                                                    : 'text-red-600 hover:text-red-800 hover:bg-red-50 hover:border-red-100'
                                                    }`}
                                                title={domain.assinatura && domain.assinatura.status === 'ativo' ? 'Desvincule o plano antes de excluir o domínio' : 'Excluir Domínio'}
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t bg-gray-50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                    >
                        Fechar
                    </button>
                </div>
            </div>

            {/* Modal de Criação / Edição de Domínio */}
            <DomainModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveDomain}
                domain={editingDomain}
                clienteId={client?.id}
                plans={plans}
            />

            {/* Modal Dedicado para Atribuir / Alterar Plano do Domínio */}
            {isAssignPlanOpen && targetDomain && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[65] p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-fadeIn">
                        <div className="bg-indigo-600 text-white px-6 py-4 flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-bold">Atribuir Plano ao Domínio</h3>
                                <p className="text-xs text-indigo-100">{targetDomain.nome}</p>
                            </div>
                            <button
                                onClick={() => setIsAssignPlanOpen(false)}
                                className="text-white hover:text-indigo-200 text-sm font-semibold"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSaveAssignPlan} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Selecione o Plano *
                                </label>
                                <select
                                    value={selectedPlanId}
                                    onChange={(e) => setSelectedPlanId(e.target.value)}
                                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-gray-800"
                                >
                                    <option value="">Nenhum plano (Remover/Desvincular plano)</option>
                                    {plans.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.nome} — R$ {Number(p.preco || 0).toFixed(2).replace('.', ',')}/mês ({p.limite_horas_tecnicas}h incluídas)
                                        </option>
                                    ))}
                                </select>
                                <p className="text-gray-500 text-xs mt-2 leading-relaxed">
                                    Ao atribuir o plano pelo painel administrativo, o cliente terá acesso imediato às horas técnicas contratadas e visualizará este plano no painel do cliente.
                                </p>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={() => setIsAssignPlanOpen(false)}
                                    disabled={savingPlan}
                                    className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={savingPlan}
                                    className="px-5 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium flex items-center gap-2 disabled:opacity-50"
                                >
                                    {savingPlan ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                            </svg>
                                            Salvando...
                                        </>
                                    ) : (
                                        'Salvar Atribuição'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
