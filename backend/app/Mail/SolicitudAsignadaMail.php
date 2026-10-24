<?php

namespace App\Mail;

use App\Models\Configuracion;
use App\Models\SolicitudPortal;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

// Aviso al Administrador de Empresa: a que ejecutivo se le asigno una solicitud del portal.
class SolicitudAsignadaMail extends Mailable
{
    use SerializesModels;

    public function __construct(public SolicitudPortal $solicitud, public ?string $reasignadaDe = null)
    {
    }

    public function envelope(): Envelope
    {
        $configuracion = Configuracion::actual();

        $ejecutivo = $this->solicitud->ejecutivo?->nombre ?? 'sin asignar';

        $asunto = $this->reasignadaDe
            ? "Solicitud {$this->solicitud->codigo} reasignada a {$ejecutivo}"
            : "Solicitud {$this->solicitud->codigo} asignada a {$ejecutivo}";

        return new Envelope(
            from: new Address(
                $configuracion->notificaciones_correo_remitente ?? config('mail.from.address'),
                $configuracion->notificaciones_nombre_remitente ?? config('mail.from.name'),
            ),
            subject: $asunto,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'correos.solicitud-asignada',
        );
    }
}
