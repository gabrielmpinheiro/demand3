<?php

namespace App\Mail\Clientes;

use App\Models\Suporte;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NovaChamadoMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public readonly Suporte $suporte) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: "Demand3 — Chamado #{$this->suporte->id} aberto com sucesso");
    }

    public function content(): Content
    {
        return new Content(view: 'emails.clientes.novo_chamado');
    }
}
