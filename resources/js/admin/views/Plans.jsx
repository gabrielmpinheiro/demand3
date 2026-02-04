import { useEffect, useState } from "react";
import Table from "../components/Table";

export default function Plans() {
    const [plans, setPlans] = useState([]);

    useEffect(() => {
        setPlans([
            { id: 1, name: 'Starter', price: 'R$ 0,00', hours: 0, status: 'Ativo' },
            { id: 2, name: 'Basic', price: 'R$ 150,00', hours: 2, status: 'Ativo' },
            { id: 3, name: 'Growth', price: 'R$ 400,00', hours: 6, status: 'Ativo' },
            { id: 4, name: 'Enterprise', price: 'R$ 800,00', hours: 10, status: 'Ativo' },
        ]);
    }, []);

    const columns = [
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'Nome' },
        { key: 'price', label: 'Preço' },
        { key: 'hours', label: 'Horas Técnicas' },
        { key: 'status', label: 'Status' },
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-gray-800">Planos</h1>
                <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition">
                    Novo Plano
                </button>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
                <Table
                    columns={columns}
                    data={plans}
                    onDelete={() => { }}
                    onEdit={() => { }}
                />
            </div>
        </div>
    );
}
