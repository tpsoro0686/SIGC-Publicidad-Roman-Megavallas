<?php

namespace App\Http\Resources;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

// Version publica de una valla: SOLO lo que el cliente puede ver.
// Nunca incluye precio_minimo, nombres de clientes, contratos ni ejecutivos.
class PortalVallaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        [$disponibilidad, $disponibleDesde, $tentativa] = $this->disponibilidad();

        $fotos = $this->relationLoaded('fotos') ? $this->fotos : collect();

        return [
            'id' => $this->id,
            'codigo' => $this->codigo,
            'referencia' => $this->referencia,
            'provincia' => $this->relationLoaded('provincia') && $this->provincia
                ? ['id' => $this->provincia->id, 'nombre' => $this->provincia->nombre]
                : null,
            'latitud' => $this->latitud,
            'longitud' => $this->longitud,
            'tamano' => $this->tamano,
            'vehiculos_diarios' => $this->vehiculos_diarios,
            'precio_normal' => $this->precio_normal,
            'precio_instalacion' => $this->precio_instalacion,
            'disponibilidad' => $disponibilidad,
            'disponible_desde' => $disponibleDesde,
            'fecha_tentativa' => $tentativa,
            'foto' => $fotos->isNotEmpty() ? asset('storage/' . $fotos->first()->ruta_archivo) : null,
            'fotos' => $this->when(
                $request->routeIs('portal.vallas.show'),
                fn () => $fotos->map(fn ($foto) => asset('storage/' . $foto->ruta_archivo))->values(),
            ),
        ];
    }

    // Devuelve [disponibilidad, fecha (Y-m-d|null), tentativa]
    private function disponibilidad(): array
    {
        if ($this->estado === 'Disponible') {
            return ['Disponible', null, false];
        }

        if ($this->estado === 'Reservada') {
            $fecha = $this->relationLoaded('reservaActiva') ? $this->reservaActiva?->fecha_vencimiento : null;

            return ['Proximamente', $this->fechaFutura($fecha), true];
        }

        // Alquilada
        $fecha = $this->relationLoaded('contratoActivo') ? $this->contratoActivo?->fecha_fin : null;

        // Vallas cargadas ya ocupadas, sin contrato todavía en el sistema
        $fecha ??= $this->ocupada_hasta;

        return ['Proximamente', $this->fechaFutura($fecha), false];
    }

    // Una fecha ya vencida (que el sistema aun no libero) se muestra "por confirmar".
    private function fechaFutura($fecha): ?string
    {
        if (! $fecha) {
            return null;
        }

        $fecha = Carbon::parse($fecha)->startOfDay();

        return $fecha->greaterThanOrEqualTo(now()->startOfDay()) ? $fecha->toDateString() : null;
    }
}
