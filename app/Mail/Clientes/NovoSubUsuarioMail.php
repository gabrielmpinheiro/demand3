<?php

namespace App\Mail\Clientes;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NovoSubUsuarioMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly User $subUser,
        public readonly string $senhaTemporaria
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Demand3 — Seu acesso foi criado');
    }

    public function content(): Content
    {
        return new Content(view: 'emails.clientes.novo_sub_usuario');
    }
}
