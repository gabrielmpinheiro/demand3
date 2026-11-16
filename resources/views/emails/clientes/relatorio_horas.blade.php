@extends('emails.layout')

@section('titulo', 'Relatório de Horas — ' . $cliente->nome)

@section('content')

@php
    $resumo  = $relatorio['resumo'];
    $periodo = $relatorio['periodo'];
    $tipo    = $relatorio['tipo'];
    $plano   = $relatorio['cliente']['plano_atual'] ?? null;

    $periodoLabel = \Carbon\Carbon::parse($periodo['inicio'])->format('d/m/Y')
        . ' a ' . \Carbon\Carbon::parse($periodo['fim'])->format('d/m/Y');

    $geradoEm = now()->format('d/m/Y \à\s H:i');
@endphp

{{-- ══════════════════════════════════════════════════════════════
     CABEÇALHO OFICIAL DO RELATÓRIO
══════════════════════════════════════════════════════════════ --}}
<table width="100%" cellpadding="0" cellspacing="0" style="border-bottom:3px solid #1a2b4a;padding-bottom:16px;margin-bottom:20px;">
    <tr>
        <td style="vertical-align:middle;width:50%;">
            <img src="{{ asset('logo.png') }}" alt="Demand3" height="40" style="display:block;">
            <p style="margin:4px 0 0;font-size:11px;color:#666;">Demand3 / SiteCare</p>
        </td>
        <td style="vertical-align:middle;text-align:right;width:50%;">
            <p style="margin:0;font-size:18px;font-weight:bold;color:#1a2b4a;">Relatório de Horas</p>
            <p style="margin:4px 0 0;font-size:11px;color:#666;">Gerado em: {{ $geradoEm }}</p>
            <p style="margin:2px 0 0;font-size:11px;color:#666;">Período: <strong>{{ $periodoLabel }}</strong></p>
            <p style="margin:2px 0 0;font-size:10px;color:#aaa;">v1.0 — Relatório {{ ucfirst($tipo) }}</p>
        </td>
    </tr>
</table>

{{-- ══════════════════════════════════════════════════════════════
     DADOS DO CLIENTE
══════════════════════════════════════════════════════════════ --}}
<h3 style="font-size:13px;font-weight:bold;color:#1a2b4a;border-bottom:1px solid #ccc;padding-bottom:4px;margin:0 0 10px;">
    DADOS DO CLIENTE
</h3>
<table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:12px;margin-bottom:20px;background:#f9f9f9;border:1px solid #e0e0e0;border-radius:4px;">
    <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #e0e0e0;width:30%;font-weight:bold;color:#555;">Cliente</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e0e0e0;color:#222;">{{ $cliente->nome }}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e0e0e0;width:20%;font-weight:bold;color:#555;">E-mail</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e0e0e0;color:#222;">{{ $cliente->email }}</td>
    </tr>
    <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #e0e0e0;font-weight:bold;color:#555;">
            @if($cliente->cnpj) CNPJ @elseif($cliente->cpf) CPF @else Documento @endif
        </td>
        <td style="padding:8px 12px;border-bottom:1px solid #e0e0e0;color:#222;">
            {{ $cliente->cnpj ?? $cliente->cpf ?? '—' }}
        </td>
        <td style="padding:8px 12px;border-bottom:1px solid #e0e0e0;font-weight:bold;color:#555;">Localização</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e0e0e0;color:#222;">
            {{ implode(', ', array_filter([$cliente->cidade ?? null, $cliente->estado ?? null])) ?: '—' }}
        </td>
    </tr>
    @if($plano)
    <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #e0e0e0;font-weight:bold;color:#555;">Plano Atual</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e0e0e0;color:#222;">{{ $plano['nome'] }}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e0e0e0;font-weight:bold;color:#555;">Limite Horas Técnicas</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e0e0e0;color:#222;">
            {{ number_format($plano['limite_horas_tecnicas'], 2, ',', '.') }}h
            &nbsp;·&nbsp; R$ {{ number_format($plano['valor_hora'], 2, ',', '.') }}/h excedente
        </td>
    </tr>
    <tr>
        <td style="padding:8px 12px;font-weight:bold;color:#555;">Saldo Disponível</td>
        <td style="padding:8px 12px;color:#1a7a2a;font-weight:bold;">{{ number_format($plano['horas_disponiveis'], 2, ',', '.') }}h</td>
        <td style="padding:8px 12px;font-weight:bold;color:#555;">Tipo de Relatório</td>
        <td style="padding:8px 12px;color:#222;">{{ ucfirst($tipo) }}</td>
    </tr>
    @else
    <tr>
        <td style="padding:8px 12px;font-weight:bold;color:#555;">Plano</td>
        <td colspan="3" style="padding:8px 12px;color:#c05000;">Sem plano ativo — cobrança por hora avulsa</td>
    </tr>
    @endif
