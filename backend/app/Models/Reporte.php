<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Reporte extends Model
{
    protected $fillable = ['tipo', 'formato', 'filtros', 'archivo_pdf', 'archivo_excel', 'usuario_id'];

    protected $casts = [
        'filtros' => 'array',
    ];

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class);
    }
}
