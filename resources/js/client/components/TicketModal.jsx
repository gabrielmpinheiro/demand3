import { useState, useRef } from "react";
import axiosClient from "../axios-client";
import { useStateContext } from "../contexts/ContextProvider";

const ACCEPTED_TYPES = '.pdf,.docx,.doc,.xls,.xlsx,.xd,.psd,.zip';
const ACCEPTED_LABEL = 'PDF, DOCX, XLS, XD, PSD, ZIP';

export default function TicketModal({ isOpen, onClose, onSuccess, domains }) {
    const { theme } = useStateContext();
    const [newMsg, setNewMsg] = useState('');
    const [newDomain, setNewDomain] = useState('');
    const [domainError, setDomainError] = useState('');
    const [files, setFiles] = useState([]);
    const [saving, setSaving] = useState(false);
    const fileInputRef = useRef();
    const isDark = theme.mode === 'dark';

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        const picked = Array.from(e.target.files);
        setFiles(prev => [...prev, ...picked]);
    };

    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const formatSize = (bytes) => {
        if (bytes > 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`;
        if (bytes > 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
        return `${(bytes / 1024).toFixed(0)} KB`;
    };

    const handleSubmit = (ev) => {
        ev.preventDefault();

        // Validação: domínio obrigatório
        if (!newDomain) {
            setDomainError('Selecione um domínio antes de abrir o chamado.');
            return;
        }
        setDomainError('');

        setSaving(true);

        const formData = new FormData();
        formData.append('mensagem', newMsg);
        formData.append('dominio_id', newDomain);
        files.forEach((f, i) => formData.append(`arquivos[${i}]`, f));

        axiosClient.post('/suportes', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })
            .then(() => {
                setNewMsg('');
                setNewDomain('');
                setDomainError('');
                setFiles([]);
                onSuccess();
                onClose();
            })
            .catch(err => alert(err.response?.data?.message || 'Erro ao criar chamado'))
            .finally(() => setSaving(false));
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto`}>
                <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>Novo Chamado</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Domain - obrigatório */}
                    <div>
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            Domínio <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={newDomain}
                            onChange={e => { setNewDomain(e.target.value); setDomainError(''); }}
                            className={`w-full px-4 py-3 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-200'} ${domainError ? 'border-red-500' : ''}`}
                        >
                            <option value="">Selecione um domínio...</option>
                            {domains.map(d => <option key={d.id} value={d.id}>{d.nome}</option>)}
                        </select>
                        {domainError && (
                            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                {domainError}
                            </p>
                        )}
                    </div>

                    {/* Message */}
                    <textarea
                        value={newMsg}
                        onChange={e => setNewMsg(e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg h-32 resize-none ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-200'}`}
                        placeholder="Descreva sua solicitação..."
                        required
                    />

                    {/* File Upload */}
                    <div>
                        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            Anexar arquivos <span className={`text-xs font-normal ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>({ACCEPTED_LABEL})</span>
                        </label>

                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${isDark ? 'border-gray-600 hover:border-indigo-500 text-gray-400' : 'border-gray-200 hover:border-indigo-400 text-gray-400'}`}
                        >
                            <svg className="w-8 h-8 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <p className="text-sm">Clique para selecionar arquivos</p>
                            <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Múltiplos arquivos permitidos</p>
                        </div>

                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept={ACCEPTED_TYPES}
                            onChange={handleFileChange}
                            className="hidden"
                        />

                        {/* Selected files list */}
                        {files.length > 0 && (
                            <div className="mt-3 space-y-2">
                                {files.map((f, i) => (
                                    <div key={i} className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                        <div className="flex items-center gap-2 min-w-0">
                                            <svg className="w-4 h-4 text-indigo-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            <span className={`truncate ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{f.name}</span>
                                            <span className={`text-xs flex-shrink-0 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{formatSize(f.size)}</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeFile(i)}
                                            className="ml-2 text-red-400 hover:text-red-600 flex-shrink-0"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

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
