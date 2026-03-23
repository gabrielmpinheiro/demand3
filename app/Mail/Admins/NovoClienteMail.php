<?php

namespace App\Mail\Admins;

use App\Models\Cliente;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NovoClienteMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public readonly Cliente $cliente) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: "Demand3 — Novo cliente cadastrado: {$this->cliente->nome}");
    }

    public function content(): Content
    {
        return new Content(view: 'emails.admins.novo_cliente');
    }
}
