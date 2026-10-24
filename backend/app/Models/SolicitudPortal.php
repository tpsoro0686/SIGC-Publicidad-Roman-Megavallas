<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class SolicitudPortal extends Model
{
    protected $table = 'solicitudes_portal';

    protected $fillable = [
        'codigo', 'nombre', 'empresa', 'telefono', 'correo', 'mensaje',
        'fecha_inicio_deseada', 'plazo_meses_deseado', 'usuario_id', 'usuario_turno_id', 'estado', 'atendida_en',
    ];

    protected $casts = [
        'fecha_inicio_deseada' => 'date',
        'atendida_en' => 'datetime',
    ];

        // Codigo secreto para que el cliente consulte/pague su solicitud sin login
    protected static function booted(): void
    {
        static::creating(function (SolicitudPortal $solicitud) {
            $solicitud->token ??= Str::random(40);
        });
    }

    public function pagos(): HasMany
    {
        return $this->hasMany(PagoPortal::class, 'solicitud_portal_id');
    }

    public function ejecutivo(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }

    public function vallas(): BelongsToMany
    {
        return $this->belongsToMany(Valla::class, 'solicitud_portal_vallas', 'solicitud_portal_id', 'valla_id')
            ->withPivot('precio_mostrado');
    }
}
