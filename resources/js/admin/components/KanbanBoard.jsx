import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import axiosClient from "../axios-client";
import DemandModal from './DemandModal';

const COLUMNS = {
    pendente: { title: 'Aberto', color: 'bg-red-100 text-red-800' },
    em_andamento: { title: 'Em Andamento', color: 'bg-yellow-100 text-yellow-800' },
    em_aprovacao: { title: 'Em Aprovação', color: 'bg-orange-100 text-orange-800' },
    concluido: { title: 'Concluído', color: 'bg-green-100 text-green-800' }
};

export default function KanbanBoard() {
    const [columns, setColumns] = useState({
        pendente: [],
        em_andamento: [],
        em_aprovacao: [],
        concluido: []
    });
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [currentDemand, setCurrentDemand] = useState(null);

    useEffect(() => {
        fetchDemands();
    }, []);

    const fetchDemands = async () => {
        setLoading(true);
        try {
            const { data } = await axiosClient.get('/demandas?per_page=100'); // Fetch enough to fill board
            organizeDemands(data.data);
        } catch (error) {
            console.error("Erro ao buscar demandas:", error);
        } finally {
            setLoading(false);
        }
    };

    const organizeDemands = (demandsList) => {
        const newColumns = {
            pendente: [],
            em_andamento: [],
            em_aprovacao: [],
            concluido: []
        };

        demandsList.forEach(demand => {
            if (newColumns[demand.status]) {
                newColumns[demand.status].push(demand);
            }
        });

        setColumns(newColumns);
    };

    const onDragEnd = async (result) => {
        const { source, destination, draggableId } = result;

        if (!destination) return;

        if (
            source.droppableId === destination.droppableId &&
            source.index === destination.index
        ) {
            return;
        }

        // Update local state immediately for UI responsiveness
        const sourceCol = [...columns[source.droppableId]];
        const destCol = [...columns[destination.droppableId]];
        const [movedDemand] = sourceCol.splice(source.index, 1);

        // Optimistic update of status
        const updatedDemand = { ...movedDemand, status: destination.droppableId };
        destCol.splice(destination.index, 0, updatedDemand);

        setColumns({
            ...columns,
            [source.droppableId]: sourceCol,
            [destination.droppableId]: destCol
        });

        // Call API to persist change
        try {
            let endpoint = `/demandas/${draggableId}`;
            let payload = { status: destination.droppableId };

            // Use specific endpoints if available/preferred, or update for generic status change
            // For 'concluido', we might want to check logic, but generic update handles it on backend?
            // Actually, backend has specific endpoints aprovar/concluir but update also works.
            // Let's use update for drag and drop generic move.

            await axiosClient.put(endpoint, payload);

            // If moved to concluido, backend logic might auto-complete support.
            // We might want to refresh to get any side effects or just rely on local state.

        } catch (error) {
            console.error("Erro ao atualizar status:", error);
            alert("Erro ao atualizar status da demanda.");
            fetchDemands(); // Revert on error
        }
    };

    const handleEdit = (demand) => {
        setCurrentDemand(demand);
        setModalOpen(true);
    };

    const handleCreate = () => {
        setCurrentDemand(null);
        setModalOpen(true);
    };

    const handleSave = async (formData) => {
        try {
            if (currentDemand) {
                await axiosClient.put(`/demandas/${currentDemand.id}`, formData);
            } else {
                await axiosClient.post('/demandas', formData);
            }
            fetchDemands();
        } catch (error) {
            console.error("Erro ao salvar:", error);
            throw error; // Let modal handle error display
        }
    };

    if (loading) return <div className="p-4 text-center">Carregando quadro...</div>;

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-4 px-2">
                <h1 className="text-2xl font-bold text-gray-800">Quadro de Demandas</h1>
                <button
                    onClick={handleCreate}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                >
                    Nova Demanda
                </button>
            </div>

            <div className="flex-1 overflow-x-auto">
                <DragDropContext onDragEnd={onDragEnd}>
                    <div className="flex h-full min-w-[1000px] gap-4 p-2">
                        {Object.entries(COLUMNS).map(([columnId, column]) => (
                            <div key={columnId} className="flex-1 min-w-[250px] bg-gray-100 rounded-lg flex flex-col max-h-[calc(100vh-200px)]">
                                <div className={`p-3 font-semibold text-sm uppercase tracking-wide border-b border-gray-200 rounded-t-lg ${column.color.split(' ')[0]}`}>
                                    {column.title}
                                    <span className="ml-2 bg-white bg-opacity-50 px-2 py-0.5 rounded-full text-xs">
                                        {columns[columnId].length}
                                    </span>
                                </div>

                                <Droppable droppableId={columnId}>
                                    {(provided, snapshot) => (
                                        <div
                                            {...provided.droppableProps}
                                            ref={provided.innerRef}
                                            className={`p-2 flex-1 overflow-y-auto transition-colors ${snapshot.isDraggingOver ? 'bg-gray-200' : ''}`}
                                        >
                                            {columns[columnId].map((demand, index) => (
                                                <Draggable key={demand.id.toString()} draggableId={demand.id.toString()} index={index}>
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            className={`bg-white p-3 rounded shadow-sm mb-3 border border-gray-200 hover:shadow-md transition cursor-grab active:cursor-grabbing ${snapshot.isDragging ? 'rotate-2 shadow-lg ring-2 ring-green-400' : ''}`}
                                                            onClick={() => handleEdit(demand)}
                                                        >
                                                            <div className="flex justify-between items-start mb-2">
                                                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${column.color}`}>
                                                                    {demand.dominio?.cliente?.nome || 'N/A'}
                                                                </span>
                                                                <span className="text-xs text-gray-400">#{demand.id}</span>
                                                            </div>
                                                            <h4 className="font-medium text-gray-800 mb-1 line-clamp-2">{demand.titulo}</h4>

                                                            <div className="flex justify-between items-center mt-3 text-xs text-gray-500">
                                                                <span>{demand.dominio?.nome}</span>
                                                                <span className="flex items-center gap-1 font-semibold">
                                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                                                    {Number(demand.quantidade_horas_tecnicas).toFixed(1)}h
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </div>
                        ))}
                    </div>
                </DragDropContext>
            </div>

            <DemandModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSave={handleSave}
                demand={currentDemand}
            />
        </div>
    );
}
