@extends('emails.layout')

@section('titulo', 'Nova Assinatura Gerada')

@section('content')
    <h2>[Admin] Nova assinatura gerada 📄</h2>
    <p>Uma nova assinatura foi criada na plataforma.</p>

    <div class="info-box">
        <p><strong>Detalhes da assinatura:</strong></p>
        <p>Cliente: <strong>{{ $assinatura->cliente?->nome }}</strong></p>
        <p>Plano: <strong>{{ $assinatura->plano?->nome }}</strong></p>
        <p>Domínio: {{ $assinatura->dominio?->nome }}</p>
        <p>Horas disponíveis: {{ $assinatura->horas_disponiveis }}h</p>
        <p>Status: <strong>{{ ucfirst($assinatura->status) }}</strong></p>
        <p>Início: {{ $assinatura->data_inicio ? \Carbon\Carbon::parse($assinatura->data_inicio)->format('d/m/Y') : 'Imediato' }}</p>
        <p>Gerada em: {{ $assinatura->created_at->format('d/m/Y \à\s H:i') }}</p>
    </div>

    <p>Acesse o painel administrativo para visualizar os detalhes completos.</p>
@endsection
