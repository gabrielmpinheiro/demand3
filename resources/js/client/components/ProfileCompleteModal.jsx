import { useState } from "react";
import axiosClient from "../axios-client";
import { useStateContext } from "../contexts/ContextProvider";

export default function ProfileCompleteModal({ isOpen }) {
    const { setCliente } = useStateContext();
    const [form, setForm] = useState({
        cnpj: '', cpf: '', endereco: '', cidade: '', estado: '', cep: '',
        inscricao_estadual: '', inscricao_municipal: '',
    });
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState(null);

    if (!isOpen) return null;

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrors(null);
        setSaving(true);

        axiosClient.put('/auth/profile', form)
            .then(({ data }) => {
                if (data.data?.cliente) {
                    setCliente(data.data.cliente);
                }
                // Mark profile as complete by reloading the page context
                window.location.reload();
            })
            .catch(err => {
                const response = err.response;
                if (response && response.status === 422) {
                    setErrors(response.data.errors);
                } else {
                    setErrors({ geral: ['Erro ao salvar. Tente novamente.'] });
                }
            })
            .finally(() => setSaving(false));
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-[90] flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full my-4">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 p-6 text-white rounded-t-2xl">
                    <h2 className="text-xl font-bold">Complete seu cadastro</h2>
                    <p className="text-indigo-100 text-sm mt-1">
                        Para usar a plataforma, precisamos de alguns dados adicionais.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {errors && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                            {Object.values(errors).flat().map((msg, i) => <p key={i}>{msg}</p>)}
                        </div>
                    )}

                    {/* Dados fiscais */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3 border-b pb-2">Dados Fiscais</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-700 text-sm font-medium mb-1">CNPJ <span className="text-gray-400">(opcional)</span></label>
                                <input name="cnpj" value={form.cnpj} onChange={handleChange} type="text" className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm" placeholder="00.000.000/0000-00" />
                            </div>
                            <div>
                                <label className="block text-gray-700 text-sm font-medium mb-1">CPF <span className="text-gray-400">(opcional)</span></label>
                                <input name="cpf" value={form.cpf} onChange={handleChange} type="text" className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm" placeholder="000.000.000-00" />
                            </div>
                            <div>
                                <label className="block text-gray-700 text-sm font-medium mb-1">Inscrição Estadual <span className="text-gray-400">(opcional)</span></label>
                                <input name="inscricao_estadual" value={form.inscricao_estadual} onChange={handleChange} type="text" className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm" />
                            </div>
                            <div>
                                <label className="block text-gray-700 text-sm font-medium mb-1">Inscrição Municipal <span className="text-gray-400">(opcional)</span></label>
                                <input name="inscricao_municipal" value={form.inscricao_municipal} onChange={handleChange} type="text" className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm" />
                            </div>
                        </div>
                    </div>

                    {/* Endereço */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3 border-b pb-2">Endereço</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="sm:col-span-2">
                                <label className="block text-gray-700 text-sm font-medium mb-1">Endereço <span className="text-gray-400">(opcional)</span></label>
                                <input name="endereco" value={form.endereco} onChange={handleChange} type="text" className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm" placeholder="Rua, número, complemento" />
                            </div>
                            <div>
                                <label className="block text-gray-700 text-sm font-medium mb-1">Cidade</label>
                                <input name="cidade" value={form.cidade} onChange={handleChange} type="text" className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm" placeholder="São Paulo" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-1">UF</label>
                                    <input name="estado" value={form.estado} onChange={handleChange} type="text" maxLength={2} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm" placeholder="SP" />
                                </div>
                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-1">CEP</label>
                                    <input name="cep" value={form.cep} onChange={handleChange} type="text" className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm" placeholder="00000-000" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 disabled:opacity-50"
                    >
                        {saving ? 'Salvando...' : 'Salvar e continuar →'}
                    </button>

                    <p className="text-center text-xs text-gray-400">
                        Estes dados serão usados para emissão de faturas e contato.
                    </p>
                </form>
            </div>
        </div>
    );
}