</table>

{{-- ══════════════════════════════════════════════════════════════
     RESUMO DE HORAS
══════════════════════════════════════════════════════════════ --}}
<h3 style="font-size:13px;font-weight:bold;color:#1a2b4a;border-bottom:1px solid #ccc;padding-bottom:4px;margin:0 0 10px;">
    RESUMO DE HORAS
</h3>
<table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:12px;margin-bottom:12px;">
    <thead>
        <tr style="background-color:#1a2b4a;color:#fff;">
            <th style="padding:9px 12px;text-align:left;border:1px solid #0f1c33;">Categoria</th>
            <th style="padding:9px 12px;text-align:center;border:1px solid #0f1c33;">Horas</th>
            <th style="padding:9px 12px;text-align:right;border:1px solid #0f1c33;">Valor</th>
            <th style="padding:9px 12px;text-align:left;border:1px solid #0f1c33;font-size:10px;">Observação</th>
        </tr>
    </thead>
    <tbody>
        {{-- Horas do Plano --}}
        @if($resumo['horas_plano'] > 0)
        <tr style="background-color:#f0f8f0;">
            <td style="padding:8px 12px;border:1px solid #d0e8d0;font-weight:bold;">Horas do Plano</td>
            <td style="padding:8px 12px;border:1px solid #d0e8d0;text-align:center;">{{ number_format($resumo['horas_plano'], 2, ',', '.') }}h</td>
            <td style="padding:8px 12px;border:1px solid #d0e8d0;text-align:right;color:#2a7a2a;font-weight:bold;">R$ 0,00</td>
            <td style="padding:8px 12px;border:1px solid #d0e8d0;font-size:10px;color:#666;">Cobertas pelo escopo do plano contratado — sem custo adicional</td>
        </tr>
        @endif

        {{-- Horas Técnicas Cobertas --}}
        @if($resumo['horas_tecnicas_cobertas'] > 0)
        <tr style="background-color:#f0f4fa;">
            <td style="padding:8px 12px;border:1px solid #d0daf0;font-weight:bold;">Horas Técnicas — Cobertas pelo Plano</td>
            <td style="padding:8px 12px;border:1px solid #d0daf0;text-align:center;">{{ number_format($resumo['horas_tecnicas_cobertas'], 2, ',', '.') }}h</td>
            <td style="padding:8px 12px;border:1px solid #d0daf0;text-align:right;color:#2a7a2a;font-weight:bold;">R$ 0,00</td>
            <td style="padding:8px 12px;border:1px solid #d0daf0;font-size:10px;color:#666;">Horas técnicas absorvidas pelo saldo disponível do plano — sem custo</td>
        </tr>
        @endif

        {{-- Horas Técnicas Excedentes --}}
        @if($resumo['horas_tecnicas_excedentes'] > 0)
        <tr style="background-color:#fff8f0;">
            <td style="padding:8px 12px;border:1px solid #f0d8b0;font-weight:bold;">Horas Técnicas — Excedentes ao Plano</td>
            <td style="padding:8px 12px;border:1px solid #f0d8b0;text-align:center;">{{ number_format($resumo['horas_tecnicas_excedentes'], 2, ',', '.') }}h</td>
            <td style="padding:8px 12px;border:1px solid #f0d8b0;text-align:right;color:#c05000;font-weight:bold;">R$ {{ number_format($resumo['valor_horas_excedentes'], 2, ',', '.') }}</td>
            <td style="padding:8px 12px;border:1px solid #f0d8b0;font-size:10px;color:#666;">Ultrapassaram o saldo disponível — R$ {{ number_format($resumo['valor_hora_referencia'], 2, ',', '.') }}/h</td>
        </tr>
        @endif

        {{-- Horas Avulsas --}}
        @if($resumo['horas_tecnicas_avulsas'] > 0)
        <tr style="background-color:#fff0f0;">
            <td style="padding:8px 12px;border:1px solid #f0c0c0;font-weight:bold;">Horas Avulsas</td>
            <td style="padding:8px 12px;border:1px solid #f0c0c0;text-align:center;">{{ number_format($resumo['horas_tecnicas_avulsas'], 2, ',', '.') }}h</td>
            <td style="padding:8px 12px;border:1px solid #f0c0c0;text-align:right;color:#c00000;font-weight:bold;">R$ {{ number_format($resumo['valor_horas_avulsas'], 2, ',', '.') }}</td>
            <td style="padding:8px 12px;border:1px solid #f0c0c0;font-size:10px;color:#666;">Executadas sem plano ativo — cobrança pelo valor integral</td>
        </tr>
        @endif

        {{-- Total --}}
        <tr style="background-color:#1a2b4a;color:#fff;font-weight:bold;">
            <td style="padding:10px 12px;border:1px solid #0f1c33;">
                TOTAL
                <span style="font-weight:normal;font-size:10px;display:block;color:#a8c0e0;">
                    {{ $resumo['total_chamados'] }} chamado(s) &nbsp;·&nbsp; {{ $resumo['total_demandas'] }} demanda(s)
                </span>
            </td>
            <td style="padding:10px 12px;border:1px solid #0f1c33;text-align:center;">
                {{ number_format($resumo['total_horas'], 2, ',', '.') }}h
            </td>
            <td style="padding:10px 12px;border:1px solid #0f1c33;text-align:right;font-size:14px;">
                R$ {{ number_format($resumo['valor_total_a_pagar'], 2, ',', '.') }}
            </td>
            <td style="padding:10px 12px;border:1px solid #0f1c33;font-size:10px;color:#a8c0e0;">
                @if($resumo['valor_total_a_pagar'] > 0)
                    Valor total a ser cobrado no período
                @else
                    Sem cobranças no período
                @endif
            </td>
        </tr>
    </tbody>
