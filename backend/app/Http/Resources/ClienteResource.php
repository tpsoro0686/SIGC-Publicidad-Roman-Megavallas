<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ClienteResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'nombre' => $this->nombre,
            'cedula' => $this->cedula,
            'telefono' => $this->telefono,
            'correo' => $this->correo,
            'direccion' => $this->direccion,
            'estado' => $this->estado,
            'reservas_count' => $this->whenCounted('reservas'),
            'contratos_count' => $this->whenCounted('contratos'),
            'reservas' => ReservaResource::collection($this->whenLoaded('reservas')),
            'contratos' => $this->whenLoaded('contratos', function () {

                return $this->contratos->map(fn ($contrato) => [
                    'id' => $contrato->id,
                    'codigo' => $contrato->codigo,
                    'estado' => $contrato->estado,
                    'monto_usd' => $contrato->monto_usd,
                    'plazo_meses' => $contrato->plazo_meses,
                    'fecha_inicio' => $contrato->fecha_inicio?->format('Y-m-d'),
                    'fecha_fin' => $contrato->fecha_fin?->format('Y-m-d'),
                ]);

            }),
        ];
    }
}
