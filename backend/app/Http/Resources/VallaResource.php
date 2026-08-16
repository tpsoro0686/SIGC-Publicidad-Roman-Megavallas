<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VallaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'codigo' => $this->codigo,
            'referencia' => $this->referencia,
            'latitud' => $this->latitud,
            'longitud' => $this->longitud,
            'tamano' => $this->tamano,
            'precio_normal' => $this->precio_normal,
            'precio_minimo' => $this->precio_minimo,
            'estado' => $this->estado,
            'provincia' => new ProvinciaResource($this->whenLoaded('provincia')),
            'fotos' => FotoVallaResource::collection($this->whenLoaded('fotos')),
            'reserva_activa' => $this->when($this->relationLoaded('reservaActiva') && $this->reservaActiva, function () {
                return [
                    'ejecutivo' => $this->reservaActiva->usuario->nombre,
                    'fecha_reserva' => $this->reservaActiva->fecha_reserva,
                    'fecha_vencimiento' => $this->reservaActiva->fecha_vencimiento,
                ];
            }),
            'contrato_activo' => $this->when($this->relationLoaded('contratoActivo') && $this->contratoActivo, function () {
                return [
                    'cliente' => $this->contratoActivo->cliente->nombre,
                    'ejecutivo' => $this->contratoActivo->usuario->nombre,
                    'monto_usd' => $this->contratoActivo->monto_usd,
                    'plazo_meses' => $this->contratoActivo->plazo_meses,
                    'fecha_inicio' => $this->contratoActivo->fecha_inicio,
                    'fecha_fin' => $this->contratoActivo->fecha_fin,
                    'dias_restantes' => (int) now()->diffInDays($this->contratoActivo->fecha_fin, false),
                ];
            }),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}