@extends('emails.layout')

@section('titulo', 'Novo Pagamento Gerado')

@section('content')
    <h2>[Admin] Novo pagamento gerado 💰</h2>
    <p>Um novo pagamento foi gerado para o cliente abaixo.</p>

    <div class="info-box">
        <p><strong>Detalhes do pagamento:</strong></p>
        <p>ID: <strong>#{{ $pagamento->id }}</strong></p>
        <p>Cliente: <strong>{{ $pagamento->cliente?->nome }}</strong></p>
        <p>Valor: <strong>R$ {{ number_format($pagamento->valor, 2, ',', '.') }}</strong></p>
        <p>Status: <strong>{{ ucfirst($pagamento->status) }}</strong></p>
        @if($pagamento->descricao)
            <p>Descrição: {{ $pagamento->descricao }}</p>
        @endif
        @if($pagamento->data_vencimento)
            <p>Vencimento: <strong>{{ \Carbon\Carbon::parse($pagamento->data_vencimento)->format('d/m/Y') }}</strong></p>
        @endif
        <p>Gerado em: {{ $pagamento->created_at->format('d/m/Y \à\s H:i') }}</p>
    </div>

    <p>Acesse o painel administrativo para visualizar os detalhes e gerenciar este pagamento.</p>
@endsection
