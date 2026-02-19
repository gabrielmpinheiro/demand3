import { useState, useEffect } from "react";
import { useStateContext } from "../contexts/ContextProvider";
import axiosClient from "../axios-client";

export default function Profile() {
    const { user, setUser, theme } = useStateContext();
    const isDark = theme.mode === 'dark';
    const card = `${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-sm border`;
    const inputCls = `w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-200'}`;

    const [profile, setProfile] = useState({
        name: '', telefone: '', endereco: '', cidade: '', estado: '', cep: '',
        cnpj: '', cpf: '', inscricao_estadual: '', inscricao_municipal: ''
    });
    const [passwords, setPasswords] = useState({ current_password: '', password: '', password_confirmation: '' });
    const [saving, setSaving] = useState(false);
    const [savingPwd, setSavingPwd] = useState(false);
    const [msg, setMsg] = useState('');
    const [msgPwd, setMsgPwd] = useState('');
    const [errors, setErrors] = useState(null);

    useEffect(() => {
        axiosClient.get('/auth/user').then(({ data }) => {
            const u = data.data;
            setProfile({
                name: u.name || '',
                telefone: u.cliente?.telefone || '',
                endereco: u.cliente?.endereco || '',
                cidade: u.cliente?.cidade || '',
                estado: u.cliente?.estado || '',
                cep: u.cliente?.cep || '',
                cnpj: u.cliente?.cnpj || '',
                cpf: u.cliente?.cpf || '',
                inscricao_estadual: u.cliente?.inscricao_estadual || '',
                inscricao_municipal: u.cliente?.inscricao_municipal || '',
            });
        });
    }, []);

    const handleProfile = (ev) => {
        ev.preventDefault();
        setSaving(true); setMsg(''); setErrors(null);
        axiosClient.put('/auth/profile', profile)
            .then(({ data }) => { setMsg('Perfil atualizado!'); setUser(data.data); })
            .catch(err => setErrors(err.response?.data?.errors || { name: ['Erro ao atualizar'] }))
            .finally(() => setSaving(false));
    };

    const handlePassword = (ev) => {
        ev.preventDefault();
        setSavingPwd(true); setMsgPwd('');
        axiosClient.put('/auth/password', passwords)
            .then(() => { setMsgPwd('Senha atualizada!'); setPasswords({ current_password: '', password: '', password_confirmation: '' }); })
            .catch(err => setMsgPwd(err.response?.data?.errors ? Object.values(err.response.data.errors).flat()[0] : 'Erro'))
            .finally(() => setSavingPwd(false));
    };

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Meu Perfil</h2>

            {/* Dados da Empresa */}
            <div className={`${card} p-6`}>
                <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>Dados da Empresa</h3>
                {msg && <div className="bg-green-50 text-green-700 px-3 py-2 rounded-lg text-sm mb-3">{msg}</div>}
                {errors && <div className="bg-red-50 text-red-700 px-3 py-2 rounded-lg text-sm mb-3">{Object.values(errors).flat().join(', ')}</div>}
                <form onSubmit={handleProfile} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Nome / Razão Social</label>
                            <input value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} className={inputCls} required />
                        </div>
                        <div>
                            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>CNPJ</label>
                            <input value={profile.cnpj} onChange={e => setProfile({ ...profile, cnpj: e.target.value })} className={inputCls} placeholder="00.000.000/0000-00" />
                        </div>
                        <div>
                            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>CPF</label>
                            <input value={profile.cpf} onChange={e => setProfile({ ...profile, cpf: e.target.value })} className={inputCls} placeholder="000.000.000-00" />
                        </div>
                        <div>
                            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Telefone</label>
                            <input value={profile.telefone} onChange={e => setProfile({ ...profile, telefone: e.target.value })} className={inputCls} />
                        </div>
                        <div>
                            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Inscrição Estadual</label>
                            <input value={profile.inscricao_estadual} onChange={e => setProfile({ ...profile, inscricao_estadual: e.target.value })} className={inputCls} />
                        </div>
                        <div>
                            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Inscrição Municipal</label>
                            <input value={profile.inscricao_municipal} onChange={e => setProfile({ ...profile, inscricao_municipal: e.target.value })} className={inputCls} />
                        </div>
                        <div className="sm:col-span-2">
                            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Endereço</label>
                            <input value={profile.endereco} onChange={e => setProfile({ ...profile, endereco: e.target.value })} className={inputCls} />
                        </div>
                        <div>
                            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Cidade</label>
                            <input value={profile.cidade} onChange={e => setProfile({ ...profile, cidade: e.target.value })} className={inputCls} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>UF</label>
                                <input value={profile.estado} onChange={e => setProfile({ ...profile, estado: e.target.value })} className={inputCls} maxLength={2} />
                            </div>
                            <div>
                                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>CEP</label>
                                <input value={profile.cep} onChange={e => setProfile({ ...profile, cep: e.target.value })} className={inputCls} />
                            </div>
                        </div>
                    </div>
                    <button type="submit" disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-medium transition disabled:opacity-50">{saving ? 'Salvando...' : 'Salvar Perfil'}</button>
                </form>
            </div>

            {/* Password */}
            <div className={`${card} p-6`}>
                <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>Alterar Senha</h3>
                {msgPwd && <div className={`px-3 py-2 rounded-lg text-sm mb-3 ${msgPwd.includes('Erro') || msgPwd.includes('incorreta') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>{msgPwd}</div>}
                <form onSubmit={handlePassword} className="space-y-4">
                    <div>
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Senha Atual</label>
                        <input type="password" value={passwords.current_password} onChange={e => setPasswords({ ...passwords, current_password: e.target.value })} className={inputCls} required />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Nova Senha</label>
                            <input type="password" value={passwords.password} onChange={e => setPasswords({ ...passwords, password: e.target.value })} className={inputCls} required minLength={8} />
                        </div>
                        <div>
                            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Confirmar</label>
                            <input type="password" value={passwords.password_confirmation} onChange={e => setPasswords({ ...passwords, password_confirmation: e.target.value })} className={inputCls} required />
                        </div>
                    </div>
                    <button type="submit" disabled={savingPwd} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-medium transition disabled:opacity-50">{savingPwd ? 'Salvando...' : 'Alterar Senha'}</button>
                </form>
            </div>
        </div>
    );
}
