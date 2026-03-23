@extends('emails.layout')

@section('titulo', 'Novo Chamado Aberto')

@section('content')
    <h2>Seu chamado foi registrado ✅</h2>
    <p>Olá, <strong>{{ $suporte->cliente?->nome ?? 'Cliente' }}</strong>!</p>
    <p>Recebemos seu chamado e nossa equipe já está ciente. Em breve entraremos em contato.</p>

    <div class="info-box">
        <p><strong>Detalhes do chamado:</strong></p>
        <p>Número: <strong>#{{ $suporte->id }}</strong></p>
        @if($suporte->mensagem)
            <p>Mensagem: {{ Str::limit($suporte->mensagem, 200) }}</p>
        @endif
        <p>Status: <strong>{{ ucfirst($suporte->status) }}</strong></p>
        <p>Aberto em: {{ $suporte->created_at->format('d/m/Y \à\s H:i') }}</p>
    </div>

    <p>Fique tranquilo(a), você receberá notificações conforme as demandas do seu chamado forem sendo tratadas.</p>
@endsection
