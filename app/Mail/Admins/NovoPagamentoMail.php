<?php

namespace App\Mail\Admins;

use App\Models\Pagamento;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NovoPagamentoMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public readonly Pagamento $pagamento) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: "Demand3 — Novo pagamento gerado #{$this->pagamento->id}");
    }

    public function content(): Content
    {
        return new Content(view: 'emails.admins.novo_pagamento');
    }
}
