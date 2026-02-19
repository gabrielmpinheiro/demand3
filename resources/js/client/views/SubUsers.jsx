import { useState, useEffect } from "react";
import { useStateContext } from "../contexts/ContextProvider";
import axiosClient from "../axios-client";

export default function SubUsers() {
    const { theme } = useStateContext();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '' });
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState(null);
    const isDark = theme.mode === 'dark';
    const card = `${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-sm border`;
    const inputCls = `w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-200'}`;

    const fetch = () => {
        axiosClient.get('/users').then(({ data }) => {
            setUsers(data.data || []);
            setLoading(false);
        }).catch(() => setLoading(false));
    };

    useEffect(() => { fetch(); }, []);

    const handleSubmit = (ev) => {
        ev.preventDefault();
        setSaving(true); setErrors(null);
        axiosClient.post('/users', form)
            .then(() => { setShowModal(false); setForm({ name: '', email: '', password: '', password_confirmation: '' }); fetch(); })
            .catch(err => setErrors(err.response?.data?.errors || { name: ['Erro ao criar usuário'] }))
            .finally(() => setSaving(false));
    };

    const handleDelete = (id) => {
        if (!confirm('Remover este usuário?')) return;
        axiosClient.delete(`/users/${id}`).then(() => fetch())
            .catch(err => alert(err.response?.data?.message || 'Erro'));
    };

    if (loading) return <div className="flex justify-center py-12"><svg className="animate-spin h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg></div>;

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div className="flex justify-between items-center">
                <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Usuários</h2>
                <button onClick={() => setShowModal(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium">+ Adicionar</button>
            </div>

            {users.length === 0 ? (
                <div className={`${card} p-8 text-center`}><p className={isDark ? 'text-gray-400' : 'text-gray-500'}>Nenhum usuário adicional.</p></div>
            ) : (
                <div className="space-y-3">
                    {users.map(u => (
                        <div key={u.id} className={`${card} p-4 flex items-center justify-between`}>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold">
                                    {u.name?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>{u.name}</p>
                                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{u.email}</p>
                                </div>
                            </div>
                            <button onClick={() => handleDelete(u.id)} className="text-red-500 hover:text-red-700 p-1 transition">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-xl max-w-md w-full p-6`}>
                        <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>Novo Usuário</h3>
                        {errors && <div className="bg-red-50 text-red-700 px-3 py-2 rounded-lg text-sm mb-3">{Object.values(errors).flat().join(', ')}</div>}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={inputCls} placeholder="Nome" required />
                            <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className={inputCls} placeholder="Email" type="email" required />
                            <input value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className={inputCls} placeholder="Senha (mín. 8)" type="password" required minLength={8} />
                            <input value={form.password_confirmation} onChange={e => setForm({ ...form, password_confirmation: e.target.value })} className={inputCls} placeholder="Confirmar senha" type="password" required />
                            <div className="flex gap-3 justify-end">
                                <button type="button" onClick={() => setShowModal(false)} className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>Cancelar</button>
                                <button type="submit" disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50">{saving ? 'Criando...' : 'Criar'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
