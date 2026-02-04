import { useEffect, useState } from "react";
import Table from "../components/Table";

export default function Support() {
    const [tickets, setTickets] = useState([]);

    useEffect(() => {
        setTickets([
            { id: 1, subject: 'Dúvida sobre fatura', client: 'Acme Corp', status: 'Aberto', created_at: '2023-10-10' },
        ]);
    }, []);

    const columns = [
        { key: 'id', label: 'ID' },
        { key: 'subject', label: 'Assunto' },
        { key: 'client', label: 'Cliente' },
        { key: 'status', label: 'Status' },
        { key: 'created_at', label: 'Data' },
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-gray-800">Suporte</h1>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
                <Table
                    columns={columns}
                    data={tickets}
                    onDelete={() => { }}
                    onEdit={() => { }}
                />
            </div>
        </div>
    );
}
