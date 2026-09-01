<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ContratoResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'codigo' => $this->codigo,
            'estado' => $this->estado,
            'monto_usd' => (float) $this->monto_usd,
            'monto_mensual' => $this->monto_mensual,
            'plazo_meses' => $this->plazo_meses,
            'fecha_inicio' => $this->fecha_inicio?->format('Y-m-d'),
            'fecha_fin' => $this->fecha_fin?->format('Y-m-d'),
            'puede_eliminarse' => $this->puedeEliminarse(),
            'valla' => [
                'id' => $this->valla->id,
                'codigo' => $this->valla->codigo,
                'referencia' => $this->valla->referencia,
            ],
            'cliente' => [
                'id' => $this->cliente->id,
                'nombre' => $this->cliente->nombre,
            ],
            'usuario' => [
                'id' => $this->usuario->id,
                'nombre' => $this->usuario->nombre,
            ],
        ];
    }
}
