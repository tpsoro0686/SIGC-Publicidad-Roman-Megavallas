<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ReporteResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'tipo' => $this->tipo,
            'formato' => $this->formato,
            'filtros' => $this->filtros,
            'tiene_pdf' => ! is_null($this->archivo_pdf),
            'tiene_excel' => ! is_null($this->archivo_excel),
            'usuario' => $this->usuario->nombre,
            'creado' => $this->created_at->format('Y-m-d H:i'),
        ];
    }
}
