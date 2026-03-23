@extends('emails.layout')

@section('titulo', 'Seu Acesso ao Demand3')

@section('content')
    <h2>Seu acesso foi criado! 🔑</h2>
    <p>Olá, <strong>{{ $subUser->name }}</strong>!</p>
    <p>Um acesso à plataforma <strong>Demand3</strong> foi criado para você. Use as credenciais abaixo para fazer seu primeiro login:</p>

    <div class="info-box">
        <p><strong>Suas credenciais de acesso:</strong></p>
        <p>E-mail: <strong>{{ $subUser->email }}</strong></p>
        <p>Senha: <strong>{{ $senhaTemporaria }}</strong></p>
    </div>

    <p style="color:#c0392b;font-size:13px;">
        ⚠️ Por segurança, recomendamos que você altere sua senha no primeiro acesso.
    </p>

    <p>Se você não reconhece este cadastro, entre em contato conosco imediatamente em
        <a href="mailto:suporte@pulodogato.art.br">suporte@pulodogato.art.br</a>.
    </p>
@endsection
