import { useEffect, useState } from "react";
import axiosClient from "../axios-client";

const TABS = ['Dados', 'Parceria'];

export default function ClientModal({ isOpen, onClose, onSave, client }) {
    const [activeTab, setActiveTab] = useState('Dados');
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
        is_parceiro: false,
        parceria_inicio: '',
        parceria_fim: '',
        valor_hora_avulsa: '',
        valor_hora_subsidiada: '',
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [parceriaStats, setParceriaStats] = useState(null);
    const [loadingStats, setLoadingStats] = useState(false);

    useEffect(() => {
        if (client) {
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
                is_parceiro: client.is_parceiro || false,
                parceria_inicio: client.parceria_inicio ? client.parceria_inicio.substring(0, 10) : '',
                parceria_fim: client.parceria_fim ? client.parceria_fim.substring(0, 10) : '',
                valor_hora_avulsa: client.valor_hora_avulsa || '',
                valor_hora_subsidiada: client.valor_hora_subsidiada || '',
            });

            if (client.is_parceiro) {
                fetchStats(client.id);
            }
        } else {
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
                is_parceiro: false,
                parceria_inicio: '',
                parceria_fim: '',
                valor_hora_avulsa: '',
                valor_hora_subsidiada: '',
            });
            setParceriaStats(null);
        }
        setErrors({});
        setActiveTab('Dados');
    }, [client, isOpen]);

    const fetchStats = (clientId) => {
        setLoadingStats(true);
        axiosClient.get(`/clientes/${clientId}/parceria-stats`)
            .then(({ data }) => setParceriaStats(data.data))
            .catch(() => setParceriaStats(null))
            .finally(() => setLoadingStats(false));
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : value;
        setFormData(prev => ({ ...prev, [name]: newValue }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.nome.trim()) newErrors.nome = 'Nome é obrigatório';
        if (!formData.email.trim()) newErrors.email = 'Email é obrigatório';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email inválido';
        if (formData.estado && formData.estado.length !== 2) newErrors.estado = 'Estado deve ter 2 caracteres (ex: SP)';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);
        await onSave(formData);
        setLoading(false);
    };

    if (!isOpen) return null;

    const showParceriaTab = !!client; // Only show in edit mode

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-green-600 text-white px-6 py-4 rounded-t-lg">
                    <h2 className="text-xl font-bold">
                        {client ? 'Editar Cliente' : 'Novo Cliente'}
                    </h2>
                </div>

                {/* Tabs (only in edit mode) */}
                {showParceriaTab && (
                    <div className="flex border-b border-gray-200 px-6">
                        {TABS.map(tab => (
                            <button
                                key={tab}
                                type="button"
                                onClick={() => setActiveTab(tab)}
                                className={`py-3 px-4 text-sm font-medium border-b-2 transition ${
                                    activeTab === tab
                                        ? 'border-green-600 text-green-700'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                {tab}
                                {tab === 'Parceria' && client?.is_parceiro && (
                                    <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        Ativo
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                )}

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* ── TAB: DADOS ── */}
                    {activeTab === 'Dados' && (
                        <>
                            {/* Informações Básicas */}
                            <div className="border-b pb-4 mb-4">
                                <h3 className="text-lg font-semibold text-gray-700 mb-3">Informações Básicas</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                                        <input type="text" name="nome" value={formData.nome} onChange={handleChange}
                                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.nome ? 'border-red-500' : 'border-gray-300'}`}
                                            placeholder="Nome do cliente ou empresa" />
                                        {errors.nome && <p className="text-red-500 text-xs mt-1">{errors.nome}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                                        <input type="email" name="email" value={formData.email} onChange={handleChange}
                                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                                            placeholder="email@exemplo.com" />
                                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                                        <input type="text" name="telefone" value={formData.telefone} onChange={handleChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                            placeholder="(00) 00000-0000" />
                                    </div>
                                </div>
                            </div>

                            {/* Documentos */}
                            <div className="border-b pb-4 mb-4">
                                <h3 className="text-lg font-semibold text-gray-700 mb-3">Documentos</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">CNPJ</label>
                                        <input type="text" name="cnpj" value={formData.cnpj} onChange={handleChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="00.000.000/0000-00" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
                                        <input type="text" name="cpf" value={formData.cpf} onChange={handleChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="000.000.000-00" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Inscrição Estadual</label>
                                        <input type="text" name="inscricao_estadual" value={formData.inscricao_estadual} onChange={handleChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Inscrição Municipal</label>
                                        <input type="text" name="inscricao_municipal" value={formData.inscricao_municipal} onChange={handleChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" />
                                    </div>
                                </div>
                            </div>

                            {/* Endereço */}
                            <div className="border-b pb-4 mb-4">
                                <h3 className="text-lg font-semibold text-gray-700 mb-3">Endereço</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
                                        <input type="text" name="endereco" value={formData.endereco} onChange={handleChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Rua, número, complemento" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                                        <input type="text" name="cidade" value={formData.cidade} onChange={handleChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                                        <input type="text" name="estado" value={formData.estado} onChange={handleChange} maxLength={2}
                                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.estado ? 'border-red-500' : 'border-gray-300'}`}
                                            placeholder="SP" />
                                        {errors.estado && <p className="text-red-500 text-xs mt-1">{errors.estado}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">CEP</label>
                                        <input type="text" name="cep" value={formData.cep} onChange={handleChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="00000-000" />
                                    </div>
                                </div>
                            </div>

                            {/* Status */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select name="status" value={formData.status} onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
                                    <option value="ativo">Ativo</option>
                                    <option value="inativo">Inativo</option>
                                    <option value="cancelado">Cancelado</option>
                                </select>
                            </div>
                        </>
                    )}

                    {/* ── TAB: PARCERIA ── */}
                    {activeTab === 'Parceria' && showParceriaTab && (
                        <div className="space-y-6">
                            {/* Toggle parceiro */}
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <div>
                                    <p className="font-semibold text-gray-800">Status de Parceiro</p>
                                    <p className="text-sm text-gray-500">Habilite para configurar este cliente como parceiro</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" name="is_parceiro" checked={formData.is_parceiro} onChange={handleChange} className="sr-only peer" />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                </label>
                            </div>

                            {/* Parceria fields (only if is_parceiro) */}
                            {formData.is_parceiro && (
                                <>
                                    {/* Vigência */}
                                    <div className="border-b pb-4">
                                        <h3 className="text-base font-semibold text-gray-700 mb-3">Vigência da Parceria</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Data de Início</label>
                                                <input type="date" name="parceria_inicio" value={formData.parceria_inicio} onChange={handleChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Data de Fim</label>
                                                <input type="date" name="parceria_fim" value={formData.parceria_fim} onChange={handleChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Valores */}
                                    <div className="border-b pb-4">
                                        <h3 className="text-base font-semibold text-gray-700 mb-3">Valores da Hora Técnica</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Hora Técnica Avulsa (R$)
                                                </label>
                                                <input type="number" name="valor_hora_avulsa" value={formData.valor_hora_avulsa} onChange={handleChange}
                                                    step="0.01" min="0"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                                    placeholder="0,00" />
                                                <p className="text-xs text-gray-400 mt-1">Valor cobrado por hora técnica avulsa</p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Hora Técnica Subsidiada (R$)
                                                </label>
                                                <input type="number" name="valor_hora_subsidiada" value={formData.valor_hora_subsidiada} onChange={handleChange}
                                                    step="0.01" min="0"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                                    placeholder="0,00" />
                                                <p className="text-xs text-gray-400 mt-1">Valor para domínios vinculados a um plano</p>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Métricas */}
                            {client?.is_parceiro && (
                                <div>
                                    <h3 className="text-base font-semibold text-gray-700 mb-3">Resumo de Atividades</h3>
                                    {loadingStats ? (
                                        <div className="flex justify-center py-6">
                                            <svg className="animate-spin h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                            </svg>
                                        </div>
                                    ) : parceriaStats ? (
                                        <div className="grid grid-cols-2 gap-3">
                                            {[
                                                { label: 'Chamados Gerados', value: parceriaStats.chamados_gerados, color: 'blue' },
                                                { label: 'Chamados Concluídos', value: parceriaStats.chamados_concluidos, color: 'green' },
                                                { label: 'Demandas Geradas', value: parceriaStats.demandas_geradas, color: 'purple' },
                                                { label: 'Demandas Concluídas', value: parceriaStats.demandas_concluidas, color: 'teal' },
                                            ].map(({ label, value, color }) => (
                                                <div key={label} className={`p-4 rounded-lg bg-${color}-50 border border-${color}-100`}>
                                                    <p className={`text-2xl font-bold text-${color}-700`}>{value ?? 0}</p>
                                                    <p className={`text-xs text-${color}-600 mt-1`}>{label}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500 text-center py-4">Não foi possível carregar as métricas.</p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Footer */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button type="button" onClick={onClose} disabled={loading}
                            className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition disabled:opacity-50">
                            Cancelar
                        </button>
                        <button type="submit" disabled={loading}
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition disabled:opacity-50 flex items-center gap-2">
                            {loading && (
                                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
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
