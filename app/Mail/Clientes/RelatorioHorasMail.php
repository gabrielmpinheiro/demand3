<?php

namespace App\Mail\Clientes;

use App\Models\Cliente;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class RelatorioHorasMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly Cliente $cliente,
        public readonly array   $relatorio,
        public readonly string  $periodoInicio,
        public readonly string  $periodoFim,
    ) {}

    public function envelope(): Envelope
    {
        $mes = \Carbon\Carbon::parse($this->periodoInicio)->translatedFormat('F \d\e Y');

        return new Envelope(
            subject: "Demand3 — Relatório de Horas: {$this->cliente->nome} ({$mes})"
        );
    }

    public function content(): Content
    {
        return new Content(view: 'emails.clientes.relatorio_horas');
    }
}

