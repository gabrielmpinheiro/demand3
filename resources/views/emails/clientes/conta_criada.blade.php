@extends('emails.layout')

@section('titulo', 'Bem-vindo(a) ao Demand3')

@section('content')
    <h2>Bem-vindo(a), {{ $user->name }}! 🎉</h2>
    <p>Sua conta foi criada com sucesso na plataforma <strong>Demand3</strong>. Estamos felizes em tê-lo(a) conosco!</p>
    <p>Para começar a utilizar a plataforma, clique no botão abaixo para ativar sua conta:</p>

    <a href="{{ $activationUrl }}" class="btn">Ativar minha conta</a>

    <hr class="divider" style="margin-top:28px;">

    <div class="info-box">
        <p><strong>Dados do seu cadastro:</strong></p>
        <p>Nome: {{ $user->name }}</p>
        <p>E-mail: {{ $user->email }}</p>
    </div>

    <p style="font-size:12px;color:#999;margin-top:16px;">
        Se você não solicitou a criação desta conta, ignore este e-mail.
        O link de ativação expira em 24 horas.
    </p>
@endsection
