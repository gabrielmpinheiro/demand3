@extends('emails.layout')

@section('titulo', 'Demanda Concluída')

@section('content')
    <h2>Sua demanda foi concluída! 🎉</h2>
    <p>Olá, <strong>{{ $demanda->dominio?->cliente?->nome ?? 'Cliente' }}</strong>!</p>
    <p>Temos o prazer de informar que a demanda abaixo foi <strong>concluída com sucesso</strong>.</p>

    <div class="info-box">
        <p><strong>Detalhes da demanda:</strong></p>
        <p>Título: <strong>{{ $demanda->titulo }}</strong></p>
        <p>Domínio: {{ $demanda->dominio?->nome }}</p>
        <p>Horas utilizadas: <strong>{{ $demanda->quantidade_horas_tecnicas }}h</strong></p>
        @if((float)$demanda->valor > 0)
            <p>Valor: <strong>R$ {{ number_format($demanda->valor, 2, ',', '.') }}</strong></p>
        @endif
        <p>Concluída em: {{ $demanda->updated_at->format('d/m/Y \à\s H:i') }}</p>
    </div>

    <p>Agradecemos sua confiança. Se precisar de algo mais, não hesite em abrir um novo chamado!</p>
@endsection
