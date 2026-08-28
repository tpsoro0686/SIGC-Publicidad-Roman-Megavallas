<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ReservaResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'estado' => $this->estado,
            'fecha_reserva' => $this->fecha_reserva?->format('Y-m-d'),
            'fecha_vencimiento' => $this->fecha_vencimiento?->format('Y-m-d'),
            'dias_restantes' => $this->estado === 'Activa'
                ? now()->startOfDay()->diffInDays($this->fecha_vencimiento, false)
                : null,
            'valla' => [
                'id' => $this->valla->id,
                'codigo' => $this->valla->codigo,
                'referencia' => $this->valla->referencia,
            ],
            'cliente' => [
                'id' => $this->cliente->id,
                'nombre' => $this->cliente->nombre,
                'telefono' => $this->cliente->telefono,
            ],
            'usuario' => [
                'id' => $this->usuario->id,
                'nombre' => $this->usuario->nombre,
            ],
        ];
    }
}