</table>

{{-- Legenda --}}
<div style="padding:10px 14px;background:#f5f5f5;border:1px solid #e0e0e0;border-radius:4px;font-size:10px;color:#555;margin-bottom:20px;">
    <strong>Legenda das categorias:</strong><br>
    <strong>Horas do Plano</strong> — Cobertas integralmente pelo plano contratado (sem custo).<br>
    <strong>Horas Técnicas Cobertas</strong> — Horas técnicas absorvidas pelo saldo disponível do plano (sem custo).<br>
    <strong>Horas Técnicas Excedentes</strong> — Horas que ultrapassaram o saldo do plano e estão sujeitas a cobrança.<br>
    <strong>Horas Avulsas</strong> — Executadas sem plano ativo, cobradas pelo valor integral acordado.
</div>

{{-- ══════════════════════════════════════════════════════════════
     PENDÊNCIAS (meses anteriores)
══════════════════════════════════════════════════════════════ --}}
@if(!empty($relatorio['pendencias']))
<h3 style="font-size:13px;font-weight:bold;color:#c05000;border-bottom:1px solid #f0c080;padding-bottom:4px;margin:0 0 10px;">
    PENDENCIAS — DEMANDAS EM ABERTO DE MESES ANTERIORES
</h3>
<table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:12px;margin-bottom:20px;">
    <thead>
        <tr style="background-color:#fce8d5;">
            <th style="padding:8px 12px;text-align:left;border:1px solid #f0c090;">Demanda</th>
            <th style="padding:8px 12px;text-align:left;border:1px solid #f0c090;">Domínio</th>
            <th style="padding:8px 12px;text-align:left;border:1px solid #f0c090;">Status</th>
            <th style="padding:8px 12px;text-align:center;border:1px solid #f0c090;">Horas</th>
            <th style="padding:8px 12px;text-align:left;border:1px solid #f0c090;">Desde</th>
        </tr>
    </thead>
    <tbody>
        @foreach($relatorio['pendencias'] as $p)
        <tr style="border-bottom:1px solid #f0d0b0;">
            <td style="padding:7px 12px;border:1px solid #f0d0b0;">{{ $p['titulo'] }}</td>
            <td style="padding:7px 12px;border:1px solid #f0d0b0;">{{ $p['dominio'] ?? '—' }}</td>
            <td style="padding:7px 12px;border:1px solid #f0d0b0;">{{ ucfirst(str_replace('_', ' ', $p['status'])) }}</td>
            <td style="padding:7px 12px;border:1px solid #f0d0b0;text-align:center;">{{ number_format($p['horas'], 2, ',', '.') }}h</td>
            <td style="padding:7px 12px;border:1px solid #f0d0b0;">{{ $p['criada_em'] }}</td>
        </tr>
        @endforeach
    </tbody>
