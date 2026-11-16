import { useState } from "react";
import axiosClient from "../axios-client";
import { toast } from "react-toastify";

// ─── Helpers ────────────────────────────────────────────────────────────────

const formatHoras = (h) =>
    Number(h || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "h";

const formatMoeda = (v) =>
    Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const hoje = () => new Date();

const primeiroDiaMes = () => {
    const d = hoje();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
};

const ultimoDiaMes = () => {
    const d = hoje();
    const ultimo = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    return `${ultimo.getFullYear()}-${String(ultimo.getMonth() + 1).padStart(2, "0")}-${String(ultimo.getDate()).padStart(2, "0")}`;
};

// ─── Print Helpers ───────────────────────────────────────────────────────────

function formatDataBR(dateStr) {
    if (!dateStr) return "—";
    if (/^\d{2}\/\d{2}\/\d{4}/.test(dateStr)) return dateStr;
    const [date, time] = dateStr.split("T");
    if (!date) return dateStr;
    const [y, m, d] = date.split("-");
    return time ? `${d}/${m}/${y} ${time.substring(0, 5)}` : `${d}/${m}/${y}`;
}

function calcPct(demandas) {
    if (!demandas || demandas.length === 0) return 0;
    return Math.round(demandas.filter((d) => d.status === "concluido").length / demandas.length * 100);
}

function agora() {
    return new Date().toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

// ─── PrintableReport ────────────────────────────────────────────────────────

function PrintableReport({ relatorio }) {
    const cliente = relatorio?.cliente || {};
    const resumo = relatorio?.resumo || {};
    const pendencias = relatorio?.pendencias || [];
    const chamados = relatorio?.chamados || [];
    const periodo = relatorio?.periodo || {};
    const tipo = relatorio?.tipo;
    const plano = cliente?.plano_atual;

    const thStyle = {
        border: "1px solid #333",
        padding: "6px 8px",
        backgroundColor: "#1a2b4a",
        color: "#fff",
        textAlign: "left",
    };
    const tdStyle = {
        border: "1px solid #ccc",
        padding: "5px 8px",
    };
    const tableStyle = {
        width: "100%",
        borderCollapse: "collapse",
        marginBottom: "16px",
        fontSize: "10pt",
    };
    const h3Style = {
        marginTop: "20px",
        marginBottom: "8px",
        fontSize: "12pt",
        fontWeight: "bold",
        color: "#1a2b4a",
        borderBottom: "1px solid #ccc",
        paddingBottom: "4px",
    };

    const classificacaoLabel = (c) => {
        const map = {
            plano: "Plano",
            coberta_pelo_plano: "Coberta",
            excedente: "Excedente",
            avulsa: "Avulsa",
        };
        return map[c] || c;
    };

    const statusLabel = (s) => {
        const map = {
            aberto: "Aberto",
            em_andamento: "Em andamento",
            concluido: "Concluido",
            cancelado: "Cancelado",
        };
        return map[s] || s;
    };

    return (
        <div
            id="print-report-client"
            style={{
                fontFamily: "Arial, sans-serif",
                fontSize: "11pt",
                color: "#000",
                margin: "0",
                padding: "20px",
                display: "none",
            }}
        >
            {/* ── Cabeçalho ── */}
            <div
                style={{
                    borderBottom: "2px solid #1a2b4a",
                    paddingBottom: "12px",
                    marginBottom: "16px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <img src="/logo.png" alt="Logo" style={{ height: "40px" }} />
                    <div>
                        <div style={{ fontWeight: "bold", fontSize: "14pt", color: "#1a2b4a" }}>
                            Demand3 / SiteCare
                        </div>
                        <div style={{ fontSize: "11pt", fontWeight: "bold", color: "#333" }}>Relatório de Horas</div>
                        <div style={{ fontSize: "9pt", color: "#555", marginTop: "2px" }}>
                            Período: {formatDataBR(periodo.inicio)} a {formatDataBR(periodo.fim)}
                        </div>
                    </div>
                </div>
                <div style={{ textAlign: "right", fontSize: "9pt", color: "#555" }}>
                    <div>Gerado em: {agora()}</div>
                    <div style={{ marginTop: "4px" }}>v1.0</div>
                </div>
            </div>

            {/* ── Dados do Cliente ── */}
            <h3 style={h3Style}>DADOS DO CLIENTE</h3>
            <table style={tableStyle}>
                <thead>
                    <tr>
                        <th style={thStyle}>Nome</th>
                        <th style={thStyle}>CNPJ / CPF</th>
                        <th style={thStyle}>Cidade / Estado</th>
                        <th style={thStyle}>Plano</th>
                        <th style={thStyle}>Limite Horas Tecnicas</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style={tdStyle}>{cliente.nome || "—"}</td>
                        <td style={tdStyle}>{cliente.cnpj || cliente.cpf || "—"}</td>
                        <td style={tdStyle}>
                            {[cliente.cidade, cliente.estado].filter(Boolean).join(" / ") || "—"}
                        </td>
                        <td style={tdStyle}>{plano?.nome || "Sem plano"}</td>
                        <td style={tdStyle}>
                            {plano?.limite_horas_tecnicas != null
                                ? (Number(plano.limite_horas_tecnicas) || 0).toLocaleString("pt-BR", {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                  }) + "h"
                                : "—"}
                        </td>
                    </tr>
                </tbody>
            </table>

            {/* ── Resumo de Horas ── */}
            <h3 style={h3Style}>RESUMO DE HORAS</h3>
            <table style={tableStyle}>
                <thead>
                    <tr>
                        <th style={thStyle}>Categoria</th>
                        <th style={{ ...thStyle, textAlign: "right" }}>Horas</th>
                        <th style={{ ...thStyle, textAlign: "right" }}>Valor</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style={tdStyle}>Horas do Plano</td>
                        <td style={{ ...tdStyle, textAlign: "right" }}>
                            {(resumo.horas_plano || 0).toLocaleString("pt-BR", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            }) + "h"}
                        </td>
                        <td style={{ ...tdStyle, textAlign: "right" }}>—</td>
                    </tr>
                    <tr>
                        <td style={tdStyle}>Cobertas pelo Plano</td>
                        <td style={{ ...tdStyle, textAlign: "right" }}>
                            {(resumo.horas_tecnicas_cobertas || 0).toLocaleString("pt-BR", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            }) + "h"}
                        </td>
                        <td style={{ ...tdStyle, textAlign: "right" }}>—</td>
                    </tr>
                    <tr>
                        <td style={tdStyle}>Excedentes</td>
                        <td style={{ ...tdStyle, textAlign: "right" }}>
                            {(resumo.horas_tecnicas_excedentes || 0).toLocaleString("pt-BR", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            }) + "h"}
                        </td>
                        <td style={{ ...tdStyle, textAlign: "right" }}>
                            {(resumo.valor_horas_excedentes || 0).toLocaleString("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                            })}
                        </td>
                    </tr>
                    <tr>
                        <td style={tdStyle}>Avulsas</td>
                        <td style={{ ...tdStyle, textAlign: "right" }}>
                            {(resumo.horas_tecnicas_avulsas || 0).toLocaleString("pt-BR", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            }) + "h"}
                        </td>
                        <td style={{ ...tdStyle, textAlign: "right" }}>
                            {(resumo.valor_horas_avulsas || 0).toLocaleString("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                            })}
                        </td>
                    </tr>
                    <tr style={{ fontWeight: "bold", backgroundColor: "#f0f0f0" }}>
                        <td style={tdStyle}>TOTAL</td>
                        <td style={{ ...tdStyle, textAlign: "right" }}>
                            {(resumo.total_horas || 0).toLocaleString("pt-BR", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            }) + "h"}
                        </td>
                        <td style={{ ...tdStyle, textAlign: "right" }}>
                            {(resumo.valor_total_a_pagar || 0).toLocaleString("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                            })}
                        </td>
                    </tr>
                </tbody>
            </table>

            {/* ── Legenda ── */}
            <h3 style={h3Style}>LEGENDA</h3>
            <p style={{ fontSize: "9pt", color: "#333", marginBottom: "4px", lineHeight: "1.6" }}>
                <strong>Horas do Plano:</strong> Servicos incluidos no escopo do plano mensal, sem custo adicional.{" "}
                <strong>Cobertas pelo Plano:</strong> Horas tecnicas extras absorvidas pelo saldo disponivel.{" "}
                <strong>Excedentes:</strong> Horas tecnicas acima do limite do plano, cobradas pelo valor contratual.{" "}
                <strong>Avulsas:</strong> Servicos realizados fora do plano, cobrados individualmente.
            </p>

            {/* ── Pendencias ── */}
            {pendencias.length > 0 && (
                <>
                    <h3 style={h3Style}>PENDENCIAS</h3>
                    <table style={tableStyle}>
                        <thead>
                            <tr>
                                <th style={thStyle}>Titulo</th>
                                <th style={thStyle}>Dominio</th>
                                <th style={thStyle}>Status</th>
                                <th style={{ ...thStyle, textAlign: "right" }}>Horas</th>
                                <th style={thStyle}>Criada em</th>
                                <th style={thStyle}>Plano</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pendencias.map((p) => (
                                <tr key={p.id}>
                                    <td style={tdStyle}>{p.titulo || "—"}</td>
                                    <td style={tdStyle}>{p.dominio || "—"}</td>
                                    <td style={tdStyle}>{statusLabel(p.status)}</td>
                                    <td style={{ ...tdStyle, textAlign: "right" }}>
                                        {(p.horas || 0).toLocaleString("pt-BR", {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        }) + "h"}
                                    </td>
                                    <td style={tdStyle}>{formatDataBR(p.criada_em)}</td>
                                    <td style={tdStyle}>{p.plano || "—"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </>
            )}

            {/* ── Historico de Chamados (tipo=completo) ── */}
            {tipo === "completo" && chamados.length > 0 && (
                <>
                    <h3 style={h3Style}>HISTORICO DE CHAMADOS</h3>
                    {chamados.map((c) => {
                        const demandas = c.demandas || [];
                        const pct = calcPct(demandas);
                        return (
                            <div key={c.id} style={{ marginBottom: "20px", pageBreakInside: "avoid" }}>
                                {/* Tabela do chamado */}
                                <table style={{ ...tableStyle, marginBottom: "4px" }}>
                                    <thead>
                                        <tr>
                                            <th style={thStyle}>#ID</th>
                                            <th style={thStyle}>Dominio</th>
                                            <th style={thStyle}>Status</th>
                                            <th style={{ ...thStyle, textAlign: "center" }}>% Concluido</th>
                                            <th style={{ ...thStyle, textAlign: "center" }}>Qtd Demandas</th>
                                            <th style={thStyle}>Data</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td style={{ ...tdStyle, fontWeight: "bold" }}>#{c.id}</td>
                                            <td style={tdStyle}>{c.dominio || "—"}</td>
                                            <td style={tdStyle}>{statusLabel(c.status)}</td>
                                            <td style={{ ...tdStyle, textAlign: "center" }}>{pct}%</td>
                                            <td style={{ ...tdStyle, textAlign: "center" }}>{demandas.length}</td>
                                            <td style={tdStyle}>{formatDataBR(c.criado_em)}</td>
                                        </tr>
                                    </tbody>
                                </table>

                                {/* Sub-tabela de demandas */}
                                {demandas.length > 0 && (
                                    <table style={{ ...tableStyle, fontSize: "9pt" }}>
                                        <thead>
                                            <tr>
                                                <th style={{ ...thStyle, backgroundColor: "#2d4068" }}>Titulo</th>
                                                <th style={{ ...thStyle, backgroundColor: "#2d4068" }}>Classificacao</th>
                                                <th style={{ ...thStyle, backgroundColor: "#2d4068", textAlign: "right" }}>Horas</th>
                                                <th style={{ ...thStyle, backgroundColor: "#2d4068", textAlign: "right" }}>Valor</th>
                                                <th style={{ ...thStyle, backgroundColor: "#2d4068" }}>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {demandas.map((d) => (
                                                <tr key={d.id}>
                                                    <td style={tdStyle}>{d.titulo || "—"}</td>
                                                    <td style={tdStyle}>{classificacaoLabel(d.classificacao)}</td>
                                                    <td style={{ ...tdStyle, textAlign: "right" }}>
                                                        {(d.horas || 0).toLocaleString("pt-BR", {
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2,
                                                        }) + "h"}
                                                    </td>
                                                    <td style={{ ...tdStyle, textAlign: "right" }}>
                                                        {(d.valor || 0).toLocaleString("pt-BR", {
                                                            style: "currency",
                                                            currency: "BRL",
                                                        })}
                                                    </td>
                                                    <td style={tdStyle}>{statusLabel(d.status)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        );
                    })}
                </>
            )}

            {/* ── Rodape ── */}
            <div
                style={{
                    marginTop: "24px",
                    borderTop: "1px solid #ccc",
                    paddingTop: "8px",
                    fontSize: "9pt",
                    color: "#777",
                    textAlign: "center",
                }}
            >
                Documento gerado em {agora()} — Demand3 / SiteCare
            </div>
        </div>
    );
}

// ─── Badge helpers ───────────────────────────────────────────────────────────

const statusBadge = (status) => {
    const map = {
        aberto: "bg-yellow-100 text-yellow-800",
        em_andamento: "bg-blue-100 text-blue-800",
        concluido: "bg-green-100 text-green-800",
        cancelado: "bg-gray-100 text-gray-600",
    };
    const labels = {
        aberto: "Aberto",
        em_andamento: "Em andamento",
        concluido: "Concluído",
        cancelado: "Cancelado",
    };
    const cls = map[status] || "bg-gray-100 text-gray-600";
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}>
            {labels[status] || status}
        </span>
    );
};

const classificacaoBadge = (classificacao) => {
    const map = {
        plano: { cls: "bg-green-100 text-green-800", label: "Plano" },
        coberta_pelo_plano: { cls: "bg-blue-100 text-blue-800", label: "Coberta" },
        excedente: { cls: "bg-amber-100 text-amber-800", label: "Excedente" },
        avulsa: { cls: "bg-red-100 text-red-800", label: "Avulsa" },
    };
    const item = map[classificacao] || { cls: "bg-gray-100 text-gray-600", label: classificacao };
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${item.cls}`}>
            {item.label}
        </span>
    );
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function LoadingSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-28" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-32" />
                ))}
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-24" />
        </div>
    );
}

function SummaryCard({ title, icon, value, sub, colorBg, colorText, colorBorder }) {
    return (
        <div className={`bg-white rounded-xl shadow-sm border ${colorBorder} p-6`}>
            <div className="flex items-start justify-between mb-3">
                <span className={`text-2xl`}>{icon}</span>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${colorBg} ${colorText}`}>
                    {title}
                </span>
            </div>
            <p className={`text-3xl font-bold ${colorText}`}>{value}</p>
            {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
        </div>
    );
}

function AccordionChamado({ chamado }) {
    const [open, setOpen] = useState(false);

    return (
        <div className="border border-gray-200 rounded-xl overflow-hidden">
            <button
                onClick={() => setOpen((o) => !o)}
                className="w-full flex items-center justify-between px-5 py-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
            >
                <div className="flex flex-wrap items-center gap-3">
                    <span className="font-semibold text-gray-800">#{chamado.id}</span>
                    {chamado.dominio && (
                        <span className="text-sm text-gray-500">{chamado.dominio}</span>
                    )}
                    {statusBadge(chamado.status)}
                    <span className="text-xs text-gray-400">{chamado.criado_em}</span>
                </div>
                <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                    <span className="text-xs text-gray-500 hidden sm:inline">
                        {chamado.demandas?.length || 0} demanda(s)
                    </span>
                    <svg
                        className={`w-5 h-5 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </button>

            {open && (
                <div className="divide-y divide-gray-100">
                    {chamado.mensagem && (
                        <div className="px-5 py-3 bg-white">
                            <p className="text-sm text-gray-600 italic">"{chamado.mensagem}"</p>
                        </div>
                    )}
                    {(chamado.demandas || []).length === 0 ? (
                        <div className="px-5 py-4 text-sm text-gray-400">Nenhuma demanda neste chamado.</div>
                    ) : (
                        (chamado.demandas || []).map((d) => (
                            <div key={d.id} className="px-5 py-4 bg-white hover:bg-gray-50 transition-colors">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div className="flex flex-wrap items-center gap-2 min-w-0">
                                        {classificacaoBadge(d.classificacao)}
                                        <span className="font-medium text-gray-800 text-sm truncate">{d.titulo}</span>
                                        {statusBadge(d.status)}
                                    </div>
                                    <div className="flex items-center gap-4 text-sm flex-shrink-0">
                                        <span className="font-semibold text-gray-700">{formatHoras(d.horas)}</span>
                                        <span className={d.valor > 0 ? "text-amber-700 font-semibold" : "text-gray-400"}>
                                            {d.valor > 0 ? formatMoeda(d.valor) : "Sem custo"}
                                        </span>
                                    </div>
                                </div>
                                {d.descricao && (
                                    <p className="text-xs text-gray-500 mt-1 ml-0 line-clamp-2">{d.descricao}</p>
                                )}
                                <p className="text-xs text-gray-400 mt-1">
                                    Criada em {d.criada_em}
                                    {d.atualizada_em && ` · Atualizada em ${d.atualizada_em}`}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function HoursReport() {
    const [dataInicio, setDataInicio] = useState(primeiroDiaMes());
    const [dataFim, setDataFim] = useState(ultimoDiaMes());
    const [tipo, setTipo] = useState("completo");
    const [loading, setLoading] = useState(false);
    const [relatorio, setRelatorio] = useState(null);
    const [erro, setErro] = useState(null);

    const gerarRelatorio = () => {
        if (!dataInicio || !dataFim) {
            toast.warning("Preencha as datas de início e fim.");
            return;
        }
        if (dataInicio > dataFim) {
            toast.warning("A data de início não pode ser maior que a data de fim.");
            return;
        }

        setLoading(true);
        setErro(null);
        setRelatorio(null);

        axiosClient
            .get("/relatorio", {
                params: { data_inicio: dataInicio, data_fim: dataFim, tipo },
            })
            .then(({ data }) => {
                setRelatorio(data.data);
            })
            .catch((err) => {
                const msg =
                    err?.response?.data?.message ||
                    "Não foi possível carregar o relatório. Tente novamente.";
                setErro(msg);
                toast.error(msg);
            })
            .finally(() => setLoading(false));
    };

    const imprimir = () => window.print();

    // ── Render ──────────────────────────────────────────────────────────────

    const resumo = relatorio?.resumo || {};
    const plano = relatorio?.cliente?.plano_atual;
    const pendencias = relatorio?.pendencias || [];
    const chamados = relatorio?.chamados || [];
    const periodo = relatorio?.periodo;

    return (
        <>
            <style>{`
                #print-report-client {
                    display: none;
                }
                @media print {
                    aside,
                    header,
                    nav,
                    .fixed,
                    .print\\:hidden,
                    #client-screen-view {
                        display: none !important;
                    }

                    html, body, #client-root, #defaultLayout, main {
                        margin: 0 !important;
                        padding: 0 !important;
                        background: #fff !important;
                        color: #000 !important;
                        min-height: auto !important;
                        height: auto !important;
                        overflow: visible !important;
                    }

                    #print-report-client {
                        display: block !important;
                        visibility: visible !important;
                        width: 100% !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }

                    @page {
                        size: A4 portrait;
                        margin: 1.5cm;
                    }
                }
            `}</style>

            {relatorio && (
                <PrintableReport relatorio={relatorio} />
            )}

            <div id="client-screen-view" className="max-w-6xl mx-auto space-y-6 print:hidden">

                {/* ── Título da Página ── */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Relatório de Horas</h1>
                        <p className="text-sm text-gray-500 mt-0.5">
                            Acompanhe o consumo de horas e custos do período selecionado.
                        </p>
                    </div>
                    {relatorio && (
                        <button
                            onClick={imprimir}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors print:hidden"
                        >
                            🖨️ Imprimir
                        </button>
                    )}
                </div>

                {/* ── Painel de Filtros ── */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 print:hidden">
                    <h2 className="text-sm font-semibold text-gray-700 mb-4">Filtros do Relatório</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Data Início</label>
                            <input
                                type="date"
                                value={dataInicio}
                                onChange={(e) => setDataInicio(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Data Fim</label>
                            <input
                                type="date"
                                value={dataFim}
                                onChange={(e) => setDataFim(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Tipo de Relatório</label>
                            <select
                                value={tipo}
                                onChange={(e) => setTipo(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            >
                                <option value="completo">Relatório Completo</option>
                                <option value="simples">Relatório Simples</option>
                            </select>
                        </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                        <button
                            onClick={gerarRelatorio}
                            disabled={loading}
                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Gerando…
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                            d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Gerar Relatório
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* ── Estado Inicial ── */}
                {!loading && !relatorio && !erro && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                        <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                                    d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Relatório de Horas</h3>
                        <p className="text-gray-500 text-sm max-w-sm mx-auto">
                            Selecione o período e clique em <strong>Gerar Relatório</strong> para visualizar seu relatório de horas.
                        </p>
                    </div>
                )}

                {/* ── Loading Skeleton ── */}
                {loading && <LoadingSkeleton />}

                {/* ── Erro ── */}
                {erro && !loading && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                        <p className="text-red-700 font-medium">⚠️ {erro}</p>
                        <button
                            onClick={gerarRelatorio}
                            className="mt-3 text-sm text-red-600 underline hover:no-underline"
                        >
                            Tentar novamente
                        </button>
                    </div>
                )}

                {/* ── Conteúdo do Relatório ── */}
                {relatorio && !loading && (
                    <div className="space-y-6">

                        {/* Período */}
                        {periodo && (
                            <p className="text-sm text-gray-500">
                                📅 Período:{" "}
                                <span className="font-semibold text-gray-700">
                                    {periodo.inicio} até {periodo.fim}
                                </span>
                            </p>
                        )}

                        {/* ── Card do Plano Atual ── */}
                        {plano ? (
                            <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-xl p-6 text-white shadow-md">
                                <div className="flex flex-wrap items-start justify-between gap-4">
                                    <div>
                                        <p className="text-indigo-200 text-xs font-medium uppercase tracking-wide mb-1">Plano Atual</p>
                                        <h2 className="text-2xl font-bold">{plano.nome}</h2>
                                        <p className="text-indigo-200 text-sm mt-1">
                                            Limite de {formatHoras(plano.limite_horas_tecnicas)} técnicas ·{" "}
                                            {formatMoeda(plano.valor_hora)}/hora excedente
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-indigo-200 text-xs font-medium uppercase tracking-wide mb-1">Horas Disponíveis</p>
                                        <p className="text-4xl font-bold">{formatHoras(plano.horas_disponiveis)}</p>
                                        <p className="text-indigo-200 text-sm">saldo restante</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-gray-100 border border-gray-200 rounded-xl p-5 text-center text-sm text-gray-600">
                                Sem plano ativo — horas cobradas pelo valor avulso
                            </div>
                        )}

                        {/* ── Grid de 4 Cards de Resumo ── */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <SummaryCard
                                title="Horas do Plano"
                                icon="🟢"
                                value={formatHoras(resumo.horas_plano)}
                                sub="Cobertas pelo escopo do seu plano"
                                colorBg="bg-green-100"
                                colorText="text-green-700"
                                colorBorder="border-green-100"
                            />
                            <SummaryCard
                                title="Horas Cobertas"
                                icon="🔵"
                                value={formatHoras(resumo.horas_tecnicas_cobertas)}
                                sub="Absorvidas pelo saldo disponível"
                                colorBg="bg-blue-100"
                                colorText="text-blue-700"
                                colorBorder="border-blue-100"
                            />
                            <SummaryCard
                                title="Horas Excedentes"
                                icon="🟠"
                                value={formatHoras(resumo.horas_tecnicas_excedentes)}
                                sub={resumo.valor_horas_excedentes > 0 ? formatMoeda(resumo.valor_horas_excedentes) : "Sem custo extra"}
                                colorBg="bg-amber-100"
                                colorText="text-amber-700"
                                colorBorder="border-amber-100"
                            />
                            <SummaryCard
                                title="Horas Avulsas"
                                icon="🔴"
                                value={formatHoras(resumo.horas_tecnicas_avulsas)}
                                sub={resumo.valor_horas_avulsas > 0 ? formatMoeda(resumo.valor_horas_avulsas) : "Sem custo extra"}
                                colorBg="bg-red-100"
                                colorText="text-red-700"
                                colorBorder="border-red-100"
                            />
                        </div>

                        {/* ── Card de Total ── */}
                        <div className="bg-gray-900 rounded-xl p-6 text-white shadow-md">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div>
                                    <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Total de Horas</p>
                                    <p className="text-3xl font-bold">{formatHoras(resumo.total_horas)}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Valor a Pagar</p>
                                    <p className="text-3xl font-bold text-amber-400">{formatMoeda(resumo.valor_total_a_pagar)}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Chamados</p>
                                    <p className="text-3xl font-bold">{resumo.total_chamados ?? 0}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Demandas</p>
                                    <p className="text-3xl font-bold">{resumo.total_demandas ?? 0}</p>
                                </div>
                            </div>
                        </div>

                        {/* ── Legenda Explicativa ── */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-sm font-semibold text-blue-800 mb-2">ℹ️ Entenda as categorias</p>
                            <ul className="space-y-1 text-xs text-blue-700">
                                <li><span className="font-semibold">🟢 Horas do Plano:</span> Horas de serviços incluídas no escopo do seu plano mensal, sem custo adicional.</li>
                                <li><span className="font-semibold">🔵 Horas Técnicas Cobertas:</span> Horas extras de suporte técnico absorvidas pelo seu saldo de horas disponível no plano.</li>
                                <li><span className="font-semibold">🟠 Horas Excedentes:</span> Horas técnicas que ultrapassaram o limite do plano. Cada hora é cobrada pelo valor definido no contrato.</li>
                                <li><span className="font-semibold">🔴 Horas Avulsas:</span> Horas de serviços realizados fora do plano, cobradas individualmente conforme acordo.</li>
                            </ul>
                        </div>

                        {/* ── Seção Pendências ── */}
                        {pendencias.length > 0 && (
                            <div className="space-y-3">
                                <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-4">
                                    <h3 className="font-semibold text-yellow-800 mb-1">⚠️ Demandas Pendentes de Meses Anteriores</h3>
                                    <p className="text-xs text-yellow-700">
                                        Estas demandas estão em aberto e serão incluídas nos próximos relatórios até a conclusão.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {pendencias.map((p) => (
                                        <div key={p.id} className="bg-white rounded-xl shadow-sm border border-yellow-100 p-5">
                                            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                                                <span className="font-semibold text-gray-800 text-sm">{p.titulo}</span>
                                                {statusBadge(p.status)}
                                            </div>
                                            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                                                {p.dominio && <span>🌐 {p.dominio}</span>}
                                                <span>⏱ {formatHoras(p.horas)}</span>
                                                <span>📅 {p.criada_em}</span>
                                                {p.plano && <span>📋 {p.plano}</span>}
                                            </div>
                                            {p.descricao && (
                                                <p className="text-xs text-gray-400 mt-2 line-clamp-2">{p.descricao}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ── Seção Histórico de Chamados (COMPLETO) ── */}
                        {relatorio.tipo === "completo" && chamados.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="text-lg font-semibold text-gray-800">📋 Histórico de Chamados</h3>
                                <div className="space-y-3">
                                    {chamados.map((c) => (
                                        <AccordionChamado key={c.id} chamado={c} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ── Seção Resumo por Chamado (SIMPLES) ── */}
                        {relatorio.tipo === "simples" && chamados.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="text-lg font-semibold text-gray-800">📋 Resumo por Chamado</h3>
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="bg-gray-50 text-left">
                                                    <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Chamado</th>
                                                    <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Domínio</th>
                                                    <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Status</th>
                                                    <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide text-center">Demandas</th>
                                                    <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide text-right">H. Plano</th>
                                                    <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide text-right">H. Cobertas</th>
                                                    <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide text-right">H. Excedentes</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {chamados.map((c) => {
                                                    const demandas = c.demandas || [];
                                                    const hPlano = demandas
                                                        .filter((d) => d.classificacao === "plano")
                                                        .reduce((acc, d) => acc + (d.horas || 0), 0);
                                                    const hCobertas = demandas
                                                        .filter((d) => d.classificacao === "coberta_pelo_plano")
                                                        .reduce((acc, d) => acc + (d.horas || 0), 0);
                                                    const hExcedentes = demandas
                                                        .filter((d) => d.classificacao === "excedente")
                                                        .reduce((acc, d) => acc + (d.horas || 0), 0);
                                                    return (
                                                        <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                                                            <td className="px-4 py-3 font-medium text-gray-800">
                                                                #{c.id}
                                                                <span className="block text-xs text-gray-400">{c.criado_em}</span>
                                                            </td>
                                                            <td className="px-4 py-3 text-gray-600">{c.dominio || "—"}</td>
                                                            <td className="px-4 py-3">{statusBadge(c.status)}</td>
                                                            <td className="px-4 py-3 text-center text-gray-700">{demandas.length}</td>
                                                            <td className="px-4 py-3 text-right text-green-700 font-medium">{formatHoras(hPlano)}</td>
                                                            <td className="px-4 py-3 text-right text-blue-700 font-medium">{formatHoras(hCobertas)}</td>
                                                            <td className="px-4 py-3 text-right text-amber-700 font-medium">{formatHoras(hExcedentes)}</td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {chamados.length === 0 && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-400 text-sm">
                                Nenhum chamado encontrado no período selecionado.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}
