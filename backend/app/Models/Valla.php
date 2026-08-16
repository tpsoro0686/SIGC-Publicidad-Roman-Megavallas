<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Valla extends Model
{
    protected $fillable = ['provincia_id', 'codigo', 'referencia', 'latitud', 'longitud', 'tamano', 'precio_normal', 'precio_minimo', 'estado'];

    public function provincia(): BelongsTo
    {
        return $this->belongsTo(Provincia::class);
    }

    public function fotos(): HasMany
    {
        return $this->hasMany(FotoValla::class);
    }

    public function reservas(): HasMany
    {
        return $this->hasMany(Reserva::class);
    }

    public function reservaActiva(): HasOne
    {
        return $this->hasOne(Reserva::class)->where('estado', 'Activa')->latestOfMany();
    }

    public function contratoActivo(): HasOne
    {
        return $this->hasOne(Contrato::class)->where('estado', 'Activo')->latestOfMany();
    }

    public function contratos(): HasMany
    {
        return $this->hasMany(Contrato::class);
    }
}