<?php

namespace App\Mail\Admins;

use App\Models\Assinatura;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NovaAssinaturaMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public readonly Assinatura $assinatura) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: "Demand3 — Nova assinatura gerada");
    }

    public function content(): Content
    {
        return new Content(view: 'emails.admins.nova_assinatura');
    }
}
