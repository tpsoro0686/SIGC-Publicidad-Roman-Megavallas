<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SolicitudPortalResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'codigo' => $this->codigo,
            'nombre' => $this->nombre,
            'empresa' => $this->empresa,
            'telefono' => $this->telefono,
            'correo' => $this->correo,
            'mensaje' => $this->mensaje,
            'fecha_inicio_deseada' => $this->fecha_inicio_deseada?->toDateString(),
            'plazo_meses_deseado' => $this->plazo_meses_deseado,
            'estado' => $this->estado,
            'ejecutivo' => $this->relationLoaded('ejecutivo') && $this->ejecutivo
                ? ['id' => $this->ejecutivo->id, 'nombre' => $this->ejecutivo->nombre]
                : null,
            'vallas' => $this->whenLoaded('vallas', fn () => $this->vallas->map(fn ($valla) => [
                'id' => $valla->id,
                'codigo' => $valla->codigo,
                'referencia' => $valla->referencia,
                'provincia' => $valla->relationLoaded('provincia') ? $valla->provincia?->nombre : null,
                'precio_mostrado' => $valla->pivot->precio_mostrado,
            ])->values()),
                        'pagos' => $this->pagos->map(fn ($pago) => [
                'referencia' => $pago->referencia,
                'tipo' => $pago->tipo,
                'monto' => (float) $pago->monto,
                'estado' => $pago->estado,
                'pagado_en' => $pago->pagado_en,
            ])->values(),
            'atendida_en' => $this->atendida_en,
            'created_at' => $this->created_at,
        ];
    }
}
