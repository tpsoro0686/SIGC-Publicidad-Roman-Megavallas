<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Reserva extends Model
{
    protected $fillable = ['valla_id', 'cliente_id', 'usuario_id', 'fecha_reserva', 'fecha_vencimiento', 'estado'];

    protected $casts = [
        'fecha_reserva' => 'date',
        'fecha_vencimiento' => 'date',
    ];

    public function valla(): BelongsTo
    {
        return $this->belongsTo(Valla::class);
    }

    public function cliente(): BelongsTo
    {
        return $this->belongsTo(Cliente::class);
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class);
    }

    public function contrato(): HasOne
    {
        return $this->hasOne(Contrato::class);
    }
}
