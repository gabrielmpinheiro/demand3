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
@endphp

<h2 style="color:#1a2b4a;font-size:20px;margin-bottom:4px;">📊 Relatório de Horas</h2>
<p style="color:#666;font-size:13px;margin-bottom:24px;">Período: <strong>{{ $periodoLabel }}</strong></p>

{{-- ── Dados do Cliente ───────────────────────────────────────────────── --}}
<div class="info-box" style="margin-bottom:20px;">
    <p><strong>Cliente:</strong> {{ $cliente->nome }}</p>
    <p><strong>E-mail:</strong> {{ $cliente->email }}</p>
    @if($cliente->cnpj)
        <p><strong>CNPJ:</strong> {{ $cliente->cnpj }}</p>
    @elseif($cliente->cpf)
        <p><strong>CPF:</strong> {{ $cliente->cpf }}</p>
    @endif
    @if($plano)
        <p><strong>Plano Atual:</strong> {{ $plano['nome'] }} — {{ $plano['limite_horas_tecnicas'] }}h/mês</p>
        <p><strong>Valor da Hora:</strong> R$ {{ number_format($plano['valor_hora'], 2, ',', '.') }}</p>
        <p><strong>Saldo Disponível:</strong> {{ number_format($plano['horas_disponiveis'], 2, ',', '.') }}h</p>
    @else
        <p><strong>Plano:</strong> Sem plano ativo (hora avulsa)</p>
    @endif
</div>

{{-- ── Resumo de Horas ─────────────────────────────────────────────────── --}}
<h3 style="color:#1a2b4a;font-size:16px;margin:24px 0 12px;">⏱ Resumo de Horas</h3>
<table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:13px;">
    <thead>
        <tr style="background-color:#1a2b4a;color:#fff;">
            <th style="padding:10px 14px;text-align:left;">Categoria</th>
            <th style="padding:10px 14px;text-align:right;">Horas</th>
            <th style="padding:10px 14px;text-align:right;">Valor</th>
        </tr>
    </thead>
    <tbody>
        {{-- Horas do plano (escopo do plano, sem custo algum) --}}
        @if($resumo['horas_plano'] > 0)
        <tr style="background-color:#f0f8f0;">
            <td style="padding:10px 14px;border-bottom:1px solid #e0e0e0;">
                🟢 <strong>Horas do Plano</strong>
                <span style="color:#666;font-size:11px;display:block;">Cobertas pelo escopo do plano contratado</span>
            </td>
            <td style="padding:10px 14px;border-bottom:1px solid #e0e0e0;text-align:right;">
                {{ number_format($resumo['horas_plano'], 2, ',', '.') }}h
            </td>
            <td style="padding:10px 14px;border-bottom:1px solid #e0e0e0;text-align:right;color:#2a7a2a;font-weight:bold;">
                R$ 0,00
            </td>
        </tr>
        @endif

        {{-- Horas técnicas cobertas pelo saldo disponível do plano --}}
        @if($resumo['horas_tecnicas_cobertas'] > 0)
        <tr style="background-color:#f0f4fa;">
            <td style="padding:10px 14px;border-bottom:1px solid #e0e0e0;">
                🔵 <strong>Horas Técnicas — Cobertas pelo Plano</strong>
                <span style="color:#666;font-size:11px;display:block;">Horas técnicas dentro do saldo disponível</span>
            </td>
            <td style="padding:10px 14px;border-bottom:1px solid #e0e0e0;text-align:right;">
                {{ number_format($resumo['horas_tecnicas_cobertas'], 2, ',', '.') }}h
            </td>
            <td style="padding:10px 14px;border-bottom:1px solid #e0e0e0;text-align:right;color:#2a7a2a;font-weight:bold;">
                R$ 0,00
            </td>
        </tr>
        @endif

        {{-- Horas técnicas excedentes ao plano --}}
        @if($resumo['horas_tecnicas_excedentes'] > 0)
        <tr style="background-color:#fff8f0;">
            <td style="padding:10px 14px;border-bottom:1px solid #e0e0e0;">
                🟠 <strong>Horas Técnicas — Excedentes ao Plano</strong>
                <span style="color:#666;font-size:11px;display:block;">Ultrapassaram o saldo disponível, sujeitas a cobrança</span>
            </td>
            <td style="padding:10px 14px;border-bottom:1px solid #e0e0e0;text-align:right;">
                {{ number_format($resumo['horas_tecnicas_excedentes'], 2, ',', '.') }}h
            </td>
            <td style="padding:10px 14px;border-bottom:1px solid #e0e0e0;text-align:right;color:#c05000;font-weight:bold;">
                R$ {{ number_format($resumo['valor_horas_excedentes'], 2, ',', '.') }}
            </td>
        </tr>
        @endif

        {{-- Horas avulsas (sem plano) --}}
        @if($resumo['horas_tecnicas_avulsas'] > 0)
        <tr style="background-color:#fff0f0;">
            <td style="padding:10px 14px;border-bottom:1px solid #e0e0e0;">
                🔴 <strong>Horas Avulsas</strong>
                <span style="color:#666;font-size:11px;display:block;">Sem plano ativo — cobrança pelo valor integral</span>
            </td>
            <td style="padding:10px 14px;border-bottom:1px solid #e0e0e0;text-align:right;">
                {{ number_format($resumo['horas_tecnicas_avulsas'], 2, ',', '.') }}h
            </td>
            <td style="padding:10px 14px;border-bottom:1px solid #e0e0e0;text-align:right;color:#c00000;font-weight:bold;">
                R$ {{ number_format($resumo['valor_horas_avulsas'], 2, ',', '.') }}
            </td>
        </tr>
        @endif

        {{-- Total --}}
        <tr style="background-color:#1a2b4a;color:#fff;font-weight:bold;">
            <td style="padding:12px 14px;">
                TOTAL
                <span style="font-weight:normal;font-size:11px;display:block;color:#a8c0e0;">
                    {{ $resumo['total_chamados'] }} chamado(s) · {{ $resumo['total_demandas'] }} demanda(s)
                </span>
            </td>
            <td style="padding:12px 14px;text-align:right;">
                {{ number_format($resumo['total_horas'], 2, ',', '.') }}h
            </td>
            <td style="padding:12px 14px;text-align:right;font-size:16px;">
                R$ {{ number_format($resumo['valor_total_a_pagar'], 2, ',', '.') }}
            </td>
        </tr>
    </tbody>
