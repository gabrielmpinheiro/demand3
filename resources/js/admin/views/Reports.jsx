import { useState, useEffect } from "react";
import axiosClient from "../axios-client";
import { toast } from "react-toastify";

// ── Helpers ──────────────────────────────────────────────────────────────────
function formatHoras(h) {
    if (h === null || h === undefined) return "0,00h";
    return h.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "h";
}

function formatMoeda(v) {
    if (v === null || v === undefined) return "R$ 0,00";
    return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function getMonthRange() {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const fmt = (d) => d.toISOString().split("T")[0];
    return { inicio: fmt(firstDay), fim: fmt(lastDay) };
}

// ── Badge de classificação ───────────────────────────────────────────────────
function ClassificacaoBadge({ classificacao }) {
    const map = {
        coberta_pelo_plano: { label: "Coberta pelo Plano", cls: "bg-green-100 text-green-800" },
        hora_tecnica_excedente: { label: "Excedente", cls: "bg-orange-100 text-orange-800" },
        hora_avulsa: { label: "Avulsa", cls: "bg-red-100 text-red-800" },
        sem_cobranca: { label: "Sem Cobrança", cls: "bg-gray-100 text-gray-700" },
    };
    const item = map[classificacao] || { label: classificacao, cls: "bg-gray-100 text-gray-700" };
    return (
        <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${item.cls}`}>
            {item.label}
        </span>
    );
}

// ── Badge de status ──────────────────────────────────────────────────────────
function StatusBadge({ status }) {
    const map = {
        concluido: { label: "Concluído", cls: "bg-green-100 text-green-800" },
        em_andamento: { label: "Em Andamento", cls: "bg-blue-100 text-blue-800" },
        pendente: { label: "Pendente", cls: "bg-yellow-100 text-yellow-800" },
        cancelado: { label: "Cancelado", cls: "bg-gray-100 text-gray-600" },
    };
    const item = map[status] || { label: status, cls: "bg-gray-100 text-gray-700" };
    return (
        <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${item.cls}`}>
            {item.label}
        </span>
    );
}

// ── Skeleton loader ──────────────────────────────────────────────────────────
function Skeleton({ className = "" }) {
    return <div className={`animate-pulse bg-gray-200 rounded ${className}`} />;
}

function LoadingSkeleton() {
    return (
        <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
            </div>
            <Skeleton className="h-64 w-full" />
        </div>
    );
}

