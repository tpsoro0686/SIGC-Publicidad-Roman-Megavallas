<?php

namespace App\Mail;

use App\Models\Configuracion;
use App\Models\Contrato;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ContratoPorVencerMail extends Mailable
{
    use SerializesModels;

    public function __construct(public Contrato $contrato, public int $diasRestantes)
    {
    }

    public function envelope(): Envelope
    {
        $configuracion = Configuracion::actual();

        return new Envelope(
            from: new Address(
                $configuracion->notificaciones_correo_remitente ?? config('mail.from.address'),
                $configuracion->notificaciones_nombre_remitente ?? config('mail.from.name'),
            ),
            subject: "Contrato {$this->contrato->codigo} vence en {$this->diasRestantes} día(s)",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'correos.contrato-por-vencer',
        );
    }
}
