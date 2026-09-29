<?php

namespace App\Services;

use App\Mail\ContratoPorVencerMail;
use App\Models\Configuracion;
use App\Models\Contrato;
use App\Models\Usuario;
use Illuminate\Support\Facades\Mail;

class RecordatorioService
{
    // Al ejecutivo + Administrador Empresa
    private const DIAS_AMBOS = [30, 15, 5];

    // Solo al ejecutivo (incluye el conteo diario del 5 hacia abajo, sin repetir el 5)
    private const DIAS_SOLO_EJECUTIVO = [22, 8, 4, 3, 2, 1, 0];

    public function enviarRecordatoriosContratos(): int
    {
        if (! Configuracion::actual()->notificaciones_activas) {

            return 0;

        }

        $administradoresEmpresa = Usuario::whereHas('rol', fn ($query) => $query->where('nombre', 'Administrador Empresa'))
            ->where('estado', 'Activo')
            ->get();

        $enviados = 0;

        Contrato::with('usuario', 'cliente', 'valla')
            ->where('estado', 'Activo')
            ->get()
            ->each(function (Contrato $contrato) use ($administradoresEmpresa, &$enviados) {

                $dias = (int) now()->startOfDay()->diffInDays($contrato->fecha_fin, false);

                $incluirAdmins = in_array($dias, self::DIAS_AMBOS, true);

                $esHito = $incluirAdmins || in_array($dias, self::DIAS_SOLO_EJECUTIVO, true);

                if (! $esHito || ! $contrato->usuario?->correo) {

                    return;

                }

                 $correo = Mail::to([
                    ['email' => $contrato->usuario->correo, 'name' => $contrato->usuario->nombre],
                ]);

                if ($incluirAdmins && $administradoresEmpresa->isNotEmpty()) {

                    $correo->cc(
                        $administradoresEmpresa->map(fn ($admin) => [
                            'email' => $admin->correo,
                            'name' => $admin->nombre,
                        ])->all()
                    );

                }

                $correo->send(new ContratoPorVencerMail($contrato, $dias));

                $enviados++;

            });

        return $enviados;

    }
}
