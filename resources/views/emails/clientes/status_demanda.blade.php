@extends('emails.layout')

@section('titulo', 'Status da Demanda Atualizado')

@section('content')
    @php
        $statusLabels = [
            'pendente'     => 'Pendente',
            'em_andamento' => 'Em Andamento',
            'em_aprovacao' => 'Em Aprovação',
            'concluido'    => 'Concluído',
            'cancelado'    => 'Cancelado',
        ];
        $novoStatusLabel   = $statusLabels[$demanda->status]   ?? $demanda->status;
        $anteriorStatusLabel = $statusLabels[$statusAnterior] ?? $statusAnterior;
    @endphp

    <h2>Atualização na sua demanda 🔄</h2>
    <p>Olá, <strong>{{ $demanda->dominio?->cliente?->nome ?? 'Cliente' }}</strong>!</p>
    <p>O status da sua demanda foi atualizado.</p>

    <div class="info-box">
        <p><strong>Demanda:</strong> {{ $demanda->titulo }}</p>
        <p>Status anterior: <strong>{{ $anteriorStatusLabel }}</strong></p>
        <p>Novo status: <strong style="color:#1a2b4a;">{{ $novoStatusLabel }}</strong></p>
        <p>Atualizado em: {{ $demanda->updated_at->format('d/m/Y \à\s H:i') }}</p>
    </div>

    <p>Caso tenha dúvidas, entre em contato com nossa equipe de suporte.</p>
@endsection
