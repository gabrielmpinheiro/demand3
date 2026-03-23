<?php

namespace App\Mail\Clientes;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ContaCriadaMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly User $user,
        public readonly string $activationUrl
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Bem-vindo(a) ao Demand3 — Ative sua conta');
    }

    public function content(): Content
    {
        return new Content(view: 'emails.clientes.conta_criada');
    }
}