// ── Modal de confirmação de e-mail ───────────────────────────────────────────
function EmailModal({ cliente, periodo, tipo, onConfirm, onCancel, sending }) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-2">Enviar Relatório por E-mail</h3>
                <p className="text-gray-600 mb-1">
                    Será enviado o relatório do período{" "}
                    <span className="font-semibold">{periodo.inicio} a {periodo.fim}</span> ao e-mail cadastrado:
                </p>
                <p className="text-blue-600 font-semibold mb-6">{cliente?.email}</p>
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onCancel}
                        disabled={sending}
                        className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={sending}
                        className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-2 transition disabled:opacity-60"
                    >
                        {sending && (
                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                        )}
                        Confirmar Envio
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Accordion de chamado ─────────────────────────────────────────────────────
function ChamadoAccordion({ chamado }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
            <button
                className="w-full flex justify-between items-center px-4 py-3 bg-gray-50 hover:bg-gray-100 transition text-left"
                onClick={() => setOpen(!open)}
            >
                <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-semibold text-gray-800">#{chamado.id}</span>
                    <StatusBadge status={chamado.status} />
                    <span className="text-sm text-gray-500">{chamado.dominio}</span>
                    <span className="text-sm text-gray-400">{chamado.criado_em}</span>
                    {chamado.mensagem && (
                        <span className="text-sm text-gray-600 truncate max-w-xs">{chamado.mensagem}</span>
                    )}
                </div>
                <svg
                    className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            {open && (
                <div className="overflow-x-auto">
                    {chamado.demandas && chamado.demandas.length > 0 ? (
                        <table className="min-w-full text-sm">
                            <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                                <tr>
                                    <th className="px-4 py-2 text-left">Título</th>
                                    <th className="px-4 py-2 text-left">Tipo</th>
                                    <th className="px-4 py-2 text-left">Classificação</th>
                                    <th className="px-4 py-2 text-left">Status</th>
                                    <th className="px-4 py-2 text-right">Horas</th>
                                    <th className="px-4 py-2 text-right">Valor</th>
                                    <th className="px-4 py-2 text-left">Plano</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {chamado.demandas.map((d) => (
                                    <tr key={d.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-2 font-medium text-gray-800">
                                            <div>{d.titulo}</div>
                                            {d.descricao && (
                                                <div className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{d.descricao}</div>
                                            )}
                                        </td>
                                        <td className="px-4 py-2 text-gray-600 capitalize">{d.tipo?.replace(/_/g, " ")}</td>
                                        <td className="px-4 py-2"><ClassificacaoBadge classificacao={d.classificacao} /></td>
                                        <td className="px-4 py-2"><StatusBadge status={d.status} /></td>
                                        <td className="px-4 py-2 text-right font-mono">{formatHoras(d.horas)}</td>
                                        <td className="px-4 py-2 text-right font-mono">
                                            {d.valor_excedente > 0 ? (
                                                <span className="text-orange-600">{formatMoeda(d.valor_excedente)}</span>
                                            ) : (
                                                <span className="text-gray-400">—</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-2 text-xs text-gray-500">{d.plano || "—"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="px-4 py-3 text-sm text-gray-500">Nenhuma demanda neste chamado.</p>
                    )}
                </div>
            )}
        </div>
    );
}

// ── Relatório de cliente específico ─────────────────────────────────────────
function ClienteReport({ data }) {
    const { cliente, resumo, pendencias, chamados, periodo, tipo } = data;

    return (
        <div className="space-y-6">
            {/* Cabeçalho do cliente */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                    <div className="flex-1">
                        <h2 className="text-xl font-bold text-gray-900">{cliente.nome}</h2>
                        <p className="text-gray-500 text-sm mt-1">{cliente.email}</p>
                        <div className="flex flex-wrap gap-4 mt-3">
                            {cliente.cnpj && (
                                <span className="text-sm text-gray-600"><span className="font-medium">CNPJ:</span> {cliente.cnpj}</span>
                            )}
                            {cliente.cpf && (
                                <span className="text-sm text-gray-600"><span className="font-medium">CPF:</span> {cliente.cpf}</span>
                            )}
                            {(cliente.cidade || cliente.estado) && (
                                <span className="text-sm text-gray-600">
                                    <span className="font-medium">Localização:</span> {[cliente.cidade, cliente.estado].filter(Boolean).join(", ")}
                                </span>
                            )}
                            {cliente.is_parceiro && (
                                <span className="inline-block bg-purple-100 text-purple-700 text-xs font-semibold px-2 py-0.5 rounded">Parceiro</span>
                            )}
                        </div>
                    </div>

                    {/* Plano atual */}
                    {cliente.plano_atual && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 min-w-56">
                            <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-2">Plano Atual</p>
                            <p className="font-bold text-green-900 text-lg">{cliente.plano_atual.nome}</p>
                            <div className="mt-2 space-y-1 text-sm text-green-800">
                                <div className="flex justify-between gap-4">
                                    <span>Limite horas:</span>
                                    <span className="font-semibold">{formatHoras(cliente.plano_atual.limite_horas_tecnicas)}</span>
                                </div>
                                <div className="flex justify-between gap-4">
                                    <span>Horas disponíveis:</span>
                                    <span className="font-semibold">{formatHoras(cliente.plano_atual.horas_disponiveis)}</span>
                                </div>
                                <div className="flex justify-between gap-4">
                                    <span>Valor/hora:</span>
                                    <span className="font-semibold">{formatMoeda(cliente.plano_atual.valor_hora)}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <p className="text-xs text-gray-400 mt-4">
                    Período: <strong>{periodo.inicio}</strong> a <strong>{periodo.fim}</strong>
                </p>
            </div>

            {/* Cards de resumo de horas */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">Horas do Plano</p>
                    <p className="text-2xl font-bold text-green-800 mt-1">{formatHoras(resumo.horas_plano)}</p>
                    <p className="text-xs text-green-600 mt-1">{resumo.total_chamados} chamado(s)</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Cobertas pelo Plano</p>
                    <p className="text-2xl font-bold text-blue-800 mt-1">{formatHoras(resumo.horas_tecnicas_cobertas)}</p>
                    <p className="text-xs text-blue-600 mt-1">{resumo.total_demandas} demanda(s)</p>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                    <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide">Horas Excedentes</p>
                    <p className="text-2xl font-bold text-orange-800 mt-1">{formatHoras(resumo.horas_tecnicas_excedentes)}</p>
                    {resumo.valor_horas_excedentes > 0 && (
                        <p className="text-xs text-orange-600 mt-1 font-semibold">{formatMoeda(resumo.valor_horas_excedentes)}</p>
                    )}
                </div>
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <p className="text-xs font-semibold text-red-700 uppercase tracking-wide">Horas Avulsas</p>
                    <p className="text-2xl font-bold text-red-800 mt-1">{formatHoras(resumo.horas_tecnicas_avulsas)}</p>
                    {resumo.valor_horas_avulsas > 0 && (
                        <p className="text-xs text-red-600 mt-1 font-semibold">{formatMoeda(resumo.valor_horas_avulsas)}</p>
                    )}
                </div>
                <div className="bg-gray-800 rounded-xl p-4 col-span-2 md:col-span-1">
                    <p className="text-xs font-semibold text-gray-300 uppercase tracking-wide">Total</p>
                    <p className="text-2xl font-bold text-white mt-1">{formatHoras(resumo.total_horas)}</p>
                    {resumo.valor_total_a_pagar > 0 ? (
                        <p className="text-sm text-yellow-300 mt-1 font-bold">{formatMoeda(resumo.valor_total_a_pagar)}</p>
                    ) : (
                        <p className="text-sm text-green-400 mt-1 font-semibold">Sem cobranças</p>
                    )}
                </div>
            </div>

            {/* Pendências */}
            {pendencias && pendencias.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <h3 className="text-lg font-bold text-gray-800">Pendências</h3>
                        <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-0.5 rounded-full">
                            {pendencias.length}
                        </span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                                <tr>
                                    <th className="px-4 py-2 text-left">Título</th>
                                    <th className="px-4 py-2 text-left">Tipo</th>
                                    <th className="px-4 py-2 text-left">Status</th>
                                    <th className="px-4 py-2 text-right">Horas</th>
                                    <th className="px-4 py-2 text-left">Domínio</th>
                                    <th className="px-4 py-2 text-left">Criada em</th>
                                    <th className="px-4 py-2 text-left">Plano</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {pendencias.map((p) => (
                                    <tr key={p.id} className="hover:bg-yellow-50">
                                        <td className="px-4 py-2 font-medium text-gray-800">
                                            <div>{p.titulo}</div>
                                            {p.descricao && <div className="text-xs text-gray-400 truncate max-w-xs">{p.descricao}</div>}
                                        </td>
                                        <td className="px-4 py-2 text-gray-600 capitalize">{p.tipo?.replace(/_/g, " ")}</td>
                                        <td className="px-4 py-2"><StatusBadge status={p.status} /></td>
                                        <td className="px-4 py-2 text-right font-mono">{formatHoras(p.horas)}</td>
                                        <td className="px-4 py-2 text-gray-500">{p.dominio || "—"}</td>
                                        <td className="px-4 py-2 text-gray-500 whitespace-nowrap">{p.criada_em}</td>
                                        <td className="px-4 py-2 text-xs text-gray-500">{p.plano || "—"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Chamados do período */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-lg font-bold text-gray-800">Chamados do Período</h3>
                    <span className="bg-gray-100 text-gray-700 text-xs font-bold px-2 py-0.5 rounded-full">
                        {chamados?.length ?? 0}
                    </span>
                </div>

                {!chamados || chamados.length === 0 ? (
                    <p className="text-gray-500 text-sm">Nenhum chamado no período selecionado.</p>
                ) : tipo === "completo" ? (
                    <div className="space-y-3">
                        {chamados.map((c) => (
                            <ChamadoAccordion key={c.id} chamado={c} />
                        ))}
                    </div>
                ) : (
                    // Tipo simples: tabela resumida
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                                <tr>
                                    <th className="px-4 py-2 text-left">ID</th>
                                    <th className="px-4 py-2 text-left">Status</th>
                                    <th className="px-4 py-2 text-left">Domínio</th>
                                    <th className="px-4 py-2 text-left">Criado em</th>
                                    <th className="px-4 py-2 text-right">Demandas</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {chamados.map((c) => (
                                    <tr key={c.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-2 font-semibold text-gray-800">#{c.id}</td>
                                        <td className="px-4 py-2"><StatusBadge status={c.status} /></td>
                                        <td className="px-4 py-2 text-gray-600">{c.dominio || "—"}</td>
                                        <td className="px-4 py-2 text-gray-500 whitespace-nowrap">{c.criado_em}</td>
                                        <td className="px-4 py-2 text-right text-gray-700">{c.demandas?.length ?? 0}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Relatório geral (todos os clientes) ─────────────────────────────────────
function GeralReport({ data, meta }) {
    const [expanded, setExpanded] = useState(null);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
                <h3 className="text-lg font-bold text-gray-800">Relatório Geral</h3>
                <span className="bg-gray-100 text-gray-700 text-xs font-bold px-2 py-0.5 rounded-full">
                    {meta?.total_clientes ?? data.length} clientes
                </span>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                        <tr>
                            <th className="px-4 py-2 text-left">Cliente</th>
                            <th className="px-4 py-2 text-right">Chamados</th>
                            <th className="px-4 py-2 text-right">Demandas</th>
                            <th className="px-4 py-2 text-right">Horas Plano</th>
                            <th className="px-4 py-2 text-right">Horas Cobertas</th>
                            <th className="px-4 py-2 text-right">Excedentes</th>
                            <th className="px-4 py-2 text-right">Total a Pagar</th>
                            <th className="px-4 py-2 text-center">Detalhes</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {data.map((item) => (
                            <>
                                <tr key={item.cliente?.id ?? Math.random()} className="hover:bg-gray-50">
                                    <td className="px-4 py-3">
                                        <div className="font-semibold text-gray-800">{item.cliente?.nome}</div>
                                        <div className="text-xs text-gray-400">{item.cliente?.email}</div>
                                    </td>
                                    <td className="px-4 py-3 text-right">{item.resumo?.total_chamados ?? "—"}</td>
                                    <td className="px-4 py-3 text-right">{item.resumo?.total_demandas ?? "—"}</td>
                                    <td className="px-4 py-3 text-right font-mono">{formatHoras(item.resumo?.horas_plano)}</td>
                                    <td className="px-4 py-3 text-right font-mono">{formatHoras(item.resumo?.horas_tecnicas_cobertas)}</td>
                                    <td className="px-4 py-3 text-right font-mono text-orange-600">
                                        {item.resumo?.horas_tecnicas_excedentes > 0 ? formatHoras(item.resumo.horas_tecnicas_excedentes) : <span className="text-gray-400">—</span>}
                                    </td>
                                    <td className="px-4 py-3 text-right font-mono font-semibold">
                                        {item.resumo?.valor_total_a_pagar > 0
                                            ? <span className="text-red-600">{formatMoeda(item.resumo.valor_total_a_pagar)}</span>
                                            : <span className="text-green-600">—</span>
                                        }
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <button
                                            onClick={() => setExpanded(expanded === item.cliente?.id ? null : item.cliente?.id)}
                                            className="text-xs text-blue-600 hover:text-blue-800 font-semibold underline"
                                        >
                                            {expanded === item.cliente?.id ? "Fechar" : "Ver detalhes"}
                                        </button>
                                    </td>
                                </tr>
                                {expanded === item.cliente?.id && (
                                    <tr key={`detail-${item.cliente?.id}`}>
                                        <td colSpan={8} className="px-4 py-4 bg-gray-50">
                                            <ClienteReport data={item} />
                                        </td>
                                    </tr>
                                )}
                            </>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ── Componente principal ─────────────────────────────────────────────────────
export default function Reports() {
    const { inicio, fim } = getMonthRange();

    const [clientes, setClientes] = useState([]);
    const [loadingClientes, setLoadingClientes] = useState(true);

    const [filtros, setFiltros] = useState({
        cliente_id: "",
        data_inicio: inicio,
        data_fim: fim,
        tipo: "completo",
    });

    const [relatorio, setRelatorio] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [showEmailModal, setShowEmailModal] = useState(false);
    const [sending, setSending] = useState(false);

    // Busca lista de clientes
    useEffect(() => {
        axiosClient.get("/clientes?per_page=100")
            .then(({ data }) => {
                setClientes(data.data ?? []);
            })
            .catch(() => {
                toast.error("Erro ao carregar lista de clientes.");
            })
            .finally(() => setLoadingClientes(false));
    }, []);

    const handleFiltroChange = (e) => {
        const { name, value } = e.target;
        setFiltros((prev) => ({ ...prev, [name]: value }));
        // Ao trocar para "Todos", limpa relatório atual
        if (name === "cliente_id" && value === "") {
            setRelatorio(null);
        }
    };

    const gerarRelatorio = () => {
        setLoading(true);
        setError(null);
        setRelatorio(null);

        const params = {
            data_inicio: filtros.data_inicio,
            data_fim: filtros.data_fim,
            tipo: filtros.tipo,
        };
        if (filtros.cliente_id) {
            params.cliente_id = filtros.cliente_id;
        }

        axiosClient.get("/relatorios", { params })
            .then(({ data }) => {
                setRelatorio(data);
            })
            .catch((err) => {
                const msg = err.response?.data?.message || "Erro ao gerar relatório.";
                setError(msg);
                toast.error(msg);
            })
            .finally(() => setLoading(false));
    };

    const enviarEmail = () => {
        setSending(true);
        const body = {
            cliente_id: filtros.cliente_id,
            data_inicio: filtros.data_inicio,
            data_fim: filtros.data_fim,
            tipo: filtros.tipo,
        };
        axiosClient.post("/relatorios/enviar-email", body)
            .then(({ data }) => {
                toast.success(data.message || `Relatório enviado para ${data.destinatario}`);
                setShowEmailModal(false);
            })
            .catch((err) => {
                const msg = err.response?.data?.message || "Erro ao enviar e-mail.";
                toast.error(msg);
            })
            .finally(() => setSending(false));
    };

    const clienteSelecionado = clientes.find((c) => String(c.id) === String(filtros.cliente_id));

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Relatório de Horas</h1>

            {/* ── Painel de filtros ──────────────────────────────────── */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 print:hidden">
                <h2 className="text-base font-semibold text-gray-700 mb-4">Filtros</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Select de cliente */}
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Cliente</label>
                        <select
                            name="cliente_id"
                            value={filtros.cliente_id}
                            onChange={handleFiltroChange}
                            disabled={loadingClientes}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
                        >
                            <option value="">
                                {loadingClientes ? "Carregando clientes..." : "Todos os clientes"}
                            </option>
                            {clientes.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.nome}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Data início */}
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Data Início</label>
                        <input
                            type="date"
                            name="data_inicio"
                            value={filtros.data_inicio}
                            onChange={handleFiltroChange}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>

                    {/* Data fim */}
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Data Fim</label>
                        <input
                            type="date"
                            name="data_fim"
                            value={filtros.data_fim}
                            onChange={handleFiltroChange}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>

                    {/* Tipo */}
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Tipo</label>
                        <select
                            name="tipo"
                            value={filtros.tipo}
                            onChange={handleFiltroChange}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <option value="completo">Completo</option>
                            <option value="simples">Simples</option>
                        </select>
                    </div>
                </div>

                {/* Botões de ação */}
                <div className="flex flex-wrap gap-3 mt-5">
                    <button
                        onClick={gerarRelatorio}
                        disabled={loading}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold transition disabled:opacity-60"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Gerando...
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Gerar Relatório
                            </>
                        )}
                    </button>

                    {relatorio && (
                        <button
                            onClick={() => window.print()}
                            className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold transition print:hidden"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                            Imprimir / Salvar PDF
                        </button>
                    )}

                    {filtros.cliente_id && (
                        <button
                            onClick={() => setShowEmailModal(true)}
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold transition disabled:opacity-60 print:hidden"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            Enviar por E-mail
                        </button>
                    )}
                </div>
            </div>

            {/* ── Estado de loading ───────────────────────────────────── */}
            {loading && <LoadingSkeleton />}

            {/* ── Estado de erro ──────────────────────────────────────── */}
            {error && !loading && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                    <svg className="w-10 h-10 text-red-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-red-700 font-semibold">{error}</p>
                    <button
                        onClick={gerarRelatorio}
                        className="mt-3 text-sm text-red-600 underline hover:text-red-800"
                    >
                        Tentar novamente
                    </button>
                </div>
            )}

            {/* ── Estado inicial (sem relatório) ──────────────────────── */}
            {!loading && !error && !relatorio && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-gray-500 text-lg font-medium">Configure os filtros e clique em <span className="text-green-600 font-semibold">Gerar Relatório</span></p>
                    <p className="text-gray-400 text-sm mt-1">O período padrão é o mês corrente.</p>
                </div>
            )}

            {/* ── Resultado ───────────────────────────────────────────── */}
            {!loading && !error && relatorio && (
                <>
                    {/* Relatório de cliente específico */}
                    {relatorio.data && !Array.isArray(relatorio.data) && (
                        <ClienteReport data={relatorio.data} />
                    )}

                    {/* Relatório geral */}
                    {relatorio.data && Array.isArray(relatorio.data) && (
                        <GeralReport data={relatorio.data} meta={relatorio.meta} />
                    )}
                </>
            )}

            {/* ── Modal de e-mail ──────────────────────────────────────── */}
            {showEmailModal && (
                <EmailModal
                    cliente={clienteSelecionado}
                    periodo={{ inicio: filtros.data_inicio, fim: filtros.data_fim }}
                    tipo={filtros.tipo}
                    onConfirm={enviarEmail}
                    onCancel={() => setShowEmailModal(false)}
                    sending={sending}
                />
            )}
        </div>
    );
}
