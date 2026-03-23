@extends('emails.layout')

@section('titulo', 'Novo Cliente Cadastrado')

@section('content')
    <h2>[Admin] Novo cliente cadastrado 👤</h2>
    <p>Um novo cliente foi cadastrado na plataforma.</p>

    <div class="info-box">
        <p><strong>Dados do cliente:</strong></p>
        <p>Nome: <strong>{{ $cliente->nome }}</strong></p>
        <p>E-mail: {{ $cliente->email }}</p>
        @if($cliente->telefone)
            <p>Telefone: {{ $cliente->telefone }}</p>
        @endif
        @if($cliente->cnpj)
            <p>CNPJ: {{ $cliente->cnpj }}</p>
        @elseif($cliente->cpf)
            <p>CPF: {{ $cliente->cpf }}</p>
        @endif
        @if($cliente->cidade && $cliente->estado)
            <p>Localização: {{ $cliente->cidade }} / {{ $cliente->estado }}</p>
        @endif
        <p>Cadastrado em: {{ $cliente->created_at->format('d/m/Y \à\s H:i') }}</p>
    </div>

    <p>Acesse o painel administrativo para gerenciar este cliente.</p>
@endsection
