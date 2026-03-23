<?php

namespace App\Mail\Admins;

use App\Models\Pagamento;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PagamentoConcluidoMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public readonly Pagamento $pagamento) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: "Demand3 — Pagamento confirmado #{$this->pagamento->id}");
    }

    public function content(): Content
    {
        return new Content(view: 'emails.admins.pagamento_concluido');
    }
}
