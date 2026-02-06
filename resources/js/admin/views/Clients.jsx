import { useEffect, useState } from "react";
import axiosClient, { initCsrf } from "../axios-client";
import Table from "../components/Table";
import ClientModal from "../components/ClientModal";
import DomainManagementModal from "../components/DomainManagementModal";

export default function Clients() {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState(null);
    const [isDomainModalOpen, setIsDomainModalOpen] = useState(false);
    const [selectedClientForDomains, setSelectedClientForDomains] = useState(null);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });

    const showNotification = (message, type = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
    };

    const fetchClients = async () => {
        setLoading(true);
        try {
            const { data } = await axiosClient.get('/clientes');
            setClients(data.data || []);
        } catch (error) {
            console.error('Erro ao carregar clientes:', error);
            showNotification('Erro ao carregar clientes', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Inicializar CSRF e carregar clientes
        initCsrf().then(() => fetchClients());
    }, []);

    const handleAdd = () => {
        setEditingClient(null);
        setIsModalOpen(true);
    };

    const handleEdit = (client) => {
        setEditingClient(client);
        setIsModalOpen(true);
    };

    const handleDelete = async (client) => {
        if (!window.confirm(`Tem certeza que deseja excluir o cliente "${client.nome}"?`)) {
            return;
        }

        try {
            await axiosClient.delete(`/clientes/${client.id}`);
            setClients(prev => prev.filter(c => c.id !== client.id));
            showNotification('Cliente excluído com sucesso');
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Erro ao excluir cliente';
            showNotification(errorMsg, 'error');
        }
    };

    const handleSave = async (formData) => {
        try {
            if (editingClient) {
                await axiosClient.put(`/clientes/${editingClient.id}`, formData);
                showNotification('Cliente atualizado com sucesso');
            } else {
                await axiosClient.post('/clientes', formData);
                showNotification('Cliente criado com sucesso');
            }

            setIsModalOpen(false);
            await fetchClients();
        } catch (error) {
            const errorMsg = error.response?.data?.errors
                ? Object.values(error.response.data.errors).flat().join(', ')
                : error.response?.data?.message || 'Erro ao salvar cliente';
            showNotification(errorMsg, 'error');
        }
    };

    const handleManageDomains = (client) => {
        setSelectedClientForDomains(client);
        setIsDomainModalOpen(true);
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            ativo: 'bg-green-100 text-green-800',
            inativo: 'bg-yellow-100 text-yellow-800',
            cancelado: 'bg-red-100 text-red-800',
        };
        return statusConfig[status] || 'bg-gray-100 text-gray-800';
    };

    const columns = [
        { key: 'id', label: 'ID' },
        { key: 'nome', label: 'Nome' },
        { key: 'email', label: 'Email' },
        { key: 'cidade', label: 'Cidade' },
        { key: 'estado', label: 'Estado' },
        {
            key: 'status',
            label: 'Status',
            render: (val) => (
                <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusBadge(val)}`}>
                    {val || 'ativo'}
                </span>
            )
        },
        {
            key: 'dominios',
            label: 'Domínios',
            render: (_, client) => (
                <button
                    onClick={() => handleManageDomains(client)}
                    className="text-blue-600 hover:text-blue-800 hover:underline font-medium flex items-center gap-1"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                    Gerenciar ({client.dominios?.length || 0})
                </button>
            )
        },
    ];

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <h1 className="text-2xl font-bold text-gray-800">Clientes</h1>
                <button
                    onClick={handleAdd}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Novo Cliente
                </button>
            </div>

            {/* Notification */}
            {notification.show && (
                <div className={`mb-4 p-3 rounded-md ${notification.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {notification.message}
                </div>
            )}

            {/* Table */}
            <div className="bg-white p-4 rounded-lg shadow">
                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <svg className="animate-spin h-8 w-8 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                ) : clients.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <p className="text-lg font-medium">Nenhum cliente cadastrado</p>
                        <p className="text-sm">Clique em "Novo Cliente" para adicionar.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <Table
                            columns={columns}
                            data={clients}
                            onDelete={handleDelete}
                            onEdit={handleEdit}
                        />
                    </div>
                )}
            </div>

            {/* Client Modal */}
            <ClientModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                client={editingClient}
            />

            {/* Domain Management Modal */}
            <DomainManagementModal
                isOpen={isDomainModalOpen}
                onClose={() => {
                    setIsDomainModalOpen(false);
                    setSelectedClientForDomains(null);
                }}
                client={selectedClientForDomains}
                onUpdate={fetchClients}
            />
        </div>
    );
}
