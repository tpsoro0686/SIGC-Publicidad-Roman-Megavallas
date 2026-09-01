<?php

namespace App\Services;

use App\Models\Contrato;
use App\Models\Reserva;
use App\Models\Usuario;
use App\Models\Valla;
use Illuminate\Validation\ValidationException;

class ContratoService
{


    public function listar(?string $estado)
    {
        return Contrato::with('valla', 'cliente', 'usuario')
            ->when($estado, fn ($query) => $query->where('estado', $estado))
            ->latest('fecha_inicio')
            ->get();
    }

    public function crear(array $datos, Usuario $usuario): Contrato
    {
        $reserva = null;

        if (!empty($datos['reserva_id'])) {

            $reserva = Reserva::with('valla')->findOrFail($datos['reserva_id']);

            $vallaId = $reserva->valla_id;
            $clienteId = $reserva->cliente_id;

        } else {

            $vallaId = $datos['valla_id'];

            $clienteId = $datos['cliente_id'] ?? $this->crearClienteRapido($datos['cliente_nombre']);

        }

        $valla = Valla::findOrFail($vallaId);

        $fechaInicio = $datos['fecha_inicio'];

        $fechaFin = now()->parse($fechaInicio)->addMonths($datos['plazo_meses'])->toDateString();

        $contrato = Contrato::create([
            'reserva_id' => $reserva?->id,
            'valla_id' => $valla->id,
            'cliente_id' => $clienteId,
            'usuario_id' => $usuario->id,
            'codigo' => $this->generarCodigo($valla, $fechaInicio),
            'monto_usd' => $datos['monto_usd'],
            'plazo_meses' => $datos['plazo_meses'],
            'fecha_inicio' => $fechaInicio,
            'fecha_fin' => $fechaFin,
            'estado' => 'Activo',
        ]);

        $valla->update(['estado' => 'Alquilada']);

        if ($reserva && $reserva->estado === 'Activa') {

            $reserva->update(['estado' => 'Convertida']);

        }

        return $contrato->load('valla', 'cliente', 'usuario');
    }

    public function finalizarAntes(Contrato $contrato): Contrato
    {
        if ($contrato->estado !== 'Activo') {

            throw ValidationException::withMessages([
                'estado' => ['Solo se pueden finalizar contratos activos.'],
            ]);

        }

        $contrato->update(['estado' => 'Finalizado']);

        $contrato->valla->update(['estado' => 'Disponible']);

        return $contrato->load('valla', 'cliente', 'usuario');
    }

    public function renovar(Contrato $contrato, array $datos): Contrato
    {
        $fechaFin = now()->parse($datos['fecha_inicio'])->addMonths($datos['plazo_meses'])->toDateString();

        $contrato->update([
            'plazo_meses' => $datos['plazo_meses'],
            'fecha_inicio' => $datos['fecha_inicio'],
            'fecha_fin' => $fechaFin,
            'monto_usd' => $datos['monto_usd'] ?? $contrato->monto_usd,
            'estado' => 'Activo',
        ]);

        $contrato->valla->update(['estado' => 'Alquilada']);

        return $contrato->load('valla', 'cliente', 'usuario');
    }

    public function eliminar(Contrato $contrato): void
    {
        if (!$contrato->puedeEliminarse()) {

            throw ValidationException::withMessages([
                'estado' => ['Solo se puede eliminar un contrato cuyo plazo ya finalizó.'],
            ]);

        }

        $contrato->delete();

    }

    public function vencerContratosExpirados(): int
    {
        $contratos = Contrato::where('estado', 'Activo')
            ->whereDate('fecha_fin', '<', now()->toDateString())
            ->get();

        foreach ($contratos as $contrato) {

            $contrato->update(['estado' => 'Finalizado']);

            if ($contrato->valla->estado === 'Alquilada') {

                $contrato->valla->update(['estado' => 'Disponible']);

            }

        }

        return $contratos->count();
    }

    public function resumen(): array
    {
        return [
            'activos' => Contrato::where('estado', 'Activo')->count(),
            'finalizados' => Contrato::where('estado', 'Finalizado')->count(),
            'por_vencer' => Contrato::where('estado', 'Activo')
                ->whereBetween('fecha_fin', [now()->toDateString(), now()->addDays(30)->toDateString()])
                ->count(),
            'monto_activo' => (float) Contrato::where('estado', 'Activo')->sum('monto_usd'),
        ];
    }

    private function crearClienteRapido(string $nombre): int
    {
        return \App\Models\Cliente::create([
            'nombre' => $nombre,
            'cedula' => 'TEMP-' . uniqid(),
            'estado' => 'Activo',
        ])->id;
    }

       private function generarCodigo(Valla $valla, string $fechaInicio): string
    {
        $fecha = now()->parse($fechaInicio);

        return "CT-{$valla->codigo}-{$fecha->format('m')}-{$fecha->format('y')}";
    }
}