</table>

{{-- ── Legenda das categorias ──────────────────────────────────────────── --}}
<div style="margin-top:16px;padding:12px 14px;background:#f9f9f9;border-radius:4px;font-size:11px;color:#666;">
    <strong>Legenda:</strong><br>
    🟢 <strong>Horas do Plano</strong> — Cobertas integralmente pelo plano contratado (sem custo).<br>
    🔵 <strong>Horas Técnicas Cobertas</strong> — Horas técnicas absorvidas pelo saldo disponível do plano (sem custo).<br>
    🟠 <strong>Horas Técnicas Excedentes</strong> — Horas que ultrapassaram o saldo do plano (valor a cobrar: R$ {{ number_format($resumo['valor_hora_referencia'], 2, ',', '.') }}/h).<br>
    🔴 <strong>Horas Avulsas</strong> — Executadas sem plano ativo, cobradas pelo valor integral.
</div>

{{-- ── Pendências ──────────────────────────────────────────────────────── --}}
@if(!empty($relatorio['pendencias']))
<h3 style="color:#c05000;font-size:16px;margin:28px 0 12px;">⚠️ Pendências (meses anteriores)</h3>
<table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:13px;">
    <thead>
        <tr style="background-color:#fce8d5;">
            <th style="padding:8px 12px;text-align:left;">Demanda</th>
            <th style="padding:8px 12px;text-align:left;">Domínio</th>
            <th style="padding:8px 12px;text-align:left;">Status</th>
            <th style="padding:8px 12px;text-align:right;">Horas</th>
            <th style="padding:8px 12px;text-align:left;">Desde</th>
        </tr>
    </thead>
    <tbody>
        @foreach($relatorio['pendencias'] as $p)
        <tr style="border-bottom:1px solid #f0d0b0;">
            <td style="padding:8px 12px;">{{ $p['titulo'] }}</td>
            <td style="padding:8px 12px;">{{ $p['dominio'] ?? '—' }}</td>
            <td style="padding:8px 12px;">{{ ucfirst(str_replace('_', ' ', $p['status'])) }}</td>
            <td style="padding:8px 12px;text-align:right;">{{ number_format($p['horas'], 2, ',', '.') }}h</td>
            <td style="padding:8px 12px;">{{ $p['criada_em'] }}</td>
        </tr>
        @endforeach
    </tbody>
