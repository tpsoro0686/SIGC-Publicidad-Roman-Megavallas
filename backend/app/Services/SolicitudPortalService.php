<?php

namespace App\Services;

use App\Mail\SolicitudAsignadaMail;
use App\Mail\SolicitudPortalMail;
use App\Models\Bitacora;
use App\Models\SolicitudPortal;
use App\Models\Usuario;
use App\Models\Valla;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;

class SolicitudPortalService
{
    // Estados de valla que nunca se muestran ni se pueden solicitar en el portal
    public const ESTADOS_OCULTOS = ['Mantenimiento', 'Inactiva'];

    private const ROLES_GESTION = ['Administrador Sistema', 'Administrador Empresa'];

    public function crear(array $datos): SolicitudPortal
    {
        $solicitud = DB::transaction(function () use ($datos) {

            $ejecutivo = $this->siguienteEjecutivo();

            $solicitud = SolicitudPortal::create([
                'nombre' => $datos['nombre'],
                'empresa' => $datos['empresa'] ?? null,
                'telefono' => $datos['telefono'],
                'correo' => $datos['correo'],
                'mensaje' => $datos['mensaje'] ?? null,
                'fecha_inicio_deseada' => $datos['fecha_inicio_deseada'] ?? null,
                'plazo_meses_deseado' => $datos['plazo_meses_deseado'] ?? null,
                'usuario_id' => $ejecutivo?->id,
                'usuario_turno_id' => $ejecutivo?->id,
                'estado' => 'Nueva',
            ]);

            $solicitud->update([
                'codigo' => 'SOL-' . str_pad((string) $solicitud->id, 4, '0', STR_PAD_LEFT),
            ]);

            Valla::whereIn('id', $datos['vallas'])->get()->each(function (Valla $valla) use ($solicitud) {
                $solicitud->vallas()->attach($valla->id, ['precio_mostrado' => $valla->precio_normal]);
            });

            return $solicitud;

        });

        $solicitud->load('vallas', 'ejecutivo');

        $this->notificar($solicitud);

        return $solicitud;
    }

    // Reparto por turnos segun el campo "turno_portal" de cada ejecutivo activo
    // (1, 2, 3...; quienes no tienen turno van al final, ordenados por id).
    // Le toca al siguiente del que recibio la ultima solicitud por turno; al llegar
    // al final se vuelve a empezar. Las reasignaciones manuales no alteran la rotacion.
    public function siguienteEjecutivo(): ?Usuario
    {
        $clave = fn (Usuario $usuario) => [$usuario->turno_portal ?? PHP_INT_MAX, $usuario->id];

        $activos = Usuario::whereHas('rol', fn ($query) => $query->where('nombre', 'Ejecutivo'))
            ->where('estado', 'Activo')
            ->get()
            ->sort(fn (Usuario $a, Usuario $b) => $clave($a) <=> $clave($b))
            ->values();

        if ($activos->isEmpty()) {
            return null;
        }

        $ultimo = SolicitudPortal::whereNotNull('usuario_turno_id')
            ->orderByDesc('id')
            ->first()
            ?->usuario_turno_id;

        $anterior = $ultimo ? Usuario::find($ultimo) : null;

        if (! $anterior) {
            return $activos->first();
        }

        $claveAnterior = $clave($anterior);

        return $activos->first(fn (Usuario $usuario) => $clave($usuario) > $claveAnterior)
            ?? $activos->first();
    }

    public function listar(Usuario $usuario, ?string $estado = null, ?string $busqueda = null, int $perPage = 20)
    {
        return $this->consultaVisible($usuario)
            ->with('vallas.provincia', 'ejecutivo')
            ->when($estado, fn ($query) => $query->where('estado', $estado))
            ->when($busqueda, function ($query) use ($busqueda) {
                $query->where(function ($sub) use ($busqueda) {
                    $sub->where('codigo', 'like', "%{$busqueda}%")
                        ->orWhere('nombre', 'like', "%{$busqueda}%")
                        ->orWhere('empresa', 'like', "%{$busqueda}%")
                        ->orWhere('correo', 'like', "%{$busqueda}%");
                });
            })
            ->orderByDesc('id')
            ->paginate($perPage);
    }

    public function resumen(Usuario $usuario): array
    {
        $consulta = fn () => $this->consultaVisible($usuario);

        return [
            'total' => $consulta()->count(),
            'nuevas' => $consulta()->where('estado', 'Nueva')->count(),
            'en_seguimiento' => $consulta()->where('estado', 'En seguimiento')->count(),
            'cerradas' => $consulta()->where('estado', 'Cerrada')->count(),
        ];
    }

