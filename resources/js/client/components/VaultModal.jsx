import { useState } from "react";
import axiosClient from "../axios-client";
import { useStateContext } from "../contexts/ContextProvider";

export default function VaultModal({ isOpen, onClose, onSuccess, domains, vault }) {
    const { theme } = useStateContext();
    const isDark = theme.mode === 'dark';
    const inputCls = `w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-200'}`;

    const [form, setForm] = useState({
        servico: vault?.servico || '',
        login: vault?.login || '',
        senha: '',
        url: vault?.url || '',
        dominio_id: vault?.dominio_id || '',
        notas: vault?.notas || '',
    });
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState(null);

    if (!isOpen) return null;

    const handleSubmit = (ev) => {
        ev.preventDefault();
        setSaving(true);
        setErrors(null);

        const payload = { ...form };
        if (!payload.dominio_id) delete payload.dominio_id;
        if (!payload.url) payload.url = null;
        if (!payload.notas) payload.notas = null;

        // Se editando e senha vazia, não enviar campo senha
        if (vault && !payload.senha) delete payload.senha;

        const request = vault
            ? axiosClient.put(`/vault/${vault.id}`, payload)
            : axiosClient.post('/vault', payload);

        request
            .then(() => { onSuccess(); onClose(); })
            .catch(err => setErrors(err.response?.data?.errors || { servico: ['Erro ao salvar'] }))
            .finally(() => setSaving(false));
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-xl max-w-lg w-full`}>
                <div className={`p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                    <div className="flex justify-between items-center">
                        <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>{vault ? 'Editar Credencial' : 'Nova Credencial'}</h3>
                        <button onClick={onClose} className={`p-1 rounded-lg transition ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                </div>

                {errors && <div className="mx-6 mt-4 bg-red-50 text-red-700 px-3 py-2 rounded-lg text-sm">{Object.values(errors).flat().join(', ')}</div>}

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Serviço *</label>
                        <input value={form.servico} onChange={e => setForm({ ...form, servico: e.target.value })} className={inputCls} placeholder="Ex: cPanel, WordPress, FTP" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Login *</label>
                            <input value={form.login} onChange={e => setForm({ ...form, login: e.target.value })} className={inputCls} placeholder="usuário" required />
                        </div>
                        <div>
                            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Senha {vault ? '' : '*'}</label>
                            <input type="password" value={form.senha} onChange={e => setForm({ ...form, senha: e.target.value })} className={inputCls} placeholder={vault ? 'Manter atual' : 'Senha'} required={!vault} />
                        </div>
                    </div>
                    <div>
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>URL</label>
                        <input value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} className={inputCls} placeholder="https://..." />
                    </div>
                    <div>
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Domínio</label>
                        <select value={form.dominio_id} onChange={e => setForm({ ...form, dominio_id: e.target.value })} className={inputCls}>
                            <option value="">Nenhum</option>
                            {domains.map(d => <option key={d.id} value={d.id}>{d.nome}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Notas</label>
                        <textarea value={form.notas} onChange={e => setForm({ ...form, notas: e.target.value })} className={inputCls} rows={2} placeholder="Informações adicionais..." />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} className={`px-4 py-2.5 rounded-lg font-medium text-sm ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'} transition`}>Cancelar</button>
                        <button type="submit" disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg font-medium text-sm transition disabled:opacity-50">{saving ? 'Salvando...' : 'Salvar'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
