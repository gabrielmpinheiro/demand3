import { useEffect, useState } from "react";
import Table from "../components/Table";

export default function Vault() {
    const [items, setItems] = useState([]);

    useEffect(() => {
        setItems([
            { id: 1, service: 'Cpanel', client: 'Acme Corp', login: 'admin_acme', updated_at: '2023-09-15' },
            { id: 2, service: 'WordPress Admin', client: 'Acme Corp', login: 'admin', updated_at: '2023-09-15' },
        ]);
    }, []);

    const columns = [
        { key: 'id', label: 'ID' },
        { key: 'service', label: 'Serviço' },
        { key: 'client', label: 'Cliente' },
        { key: 'login', label: 'Login' },
        { key: 'updated_at', label: 'Atualizado em' },
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-gray-800">Vault (Senhas)</h1>
                <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition">
                    Novo Item
                </button>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
                <Table
                    columns={columns}
                    data={items}
                    onDelete={() => { }}
                    onEdit={() => { }}
                />
            </div>
        </div>
    );
}