</table>
@endif

{{-- ══════════════════════════════════════════════════════════════
     HISTÓRICO DE CHAMADOS (apenas tipo COMPLETO)
══════════════════════════════════════════════════════════════ --}}
@if($tipo === 'completo' && !empty($relatorio['chamados']))
<h3 style="font-size:13px;font-weight:bold;color:#1a2b4a;border-bottom:1px solid #ccc;padding-bottom:4px;margin:0 0 12px;">
    HISTÓRICO DE CHAMADOS DO PERÍODO
</h3>

{{-- Tabela resumo dos chamados --}}
<table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:12px;margin-bottom:16px;">
    <thead>
        <tr style="background-color:#2c3e6a;color:#fff;">
            <th style="padding:8px 12px;border:1px solid #1a2b4a;text-align:left;">#</th>
            <th style="padding:8px 12px;border:1px solid #1a2b4a;text-align:left;">Domínio</th>
            <th style="padding:8px 12px;border:1px solid #1a2b4a;text-align:left;">Status</th>
            <th style="padding:8px 12px;border:1px solid #1a2b4a;text-align:center;">% Concluído</th>
            <th style="padding:8px 12px;border:1px solid #1a2b4a;text-align:center;">Demandas</th>
            <th style="padding:8px 12px;border:1px solid #1a2b4a;text-align:left;">Data de Abertura</th>
        </tr>
    </thead>
    <tbody>
        @foreach($relatorio['chamados'] as $chamado)
        @php
            $totalDem    = count($chamado['demandas'] ?? []);
            $concluidas  = collect($chamado['demandas'] ?? [])->where('status', 'concluido')->count();
            $pct         = $totalDem > 0 ? round(($concluidas / $totalDem) * 100) : 0;
            $rowBg       = $loop->even ? '#f9f9f9' : '#ffffff';
        @endphp
        <tr style="background-color:{{ $rowBg }};">
            <td style="padding:7px 12px;border:1px solid #ddd;font-weight:bold;">#{{ $chamado['id'] }}</td>
            <td style="padding:7px 12px;border:1px solid #ddd;">{{ $chamado['dominio'] ?? '—' }}</td>
            <td style="padding:7px 12px;border:1px solid #ddd;">{{ ucfirst(str_replace('_', ' ', $chamado['status'])) }}</td>
            <td style="padding:7px 12px;border:1px solid #ddd;text-align:center;font-weight:bold;
                color:{{ $pct >= 100 ? '#1a7a2a' : ($pct >= 50 ? '#c05000' : '#c00000') }};">
                {{ $pct }}%
            </td>
            <td style="padding:7px 12px;border:1px solid #ddd;text-align:center;">{{ $totalDem }}</td>
            <td style="padding:7px 12px;border:1px solid #ddd;">{{ $chamado['criado_em'] }}</td>
        </tr>
        @endforeach
    </tbody>
</table>

