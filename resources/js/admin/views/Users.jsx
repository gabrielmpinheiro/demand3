import { useEffect, useState } from "react";
import axiosClient from "../axios-client";
import Table from "../components/Table";
import UserModal from "../components/UserModal";

export default function Users() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        getUsers();
    }, []);

    const getUsers = () => {
        setLoading(true);
        axiosClient.get('/users')
            .then(({ data }) => {
                setUsers(data.data);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Erro ao carregar usuários:', error);
                showNotification('Erro ao carregar usuários', 'error');
                setLoading(false);
            });
    };

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 4000);
    };

    const handleOpenModal = (user = null) => {
        setEditingUser(user);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setEditingUser(null);
    };

    const handleSave = async (formData) => {
        try {
            if (editingUser) {
                // Editar usuário existente
                await axiosClient.put(`/users/${editingUser.id}`, formData);
                showNotification('Usuário atualizado com sucesso!');
            } else {
                // Criar novo usuário
                await axiosClient.post('/users', formData);
                showNotification('Usuário criado com sucesso!');
            }
            handleCloseModal();
            getUsers();
        } catch (error) {
            console.error('Erro ao salvar usuário:', error);

            // Extrair mensagem de erro da validação
            let errorMessage = 'Erro ao salvar usuário';
            if (error.response?.data?.errors) {
                const errors = Object.values(error.response.data.errors).flat();
                errorMessage = errors.join(', ');
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }

            showNotification(errorMessage, 'error');
            throw error; // Para manter o loading no modal
        }
    };

    const onDelete = (user) => {
        if (!window.confirm(`Tem certeza que deseja excluir o usuário "${user.name}"?`)) {
            return;
        }

        axiosClient.delete(`/users/${user.id}`)
            .then(() => {
                showNotification('Usuário excluído com sucesso!');
                getUsers();
            })
            .catch((error) => {
                console.error('Erro ao excluir usuário:', error);
                showNotification('Erro ao excluir usuário', 'error');
            });
    };

    const columns = [
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'Nome' },
        { key: 'email', label: 'Email' },
        {
            key: 'role',
            label: 'Função',
            render: (val) => (
                <span className={`px-2 py-1 rounded text-xs font-semibold ${val === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                    {val === 'admin' ? 'Admin' : 'Usuário'}
                </span>
            )
        },
        {
            key: 'status',
            label: 'Status',
            render: (val) => (
                <span className={`px-2 py-1 rounded text-xs font-semibold ${val === 'ativo' ? 'bg-green-100 text-green-800' :
                        val === 'inativo' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                    }`}>
                    {val.charAt(0).toUpperCase() + val.slice(1)}
                </span>
            )
        },
        {
            key: 'created_at',
            label: 'Criado em',
            render: (val) => new Date(val).toLocaleDateString('pt-BR')
        },
    ];

    return (
        <div>
            {/* Notificação */}
            {notification && (
                <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white animate-slide-in-right ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'
                    }`}>
                    {notification.message}
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                <h1 className="text-2xl font-bold text-gray-800">Usuários</h1>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition w-full sm:w-auto"
                >
                    Novo Usuário
                </button>
            </div>

            {/* Tabela */}
            <div className="bg-white p-4 rounded-lg shadow">
                {loading ? (
                    <div className="flex justify-center items-center py-8">
                        <svg className="animate-spin h-8 w-8 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                ) : (
                    <Table
                        columns={columns}
                        data={users}
                        onDelete={onDelete}
                        onEdit={handleOpenModal}
                    />
                )}
            </div>

            {/* Modal */}
            <UserModal
                isOpen={modalOpen}
                onClose={handleCloseModal}
                onSave={handleSave}
                user={editingUser}
            />
        </div>
    );
}

