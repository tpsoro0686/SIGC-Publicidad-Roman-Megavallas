<?php

namespace App\Mail;

use App\Models\Configuracion;
use App\Models\SolicitudPortal;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SolicitudPortalMail extends Mailable
{
    use SerializesModels;

    public function __construct(public SolicitudPortal $solicitud, public bool $sinEjecutivo = false)
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
            replyTo: [new Address($this->solicitud->correo, $this->solicitud->nombre)],
            subject: "Nueva solicitud del portal {$this->solicitud->codigo}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'correos.solicitud-portal',
        );
    }
}
