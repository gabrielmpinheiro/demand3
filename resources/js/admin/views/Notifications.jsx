import { useEffect, useState } from "react";
import Table from "../components/Table";

export default function Notifications() {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        setNotifications([
            { id: 1, message: 'Nova demanda criada por Acme Corp', read: 'Não', created_at: '2023-10-12 10:00' },
            { id: 2, message: 'Pagamento confirmado Globex Inc', read: 'Sim', created_at: '2023-10-11 15:30' },
        ]);
    }, []);

    const columns = [
        { key: 'id', label: 'ID' },
        { key: 'message', label: 'Mensagem' },
        { key: 'read', label: 'Lida' },
        { key: 'created_at', label: 'Data' },
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-gray-800">Notificações</h1>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
                <Table
                    columns={columns}
                    data={notifications}
                    onDelete={null}
                    onEdit={(notif) => alert(`Mark read: ${notif.id}`)}
                />
            </div>
        </div>
    );
}
