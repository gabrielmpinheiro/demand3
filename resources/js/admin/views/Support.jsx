import { useEffect, useState } from "react";
import axiosClient from "../axios-client";
import Table from "../components/Table";
import SuporteModal from "../components/SuporteModal";
import DemandModal from "../components/DemandModal";
import { Link } from "react-router-dom";

export default function Support() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [demandModalOpen, setDemandModalOpen] = useState(false);
    const [currentTicket, setCurrentTicket] = useState(null);
    const [pagination, setPagination] = useState({});

    const fetchTickets = (page = 1) => {
        setLoading(true);
        axiosClient.get(`/suportes?page=${page}`)
            .then(({ data }) => {
                setLoading(false);
                setTickets(data.data);
                setPagination(data.meta || {});
            })
            .catch(() => {
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    const handleDelete = (ticket) => {
        if (!window.confirm("Tem certeza que deseja excluir este suporte?")) {
            return;
        }

        axiosClient.delete(`/suportes/${ticket.id}`)
            .then(() => {
                fetchTickets();
            })
            .catch(err => {
                const message = err.response?.data?.message || "Erro ao excluir suporte.";
                alert(message);
            });
    };

    const handleEdit = (ticket) => {
        setCurrentTicket(ticket);
        setModalOpen(true);
    };

    const handleCreate = () => {
        setCurrentTicket(null);
        setModalOpen(true);
    };

    const handleGenerateDemand = (ticket) => {
        setCurrentTicket(ticket);
        setDemandModalOpen(true);
    }

    const handleSave = async (formData) => {
        if (currentTicket) {
            await axiosClient.put(`/suportes/${currentTicket.id}`, formData);
        } else {
            await axiosClient.post('/suportes', formData);
        }
        fetchTickets();
    };

    const handleSaveDemand = async (formData) => {
        await axiosClient.post('/demandas', formData);
        fetchTickets(); // Atualiza para mostrar a nova demanda vinculada
    };

    const columns = [
        { key: 'id', label: 'ID' },
        {
            key: 'cliente',
            label: 'Cliente',
            render: (val) => val?.nome || 'N/A'
        },
        { key: 'mensagem', label: 'Mensagem' },
        {
            key: 'status',
            label: 'Status',
            render: (val) => {
                let color = 'bg-gray-100 text-gray-800';
                if (val === 'aberto') color = 'bg-red-100 text-red-800';
                if (val === 'em_andamento') color = 'bg-yellow-100 text-yellow-800';
                if (val === 'concluido') color = 'bg-green-100 text-green-800';
                if (val === 'cancelado') color = 'bg-gray-300 text-gray-800';
                const label = val.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
                return (
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${color}`}>
                        {label}
                    </span>
                )
            }
        },
        {
            key: 'demandas',
            label: 'Demandas',
            render: (val, row) => {
                if (!val || val.length === 0) return (
                    <span className="text-gray-400 text-xs">Nenhuma</span>
                );
                return (
                    <div className="flex gap-1 flex-wrap">
                        {val.map(d => (
                            <span key={d.id} title={d.status} className="px-1.5 py-0.5 rounded text-xs bg-gray-100 border border-gray-300">
                                #{d.id}
                            </span>
                        ))}
                    </div>
                );
            }
        },
        { key: 'created_at', label: 'Data', render: (val) => new Date(val).toLocaleDateString('pt-BR') },
        {
            key: 'actions',
            label: 'Ações Extras',
            render: (val, row) => (
                <button
                    onClick={() => handleGenerateDemand(row)}
                    className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 px-2 py-1 rounded border border-blue-200 transition"
                >
                    Gerar Demanda
                </button>
            )
        }
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-gray-800">Suporte</h1>
                <button
                    onClick={handleCreate}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                >
                    Novo Suporte
                </button>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
                {loading && <div className="text-center py-4">Carregando...</div>}

                {!loading && (
                    <Table
                        columns={columns}
                        data={tickets}
                        onDelete={handleDelete}
                        onEdit={handleEdit}
                    />
                )}
            </div>

            <SuporteModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSave={handleSave}
                suporte={currentTicket}
            />

            <DemandModal
                isOpen={demandModalOpen}
                onClose={() => setDemandModalOpen(false)}
                onSave={handleSaveDemand}
                suporteId={currentTicket?.id}
                clienteId={currentTicket?.cliente_id}
            />
        </div>
    );
}
