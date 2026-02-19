import { useState } from "react";
import axiosClient from "../axios-client";
import { useStateContext } from "../contexts/ContextProvider";

export default function DomainModal({ isOpen, onClose, onSuccess }) {
    const { theme } = useStateContext();
    const [newDomain, setNewDomain] = useState('');
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState(null);
    const isDark = theme.mode === 'dark';

    if (!isOpen) return null;

    const handleSubmit = (ev) => {
        ev.preventDefault();
        setSaving(true);
        setErrors(null);
        axiosClient.post('/dominios', { nome: newDomain })
            .then(() => {
                setNewDomain('');
                onSuccess();
                onClose();
            })
            .catch(err => {
                if (err.response?.status === 422) setErrors(err.response.data.errors);
                else setErrors({ nome: ['Erro ao cadastrar domínio'] });
            })
            .finally(() => setSaving(false));
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-xl max-w-md w-full p-6`}>
                <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>Adicionar Domínio</h3>
                {errors && (
                    <div className="bg-red-50 text-red-700 px-3 py-2 rounded-lg text-sm mb-3">
                        {Object.values(errors).flat().join(', ')}
                    </div>
                )}
                <form onSubmit={handleSubmit}>
                    <input
                        value={newDomain}
                        onChange={(e) => setNewDomain(e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-200'}`}
                        placeholder="meusite.com.br"
                        required
                    />
                    <div className="flex gap-3 justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'} hover:opacity-80 transition`}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition disabled:opacity-50"
                        >
                            {saving ? 'Salvando...' : 'Cadastrar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
