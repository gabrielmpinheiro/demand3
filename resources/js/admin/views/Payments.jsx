import { useEffect, useState } from "react";
import Table from "../components/Table";

export default function Payments() {
    const [payments, setPayments] = useState([]);

    useEffect(() => {
        setPayments([
            { id: 501, client: 'Acme Corp', amount: 'R$ 400,00', date: '2023-10-05', status: 'Pago' },
            { id: 502, client: 'Globex Inc', amount: 'R$ 150,00', date: '2023-10-05', status: 'Pendente' },
        ]);
    }, []);

    const columns = [
        { key: 'id', label: 'ID' },
        { key: 'client', label: 'Cliente' },
        { key: 'amount', label: 'Valor' },
        { key: 'date', label: 'Data' },
        {
            key: 'status',
            label: 'Status',
            render: (val) => (
                <span className={`px-2 py-1 rounded text-xs font-semibold ${val === 'Pago' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {val}
                </span>
            )
        },
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-gray-800">Pagamentos</h1>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
                <Table
                    columns={columns}
                    data={payments}
                    onDelete={null} // Payments usually aren't deleted directly
                    onEdit={(payment) => alert(`View payment ${payment.id}`)}
                />
            </div>
        </div>
    );
}
