import { useEffect, useState } from "react";
import Table from "../components/Table";

export default function Demands() {
    const [demands, setDemands] = useState([]);

    useEffect(() => {
        // Mock demands
        setDemands([
            { id: 101, title: 'Erro no login', client: 'Acme Corp', status: 'Aberto', created_at: '2023-10-01' },
            { id: 102, title: 'Atualizar banner', client: 'Globex Inc', status: 'Em andamento', created_at: '2023-10-02' },
            { id: 103, title: 'Backup mensal', client: 'Acme Corp', status: 'Concluído', created_at: '2023-09-30' },
        ]);
    }, []);

    const columns = [
        { key: 'id', label: 'ID' },
        { key: 'title', label: 'Título' },
        { key: 'client', label: 'Cliente' },
        {
            key: 'status',
            label: 'Status',
            render: (val) => {
                let color = 'bg-gray-100 text-gray-800';
                if (val === 'Aberto') color = 'bg-red-100 text-red-800';
                if (val === 'Em andamento') color = 'bg-yellow-100 text-yellow-800';
                if (val === 'Concluído') color = 'bg-green-100 text-green-800';
                return (
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${color}`}>
                        {val}
                    </span>
                )
            }
        },
        { key: 'created_at', label: 'Data Criação' },
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-gray-800">Demandas</h1>
                {/* Filter buttons could go here */}
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
                <Table
                    columns={columns}
                    data={demands}
                    onDelete={() => { }}
                    onEdit={() => { }}
                />
            </div>
        </div>
    );
}