    public function obtener(Usuario $usuario, SolicitudPortal $solicitud): SolicitudPortal
    {
        $this->asegurarAcceso($usuario, $solicitud);

        return $solicitud->load('vallas.provincia', 'ejecutivo');
    }

    public function cambiarEstado(SolicitudPortal $solicitud, string $nuevoEstado, Usuario $usuario): SolicitudPortal
    {
        $this->asegurarAcceso($usuario, $solicitud);

        $solicitud->update([
            'estado' => $nuevoEstado,
            'atendida_en' => $solicitud->atendida_en ?? ($nuevoEstado !== 'Nueva' ? now() : null),
        ]);

        $this->registrarBitacora($usuario, "Cambio de estado a {$nuevoEstado}", $solicitud);

        return $solicitud->load('vallas.provincia', 'ejecutivo');
    }

    public function reasignar(SolicitudPortal $solicitud, int $ejecutivoId, Usuario $usuario): SolicitudPortal
    {
        if (! in_array($usuario->rol->nombre, self::ROLES_GESTION, true)) {
            abort(403, 'No tienes permisos para reasignar solicitudes.');
        }

        $ejecutivo = Usuario::whereHas('rol', fn ($query) => $query->where('nombre', 'Ejecutivo'))
            ->where('estado', 'Activo')
            ->find($ejecutivoId);

        if (! $ejecutivo) {
            throw ValidationException::withMessages([
                'usuario_id' => 'Selecciona un ejecutivo activo.',
            ]);
        }

        $anterior = $solicitud->ejecutivo?->nombre;

        $solicitud->update(['usuario_id' => $ejecutivo->id]);
        $solicitud->load('vallas.provincia', 'ejecutivo');

        $this->registrarBitacora($usuario, "Reasignada a {$ejecutivo->nombre}", $solicitud);

        $this->notificar($solicitud, $anterior);

        return $solicitud;
    }

    // Los correos nunca deben tumbar la solicitud: ya esta guardada.
    // Cada correo va en su propio intento, para que si uno falla el otro igual salga.
    private function notificar(SolicitudPortal $solicitud, ?string $reasignadaDe = null): void
    {
        $solicitud->loadMissing('vallas', 'ejecutivo');

        if ($solicitud->ejecutivo) {

            // 1. Al ejecutivo asignado
            $this->enviar(
                collect([$solicitud->ejecutivo]),
                new SolicitudPortalMail($solicitud),
            );

            // 2. Aparte, a los Administradores de Empresa: quien la recibio y resumen del pedido
            $this->enviar(
                $this->usuariosActivos(['Administrador Empresa']),
                new SolicitudAsignadaMail($solicitud, $reasignadaDe),
            );

            return;

        }

        // Sin ejecutivos activos: se avisa a los administradores para que la asignen a mano
        $this->enviar(
            $this->usuariosActivos(self::ROLES_GESTION),
            new SolicitudPortalMail($solicitud, sinEjecutivo: true),
        );
    }

    private function usuariosActivos(array $roles)
    {
        return Usuario::whereHas('rol', fn ($query) => $query->whereIn('nombre', $roles))
            ->where('estado', 'Activo')
            ->get();
    }

    private function enviar($destinatarios, $correo): void
    {
        try {

            $destinatarios = $destinatarios->filter(fn ($usuario) => $usuario->correo)->values();

            if ($destinatarios->isEmpty()) {
                return;
            }

            Mail::to(
                $destinatarios->map(fn ($usuario) => ['email' => $usuario->correo, 'name' => $usuario->nombre])->all()
            )->send($correo);

        } catch (\Throwable $e) {

            report($e);

        }
    }

    // Ejecutivo: solo las suyas. Administradores y Dueño: todas.
    private function consultaVisible(Usuario $usuario)
    {
        return SolicitudPortal::query()
            ->when($usuario->rol->nombre === 'Ejecutivo', fn ($query) => $query->where('usuario_id', $usuario->id));
    }

    private function asegurarAcceso(Usuario $usuario, SolicitudPortal $solicitud): void
    {
        $esEjecutivo = $usuario->rol->nombre === 'Ejecutivo';

        if ($esEjecutivo && $solicitud->usuario_id !== $usuario->id) {
            abort(403, 'Esta solicitud está asignada a otro ejecutivo.');
        }
    }

    private function registrarBitacora(Usuario $usuario, string $accion, SolicitudPortal $solicitud): void
    {
        Bitacora::create([
            'usuario_id' => $usuario->id,
            'modulo' => 'Solicitudes',
            'accion' => $accion,
            'descripcion' => "{$solicitud->codigo} - {$solicitud->nombre}",
        ]);
    }
}
