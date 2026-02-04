import { useEffect, useState } from "react";
import Table from "../components/Table";

export default function Clients() {
    const [clients, setClients] = useState([]);

    useEffect(() => {
        // Mock clients
        setClients([
            { id: 1, name: 'Acme Corp', email: 'contact@acme.com', city: 'São Paulo', state: 'SP', status: 'Ativo' },
            { id: 2, name: 'Globex Inc', email: 'info@globex.com', city: 'Rio de Janeiro', state: 'RJ', status: 'Inativo' },
        ]);
    }, []);

    const columns = [
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'Nome' },
        { key: 'email', label: 'Email' },
        { key: 'city', label: 'Cidade' },
        { key: 'state', label: 'Estado' },
        {
            key: 'status',
            label: 'Status',
            render: (val) => (
                <span className={`px-2 py-1 rounded text-xs font-semibold ${val === 'Ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {val}
                </span>
            )
        },
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-gray-800">Clientes</h1>
                <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition">
                    Novo Cliente
                </button>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
                <Table
                    columns={columns}
                    data={clients}
                    onDelete={() => { }}
                    onEdit={() => { }}
                />
            </div>
        </div>
    );
}
