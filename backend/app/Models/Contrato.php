<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Contrato extends Model
{
    protected $fillable = [
        'reserva_id', 'valla_id', 'cliente_id', 'usuario_id',
        'codigo', 'monto_usd', 'plazo_meses', 'fecha_inicio', 'fecha_fin', 'estado',
    ];

    protected $casts = [
        'fecha_inicio' => 'date',
        'fecha_fin' => 'date',
        'monto_usd' => 'decimal:2',
    ];

    public function reserva(): BelongsTo
    {
        return $this->belongsTo(Reserva::class);
    }

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

    // Monto mensual calculado, no se persiste en BD (decision del Documento 5).
    public function getMontoMensualAttribute(): float
    {
        if (! $this->plazo_meses) {
            return 0;
        }

        return round($this->monto_usd / $this->plazo_meses, 2);
    }

    // Solo un Administrador puede eliminar, y solo si el plazo ya finalizo.
    public function puedeEliminarse(): bool
    {
        return $this->fecha_fin->isPast();
    }
}
