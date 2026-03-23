@extends('emails.layout')

@section('titulo', 'Nova Demanda Criada')

@section('content')
    <h2>Uma nova demanda foi criada 📋</h2>
    <p>Olá, <strong>{{ $demanda->dominio?->cliente?->nome ?? 'Cliente' }}</strong>!</p>
    <p>Uma nova demanda foi registrada para o seu domínio <strong>{{ $demanda->dominio?->nome }}</strong>.</p>

    <div class="info-box">
        <p><strong>Detalhes da demanda:</strong></p>
        <p>Título: <strong>{{ $demanda->titulo }}</strong></p>
        @if($demanda->descricao)
            <p>Descrição: {{ Str::limit($demanda->descricao, 200) }}</p>
        @endif
        <p>Horas estimadas: <strong>{{ $demanda->quantidade_horas_tecnicas }}h</strong></p>
        <p>Status: <strong>{{ ucfirst(str_replace('_', ' ', $demanda->status)) }}</strong></p>
        <p>Criada em: {{ $demanda->created_at->format('d/m/Y \à\s H:i') }}</p>
    </div>

    <p>Nossa equipe está trabalhando nesta demanda. Você será notificado(a) quando houver atualizações.</p>
@endsection
