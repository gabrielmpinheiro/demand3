@extends('emails.layout')

@section('titulo', 'Novo Chamado Aberto pelo Cliente')

@section('content')
    <h2>[Admin] Novo chamado aberto 🎫</h2>
    <p>Um cliente abriu um novo chamado de suporte na plataforma.</p>

    <div class="info-box">
        <p><strong>Detalhes do chamado:</strong></p>
        <p>Número: <strong>#{{ $suporte->id }}</strong></p>
        <p>Cliente: <strong>{{ $suporte->cliente?->nome }}</strong></p>
        <p>E-mail do cliente: {{ $suporte->cliente?->email }}</p>
        @if($suporte->dominio)
            <p>Domínio: {{ $suporte->dominio?->nome }}</p>
        @endif
        @if($suporte->mensagem)
            <p>Mensagem: {{ Str::limit($suporte->mensagem, 300) }}</p>
        @endif
        <p>Status: <strong>{{ ucfirst($suporte->status) }}</strong></p>
        <p>Aberto em: {{ $suporte->created_at->format('d/m/Y \à\s H:i') }}</p>
    </div>

    <p>Acesse o painel administrativo para visualizar e responder a este chamado.</p>
@endsection
