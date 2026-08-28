<?php

namespace App\Services;

use App\Models\Bitacora;
use App\Models\Cliente;
use App\Models\Reserva;
use App\Models\Usuario;
use App\Models\Valla;
use Illuminate\Validation\ValidationException;

class ReservaService
{
    private const DIAS_POR_DEFECTO = 3;

    public function listar(?string $estado, bool $soloMias, Usuario $usuarioActual)
    {
        return Reserva::with('valla', 'cliente', 'usuario')
            ->when($estado, fn ($q) => $q->where('estado', $estado))
            ->when($soloMias, fn ($q) => $q->where('usuario_id', $usuarioActual->id))
            ->latest('fecha_reserva')
            ->get();
    }

        public function crear(array $datos, Usuario $usuario): Reserva
    {
        $valla = Valla::findOrFail($datos['valla_id']);

        if ($valla->estado !== 'Disponible') {

            throw ValidationException::withMessages([
                'valla_id' => ['Esta valla no está disponible para reservar.'],
            ]);

        }

        $clienteId = $datos['cliente_id'] ?? $this->resolverCliente($datos);

        $fechaVencimiento = $datos['fecha_vencimiento']
            ?? now()->addDays($datos['dias'] ?? self::DIAS_POR_DEFECTO)->toDateString();

        $reserva = Reserva::create([
            'valla_id' => $valla->id,
            'cliente_id' => $clienteId,
            'usuario_id' => $usuario->id,
            'fecha_reserva' => now()->toDateString(),
            'fecha_vencimiento' => $fechaVencimiento,
            'estado' => 'Activa',
        ]);

        $valla->update(['estado' => 'Reservada']);

        $this->registrarBitacora($usuario, 'Creacion de reserva', $reserva);

        return $reserva->load('valla', 'cliente', 'usuario');
    }

        private function resolverCliente(array $datos): int
    {
        $cliente = Cliente::create([
            'nombre' => $datos['cliente_nombre'],
            'cedula' => 'TEMP-' . uniqid(),
            'estado' => 'Activo',
        ]);

        return $cliente->id;
    }

    public function cancelar(Reserva $reserva, Usuario $usuario): Reserva
    {
        if ($reserva->estado !== 'Activa') {
            throw ValidationException::withMessages([
                'estado' => ['Solo se pueden cancelar reservas activas.'],
            ]);
        }

        $reserva->update(['estado' => 'Cancelada']);
        $reserva->valla->update(['estado' => 'Disponible']);

        $this->registrarBitacora($usuario, 'Cancelacion de reserva', $reserva);

        return $reserva->load('valla', 'cliente', 'usuario');
    }

    public function convertir(Reserva $reserva, Usuario $usuario): Reserva
    {
        if ($reserva->estado !== 'Activa') {
            throw ValidationException::withMessages([
                'estado' => ['Solo se pueden convertir reservas activas.'],
            ]);
        }

        $reserva->update(['estado' => 'Convertida']);

        $this->registrarBitacora($usuario, 'Conversion de reserva a contrato', $reserva);

        return $reserva->load('valla', 'cliente', 'usuario');
    }

    public function vencerReservasExpiradas(): int
    {
        $reservas = Reserva::where('estado', 'Activa')
            ->whereDate('fecha_vencimiento', '<', now()->toDateString())
            ->get();

        foreach ($reservas as $reserva) {

            $reserva->update(['estado' => 'Vencida']);

            if ($reserva->valla->estado === 'Reservada') {
                $reserva->valla->update(['estado' => 'Disponible']);
            }

        }

        return $reservas->count();
    }

    public function resumen(Usuario $usuarioActual): array
    {
        return [
            'activas' => Reserva::where('estado', 'Activa')->count(),
            'mias_activas' => Reserva::where('estado', 'Activa')->where('usuario_id', $usuarioActual->id)->count(),
            'por_vencer' => Reserva::where('estado', 'Activa')
                ->whereBetween('fecha_vencimiento', [now()->toDateString(), now()->addDay()->toDateString()])
                ->count(),
            'vencidas' => Reserva::where('estado', 'Vencida')->count(),
            'convertidas' => Reserva::where('estado', 'Convertida')->count(),
        ];
    }

    private function registrarBitacora(Usuario $usuario, string $accion, Reserva $reserva): void
    {
        Bitacora::create([
            'usuario_id' => $usuario->id,
            'modulo' => 'Reservas',
            'accion' => $accion,
            'descripcion' => "Reserva #{$reserva->id} - Valla {$reserva->valla->codigo}",
        ]);
    }
}
