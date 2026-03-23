<?php

namespace App\Mail\Admins;

use App\Models\Suporte;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NovoChamadoAdminMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public readonly Suporte $suporte) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: "Demand3 — Novo chamado aberto #{$this->suporte->id}");
    }

    public function content(): Content
    {
        return new Content(view: 'emails.admins.novo_chamado');
    }
}
