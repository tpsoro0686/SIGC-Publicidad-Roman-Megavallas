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
            'estado' => $this->estado,
            'provincia' => new ProvinciaResource($this->whenLoaded('provincia')),
            'fotos' => FotoVallaResource::collection($this->whenLoaded('fotos')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}