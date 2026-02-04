import { useEffect, useState } from "react";
import axiosClient from "../axios-client";
import Table from "../components/Table";

export default function Users() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        getUsers();
    }, []);

    const getUsers = () => {
        setLoading(true);
        // Mock data for initial display since API might not be fully seeded
        /*
        axiosClient.get('/users')
          .then(({ data }) => {
            setUsers(data.data);
            setLoading(false);
          })
          .catch(() => {
            setLoading(false);
          });
        */
        // MOCK
        setUsers([
            { id: 1, name: 'Admin User', email: 'admin@admin.com', created_at: '2023-01-01', role: 'admin' },
            { id: 2, name: 'Support Staff', email: 'support@admin.com', created_at: '2023-01-02', role: 'support' }
        ]);
        setLoading(false);
    };

    const onDelete = (user) => {
        if (!window.confirm("Are you sure you want to delete this user?")) {
            return;
        }
        /*
        axiosClient.delete(`/users/${user.id}`)
          .then(() => {
            getUsers();
          })
        */
        alert('Delete functionality to be implemented with API');
    };

    const columns = [
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'Nome' },
        { key: 'email', label: 'Email' },
        { key: 'role', label: 'Função' },
        { key: 'created_at', label: 'Criado em' },
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-gray-800">Usuários</h1>
                <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition">
                    Novo Usuário
                </button>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
                <Table
                    columns={columns}
                    data={users}
                    onDelete={onDelete}
                    onEdit={(user) => alert(`Edit ${user.name}`)}
                />
            </div>
        </div>
    );
}
