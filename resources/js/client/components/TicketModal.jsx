import { useState } from "react";
import axiosClient from "../axios-client";
import { useStateContext } from "../contexts/ContextProvider";

export default function TicketModal({ isOpen, onClose, onSuccess, domains }) {
    const { theme } = useStateContext();
    const [newMsg, setNewMsg] = useState('');
    const [newDomain, setNewDomain] = useState('');
    const [saving, setSaving] = useState(false);
    const isDark = theme.mode === 'dark';

    if (!isOpen) return null;

    const handleSubmit = (ev) => {
        ev.preventDefault();
        setSaving(true);
        axiosClient.post('/suportes', { mensagem: newMsg, dominio_id: newDomain || null })
            .then(() => {
                setNewMsg('');
                setNewDomain('');
                onSuccess();
                onClose();
            })
            .catch(err => alert(err.response?.data?.message || 'Erro ao criar chamado'))
            .finally(() => setSaving(false));
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-xl max-w-lg w-full p-6`}>
                <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>Novo Chamado</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <select
                        value={newDomain}
                        onChange={e => setNewDomain(e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-200'}`}
                    >
                        <option value="">Sem domínio (geral)</option>
                        {domains.map(d => <option key={d.id} value={d.id}>{d.nome}</option>)}
                    </select>
                    <textarea
                        value={newMsg}
                        onChange={e => setNewMsg(e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg h-32 resize-none ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-200'}`}
                        placeholder="Descreva sua solicitação..."
                        required
                    />
                    <div className="flex gap-3 justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50"
                        >
                            {saving ? 'Enviando...' : 'Enviar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
