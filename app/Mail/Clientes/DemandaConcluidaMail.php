<?php

namespace App\Mail\Clientes;

use App\Models\Demanda;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class DemandaConcluidaMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public readonly Demanda $demanda) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: "Demand3 — Demanda concluída: {$this->demanda->titulo}");
    }

    public function content(): Content
    {
        return new Content(view: 'emails.clientes.demanda_concluida');
    }
}
