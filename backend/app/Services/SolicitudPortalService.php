<?php

namespace App\Services;

use App\Mail\SolicitudAsignadaMail;
use App\Mail\SolicitudPortalMail;
use App\Models\Bitacora;
use App\Models\Cliente;
use App\Models\Reserva;
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

            // Bloquea las vallas pedidas: si dos personas piden la misma al mismo tiempo,
            // la segunda espera y ya la encuentra apartada.
            $vallas = Valla::whereIn('id', $datos['vallas'])->orderBy('id')->lockForUpdate()->get();

            $ejecutivo = $this->siguienteEjecutivo();
            $responsable = $ejecutivo ?? $this->usuariosActivos(self::ROLES_GESTION)->first();

            $libres = $vallas->where('estado', 'Disponible');

            $this->verificarTopePorCorreo($datos['correo'], $libres->count());

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

            $cliente = $libres->isNotEmpty() && $responsable ? $this->resolverCliente($datos) : null;

            foreach ($vallas as $valla) {

                $reservaId = null;

                // Solo se aparta lo que está Disponible. Lo demás queda "en espera":
                // se registra el interés, pero no se le quita la valla a nadie.
                if ($cliente && $responsable && $valla->estado === 'Disponible') {

                    $reservaId = Reserva::create([
                        'valla_id' => $valla->id,
                        'cliente_id' => $cliente->id,
                        'usuario_id' => $responsable->id,
                        'fecha_reserva' => now()->toDateString(),
                        'fecha_vencimiento' => now()->addDays(config('portal.dias_apartado'))->toDateString(),
                        'estado' => 'Activa',
                    ])->id;

                    $valla->update(['estado' => 'Reservada']);

                }

                $solicitud->vallas()->attach($valla->id, [
                    'precio_mostrado' => $valla->precio_normal,
                    'reserva_id' => $reservaId,
                ]);

            }

            return $solicitud;

        });

        $solicitud->load('vallas', 'ejecutivo');

        $this->notificar($solicitud);

        return $solicitud;
    }

    // Códigos de las vallas de la solicitud que quedaron apartadas / en espera
    public function resumenApartado(SolicitudPortal $solicitud): array
    {
        $solicitud->loadMissing('vallas');

        $apartadas = $solicitud->vallas->filter(fn ($valla) => $valla->pivot->reserva_id)->pluck('codigo')->values()->all();
        $enEspera = $solicitud->vallas->filter(fn ($valla) => ! $valla->pivot->reserva_id)->pluck('codigo')->values()->all();

        return [
            'apartadas' => $apartadas,
            'en_espera' => $enEspera,
            'dias' => (int) config('portal.dias_apartado'),
        ];
    }

    // Libera las vallas que esta solicitud tenía apartadas (reservas todavía activas).
    // Si ya se convirtieron en contrato (Convertida) no se tocan.
    public function liberarApartadas(SolicitudPortal $solicitud): int
    {
        $ids = DB::table('solicitud_portal_vallas')
            ->where('solicitud_portal_id', $solicitud->id)
            ->whereNotNull('reserva_id')
            ->pluck('reserva_id');

        $liberadas = 0;

        foreach (Reserva::whereIn('id', $ids)->where('estado', 'Activa')->with('valla')->get() as $reserva) {

            $reserva->update(['estado' => 'Cancelada']);

            if ($reserva->valla->estado === 'Reservada') {
                $reserva->valla->update(['estado' => 'Disponible']);
            }

            $liberadas++;

        }

        return $liberadas;
    }

    // Reservas de la solicitud indexadas por id (para mostrar su estado en la bandeja)
    public function reservasDe(SolicitudPortal $solicitud)
    {
        $ids = DB::table('solicitud_portal_vallas')
            ->where('solicitud_portal_id', $solicitud->id)
            ->whereNotNull('reserva_id')
            ->pluck('reserva_id');

        return Reserva::whereIn('id', $ids)->get()->keyBy('id');
    }

    // Reutiliza al cliente si ya existe uno con ese correo; si no, lo crea sin cédula
    // (la cédula y demás datos se completan antes de firmar el contrato).
    private function resolverCliente(array $datos): Cliente
    {
        $existente = Cliente::where('correo', $datos['correo'])->orderBy('id')->first();

        if ($existente) {
            return $existente;
        }

        return Cliente::create([
            'nombre' => filled($datos['empresa'] ?? null) ? $datos['empresa'] : $datos['nombre'],
            'cedula' => null,
            'telefono' => $datos['telefono'],
            'correo' => $datos['correo'],
            'estado' => 'Activo',
        ]);
    }

    private function verificarTopePorCorreo(string $correo, int $nuevas): void
    {
        if ($nuevas === 0) {
            return;
        }

        $activas = Reserva::where('estado', 'Activa')
            ->whereHas('cliente', fn ($query) => $query->where('correo', $correo))
            ->whereIn('id', DB::table('solicitud_portal_vallas')->whereNotNull('reserva_id')->select('reserva_id'))
            ->count();

        $tope = config('portal.max_apartadas_por_correo');

        if ($activas + $nuevas > $tope) {

            throw ValidationException::withMessages([
                'vallas' => "Con este correo ya tienes vallas apartadas (máximo {$tope} a la vez). Espera a que un ejecutivo te atienda o reduce tu lista.",
            ]);

        }
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
            ->with('vallas.provincia', 'ejecutivo', 'pagos')
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

    // Ejecutivos activos a los que se puede reasignar, en el orden de los turnos,
    // con cuántas solicitudes abiertas (no cerradas) tiene cada uno.
    public function ejecutivosParaAsignar(): array
    {
        $abiertas = SolicitudPortal::where('estado', '!=', 'Cerrada')
            ->whereNotNull('usuario_id')
            ->selectRaw('usuario_id, COUNT(*) as total')
            ->groupBy('usuario_id')
            ->pluck('total', 'usuario_id');

        return Usuario::whereHas('rol', fn ($query) => $query->where('nombre', 'Ejecutivo'))
            ->where('estado', 'Activo')
            ->get()
            ->sortBy(fn (Usuario $usuario) => [$usuario->turno_portal ?? PHP_INT_MAX, $usuario->id])
            ->map(fn (Usuario $usuario) => [
                'id' => $usuario->id,
                'nombre' => $usuario->nombre,
                'turno_portal' => $usuario->turno_portal,
                'abiertas' => (int) ($abiertas[$usuario->id] ?? 0),
            ])
            ->values()
            ->all();
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

        if ($nuevoEstado === 'Cerrada') {
            $liberadas = $this->liberarApartadas($solicitud);
            if ($liberadas > 0) {
                $this->registrarBitacora($usuario, "Liberó {$liberadas} valla(s) apartada(s) al cerrar", $solicitud);
            }
        }

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

        // Las reservas que apartan las vallas pasan a manos del nuevo ejecutivo
        Reserva::whereIn('id', DB::table('solicitud_portal_vallas')
                ->where('solicitud_portal_id', $solicitud->id)->whereNotNull('reserva_id')->select('reserva_id'))
            ->where('estado', 'Activa')
            ->update(['usuario_id' => $ejecutivo->id]);
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
