import { useEffect, useState } from "react";
import axiosClient from "../axios-client";
import Table from "../components/Table";
import SuporteModal from "../components/SuporteModal";
import DemandModal from "../components/DemandModal";
import TicketDemandasModal from "../components/TicketDemandasModal";

// Mini modal para exibir arquivos do chamado
function TicketArquivosModal({ isOpen, onClose, ticket }) {
    if (!isOpen || !ticket) return null;

    const arquivos = ticket.arquivos || [];

    const formatSize = (bytes) => {
        if (!bytes) return '';
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const getMimeIcon = (mime) => {
        if (!mime) return '📎';
        if (mime.includes('pdf')) return '📄';
        if (mime.includes('image')) return '🖼️';
        if (mime.includes('zip') || mime.includes('rar')) return '🗜️';
        if (mime.includes('word') || mime.includes('doc')) return '📝';
        if (mime.includes('sheet') || mime.includes('excel') || mime.includes('xls')) return '📊';
        return '📎';
    };

    const handleDownload = async (index, nomeOriginal) => {
        try {
            const response = await axiosClient.get(
                `/suportes/${ticket.id}/arquivos/${index}`,
                { responseType: 'blob' }
            );
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', nomeOriginal || `arquivo_${index}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            alert('Erro ao baixar o arquivo.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-bold text-gray-800">
                        Arquivos do Chamado #{ticket.id}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-4">
                    {arquivos.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                            <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p>Nenhum arquivo anexado</p>
                        </div>
                    ) : (
                        <ul className="space-y-2">
                            {arquivos.map((arquivo, index) => (
                                <li key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <span className="text-2xl flex-shrink-0">{getMimeIcon(arquivo.mime)}</span>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-gray-800 truncate" title={arquivo.nome_original}>
                                                {arquivo.nome_original}
                                            </p>
                                            <p className="text-xs text-gray-400">{formatSize(arquivo.tamanho)}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDownload(index, arquivo.nome_original)}
                                        className="ml-3 flex-shrink-0 p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition"
                                        title="Baixar arquivo"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                        </svg>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="p-4 border-t text-right">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function Support() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [demandModalOpen, setDemandModalOpen] = useState(false);
    const [ticketDemandasModalOpen, setTicketDemandasModalOpen] = useState(false);
    const [arquivosModalOpen, setArquivosModalOpen] = useState(false);
    const [currentTicket, setCurrentTicket] = useState(null);
    const [selectedTicketForDemands, setSelectedTicketForDemands] = useState(null);
    const [selectedTicketForFiles, setSelectedTicketForFiles] = useState(null);
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
    };

    const handleViewDemands = (ticket) => {
        setSelectedTicketForDemands(ticket);
        setTicketDemandasModalOpen(true);
    };

    const handleViewFiles = (ticket) => {
        setSelectedTicketForFiles(ticket);
        setArquivosModalOpen(true);
    };

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
        fetchTickets();
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
            key: 'demandas_count',
            label: 'Demandas',
            render: (val, row) => (
                <button
                    onClick={() => handleViewDemands(row)}
                    className={`px-2 py-1 rounded text-xs font-semibold transition hover:opacity-80 ${val > 0
                        ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                    title="Ver demandas deste chamado"
                >
                    {val || 0} demanda{val !== 1 ? 's' : ''}
                </button>
            )
        },
        {
            key: 'arquivos',
            label: 'Arquivos',
            render: (val, row) => {
                const count = Array.isArray(val) ? val.length : 0;
                return (
                    <button
                        onClick={() => handleViewFiles(row)}
                        className={`px-2 py-1 rounded text-xs font-semibold transition hover:opacity-80 ${count > 0
                            ? 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                            }`}
                        title={count > 0 ? 'Ver arquivos anexados' : 'Sem arquivos'}
                    >
                        {count > 0 ? `${count} arquivo${count !== 1 ? 's' : ''}` : 'Sem arquivos'}
                    </button>
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
                dominioId={currentTicket?.dominio_id}
            />

            <TicketDemandasModal
                isOpen={ticketDemandasModalOpen}
                onClose={() => setTicketDemandasModalOpen(false)}
                ticket={selectedTicketForDemands}
            />

            <TicketArquivosModal
                isOpen={arquivosModalOpen}
                onClose={() => setArquivosModalOpen(false)}
                ticket={selectedTicketForFiles}
            />
        </div>
    );
}