{{-- Detalhamento por chamado com demandas --}}
@foreach($relatorio['chamados'] as $chamado)
@php
    $totalDem   = count($chamado['demandas'] ?? []);
    $concluidas = collect($chamado['demandas'] ?? [])->where('status', 'concluido')->count();
    $pct        = $totalDem > 0 ? round(($concluidas / $totalDem) * 100) : 0;
@endphp

<div style="border:1px solid #d0d8e8;border-radius:4px;margin-bottom:14px;overflow:hidden;">
    {{-- Cabeçalho do chamado --}}
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
        <tr style="background:#e8edf8;">
            <td style="padding:9px 12px;">
                <strong style="color:#1a2b4a;font-size:12px;">Chamado #{{ $chamado['id'] }}</strong>
                @if($chamado['dominio'] ?? false)
                    <span style="color:#666;font-size:11px;margin-left:8px;">{{ $chamado['dominio'] }}</span>
                @endif
                @if($chamado['mensagem'] ?? false)
                    <span style="color:#555;font-size:11px;display:block;margin-top:3px;font-style:italic;">
                        {{ \Illuminate\Support\Str::limit($chamado['mensagem'], 150) }}
                    </span>
                @endif
            </td>
            <td style="padding:9px 12px;text-align:right;white-space:nowrap;">
                <span style="font-size:11px;color:#555;">{{ ucfirst(str_replace('_', ' ', $chamado['status'])) }}</span>
                &nbsp;|&nbsp;
                <strong style="font-size:12px;color:{{ $pct >= 100 ? '#1a7a2a' : ($pct >= 50 ? '#c05000' : '#c00000') }};">
                    {{ $pct }}% concluído
                </strong>
                <span style="font-size:10px;color:#888;display:block;margin-top:2px;">
                    Aberto em {{ $chamado['criado_em'] }}
                </span>
            </td>
        </tr>
    </table>

    {{-- Tabela de demandas do chamado --}}
    @if(!empty($chamado['demandas']))
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:11px;">
        <thead>
            <tr style="background:#f5f5f5;">
                <th style="padding:6px 12px;text-align:left;border-top:1px solid #d0d8e8;border-bottom:1px solid #d0d8e8;color:#555;">Demanda</th>
                <th style="padding:6px 12px;text-align:left;border-top:1px solid #d0d8e8;border-bottom:1px solid #d0d8e8;color:#555;">Classificação</th>
                <th style="padding:6px 12px;text-align:center;border-top:1px solid #d0d8e8;border-bottom:1px solid #d0d8e8;color:#555;">Horas</th>
                <th style="padding:6px 12px;text-align:right;border-top:1px solid #d0d8e8;border-bottom:1px solid #d0d8e8;color:#555;">Valor</th>
                <th style="padding:6px 12px;text-align:left;border-top:1px solid #d0d8e8;border-bottom:1px solid #d0d8e8;color:#555;">Status</th>
            </tr>
        </thead>
        <tbody>
            @foreach($chamado['demandas'] as $demanda)
            @php
                $classBg = match($demanda['classificacao']) {
                    'plano'              => '#f0f8f0',
                    'coberta_pelo_plano' => '#f0f4fa',
                    'excedente'          => '#fff8f0',
                    'avulsa'             => '#fff0f0',
                    default              => '#fff',
                };
                $classLabel = match($demanda['classificacao']) {
                    'plano'              => 'Plano',
                    'coberta_pelo_plano' => 'Coberta pelo Plano',
                    'excedente'          => 'Excedente',
                    'avulsa'             => 'Avulsa',
                    default              => ucfirst($demanda['classificacao'] ?? '—'),
                };
                $valorExibir = ($demanda['classificacao'] === 'excedente' || $demanda['classificacao'] === 'avulsa')
                    ? ($demanda['valor_excedente'] ?? $demanda['valor'] ?? 0)
                    : ($demanda['valor'] ?? 0);
            @endphp
            <tr style="background-color:{{ $classBg }};border-top:1px solid #eeeeee;">
                <td style="padding:6px 12px;">{{ $demanda['titulo'] }}</td>
                <td style="padding:6px 12px;font-size:10px;">{{ $classLabel }}</td>
                <td style="padding:6px 12px;text-align:center;">{{ number_format($demanda['horas'], 2, ',', '.') }}h</td>
                <td style="padding:6px 12px;text-align:right;">
                    @if($valorExibir > 0)
                        <strong style="color:{{ in_array($demanda['classificacao'], ['excedente','avulsa']) ? '#c05000' : '#1a7a2a' }};">
                            R$ {{ number_format($valorExibir, 2, ',', '.') }}
                        </strong>
                    @else
                        <span style="color:#2a7a2a;">R$ 0,00</span>
                    @endif
                </td>
                <td style="padding:6px 12px;">{{ ucfirst(str_replace('_', ' ', $demanda['status'])) }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
    @else
    <p style="padding:8px 12px;font-size:11px;color:#999;margin:0;">Nenhuma demanda neste chamado.</p>
    @endif
</div>
@endforeach

@elseif($tipo === 'simples' && !empty($relatorio['chamados']))

{{-- Relatório Simples: apenas tabela resumo dos chamados --}}
<h3 style="font-size:13px;font-weight:bold;color:#1a2b4a;border-bottom:1px solid #ccc;padding-bottom:4px;margin:0 0 10px;">
    RESUMO POR CHAMADO
</h3>
<table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:12px;margin-bottom:20px;">
    <thead>
        <tr style="background-color:#1a2b4a;color:#fff;">
            <th style="padding:8px 12px;border:1px solid #0f1c33;text-align:left;">#</th>
            <th style="padding:8px 12px;border:1px solid #0f1c33;text-align:left;">Domínio</th>
            <th style="padding:8px 12px;border:1px solid #0f1c33;text-align:left;">Status</th>
            <th style="padding:8px 12px;border:1px solid #0f1c33;text-align:center;">% Concluído</th>
            <th style="padding:8px 12px;border:1px solid #0f1c33;text-align:center;">Demandas</th>
            <th style="padding:8px 12px;border:1px solid #0f1c33;text-align:left;">Data</th>
        </tr>
    </thead>
    <tbody>
        @foreach($relatorio['chamados'] as $chamado)
        @php
            $totalDem   = count($chamado['demandas'] ?? []);
            $concluidas = collect($chamado['demandas'] ?? [])->where('status', 'concluido')->count();
            $pct        = $totalDem > 0 ? round(($concluidas / $totalDem) * 100) : 0;
            $rowBg      = $loop->even ? '#f9f9f9' : '#ffffff';
        @endphp
        <tr style="background-color:{{ $rowBg }};">
            <td style="padding:7px 12px;border:1px solid #ddd;font-weight:bold;">#{{ $chamado['id'] }}</td>
            <td style="padding:7px 12px;border:1px solid #ddd;">{{ $chamado['dominio'] ?? '—' }}</td>
            <td style="padding:7px 12px;border:1px solid #ddd;">{{ ucfirst(str_replace('_', ' ', $chamado['status'])) }}</td>
            <td style="padding:7px 12px;border:1px solid #ddd;text-align:center;font-weight:bold;
                color:{{ $pct >= 100 ? '#1a7a2a' : ($pct >= 50 ? '#c05000' : '#c00000') }};">
                {{ $pct }}%
            </td>
            <td style="padding:7px 12px;border:1px solid #ddd;text-align:center;">{{ $totalDem }}</td>
            <td style="padding:7px 12px;border:1px solid #ddd;">{{ $chamado['criado_em'] }}</td>
        </tr>
        @endforeach
    </tbody>
</table>
@endif

{{-- ══════════════════════════════════════════════════════════════
     RODAPÉ
══════════════════════════════════════════════════════════════ --}}
<hr style="border:none;border-top:2px solid #1a2b4a;margin-top:28px;margin-bottom:12px;">
<p style="font-size:10px;color:#888;text-align:center;margin:0;">
    Documento gerado em <strong>{{ $geradoEm }}</strong> pelo sistema <strong>Demand3 / SiteCare</strong>.<br>
    Este relatório é de uso interno e destinado exclusivamente ao cliente {{ $cliente->nome }}.
</p>

@endsection
