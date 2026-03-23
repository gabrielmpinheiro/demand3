@extends('emails.layout')

@section('titulo', 'Pagamento Confirmado')

@section('content')
    <h2>[Admin] Pagamento confirmado ✅</h2>
    <p>Um pagamento foi confirmado/concluído na plataforma.</p>

    <div class="info-box">
        <p><strong>Detalhes do pagamento:</strong></p>
        <p>ID: <strong>#{{ $pagamento->id }}</strong></p>
        <p>Cliente: <strong>{{ $pagamento->cliente?->nome }}</strong></p>
        <p>Valor pago: <strong>R$ {{ number_format($pagamento->valor, 2, ',', '.') }}</strong></p>
        @if($pagamento->forma_pagamento)
            <p>Forma de pagamento: {{ $pagamento->forma_pagamento }}</p>
        @endif
        @if($pagamento->descricao)
            <p>Descrição: {{ $pagamento->descricao }}</p>
        @endif
        <p>Data do pagamento: <strong>{{ $pagamento->data_pagamento ? \Carbon\Carbon::parse($pagamento->data_pagamento)->format('d/m/Y') : now()->format('d/m/Y') }}</strong></p>
    </div>

    <p>Acesse o painel administrativo para visualizar o comprovante e histórico completo.</p>
@endsection
