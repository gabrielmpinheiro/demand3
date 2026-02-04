import { useEffect, useState } from "react";
import Table from "../components/Table";

export default function Subscriptions() {
    const [subscriptions, setSubscriptions] = useState([]);

    useEffect(() => {
        // Mock data
        setSubscriptions([
            { id: 1, client: 'Acme Corp', plan: 'Growth', domain: 'acme.com', status: 'Ativo', start_date: '2023-01-01' },
            { id: 2, client: 'Globex Inc', plan: 'Basic', domain: 'globex.com', status: 'Cancelado', start_date: '2022-05-15' },
        ]);
    }, []);

    const columns = [
        { key: 'id', label: 'ID' },
        { key: 'client', label: 'Cliente' },
        { key: 'plan', label: 'Plano' },
        { key: 'domain', label: 'Domínio' },
        {
            key: 'status',
            label: 'Status',
            render: (val) => (
                <span className={`px-2 py-1 rounded text-xs font-semibold ${val === 'Ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {val}
                </span>
            )
        },
        { key: 'start_date', label: 'Início' },
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-gray-800">Assinaturas</h1>
                <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition">
                    Nova Assinatura
                </button>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
                <Table
                    columns={columns}
                    data={subscriptions}
                    onDelete={() => { }}
                    onEdit={() => { }}
                />
            </div>
        </div>
    );
}
