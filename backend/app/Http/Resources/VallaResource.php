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
            'tamano' => $this->tamano,
            'estado' => $this->estado,
            'estructura' => new EstructuraResource($this->whenLoaded('estructura')),
            'fotos' => FotoVallaResource::collection($this->whenLoaded('fotos')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}