</table>
@endif

{{-- ── Histórico de Chamados (apenas tipo COMPLETO) ────────────────────── --}}
@if($tipo === 'completo' && !empty($relatorio['chamados']))
<h3 style="color:#1a2b4a;font-size:16px;margin:28px 0 12px;">📋 Histórico de Chamados</h3>
@foreach($relatorio['chamados'] as $chamado)
<div style="border:1px solid #e0e0e0;border-radius:6px;margin-bottom:16px;overflow:hidden;">
    <div style="background:#f0f4fa;padding:10px 14px;border-bottom:1px solid #e0e0e0;">
        <strong style="color:#1a2b4a;">Chamado #{{ $chamado['id'] }}</strong>
        <span style="color:#666;font-size:12px;margin-left:8px;">{{ $chamado['dominio'] ?? '' }}</span>
        <span style="float:right;font-size:12px;color:#888;">{{ $chamado['criado_em'] }}</span>
    </div>
    @if(!empty($chamado['mensagem']))
    <div style="padding:10px 14px;font-size:13px;color:#555;border-bottom:1px solid #f0f0f0;">
        {{ \Illuminate\Support\Str::limit($chamado['mensagem'], 200) }}
    </div>
    @endif
    @if(!empty($chamado['demandas']))
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:12px;">
        <thead>
            <tr style="background:#fafafa;">
                <th style="padding:7px 12px;text-align:left;color:#666;">Demanda</th>
                <th style="padding:7px 12px;text-align:left;color:#666;">Categoria</th>
                <th style="padding:7px 12px;text-align:right;color:#666;">Horas</th>
                <th style="padding:7px 12px;text-align:right;color:#666;">Valor</th>
                <th style="padding:7px 12px;text-align:left;color:#666;">Status</th>
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
                $classIcon = match($demanda['classificacao']) {
                    'plano'              => '🟢',
                    'coberta_pelo_plano' => '🔵',
                    'excedente'          => '🟠',
                    'avulsa'             => '🔴',
                    default              => '⚪',
                };
                $classLabel = match($demanda['classificacao']) {
                    'plano'              => 'Plano',
                    'coberta_pelo_plano' => 'Coberta pelo plano',
                    'excedente'          => 'Excedente',
                    'avulsa'             => 'Avulsa',
                    default              => '—',
                };
                $valorExibir = $demanda['classificacao'] === 'excedente'
                    ? $demanda['valor_excedente']
                    : $demanda['valor'];
            @endphp
            <tr style="background-color:{{ $classBg }};border-top:1px solid #eeeeee;">
                <td style="padding:7px 12px;">{{ $demanda['titulo'] }}</td>
                <td style="padding:7px 12px;">{{ $classIcon }} {{ $classLabel }}</td>
                <td style="padding:7px 12px;text-align:right;">{{ number_format($demanda['horas'], 2, ',', '.') }}h</td>
                <td style="padding:7px 12px;text-align:right;">
                    @if($valorExibir > 0)
                        R$ {{ number_format($valorExibir, 2, ',', '.') }}
                    @else
                        <span style="color:#2a7a2a;">R$ 0,00</span>
                    @endif
                </td>
                <td style="padding:7px 12px;">{{ ucfirst(str_replace('_', ' ', $demanda['status'])) }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
    @endif
</div>
@endforeach
@endif

<hr class="divider" style="margin-top:32px;">
<p style="font-size:12px;color:#888;text-align:center;">
    Este relatório foi gerado em {{ now()->format('d/m/Y \à\s H:i') }} e reflete o estado atual do sistema.
</p>

@endsection

