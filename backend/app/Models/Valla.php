<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Valla extends Model
{
    protected $fillable = ['estructura_id', 'codigo', 'tamano', 'estado'];

    public function estructura(): BelongsTo
    {
        return $this->belongsTo(Estructura::class);
    }

    public function fotos(): HasMany
    {
        return $this->hasMany(FotoValla::class);
    }

    public function reservas(): HasMany
    {
        return $this->hasMany(Reserva::class);
    }

    public function contratos(): HasMany
    {
        return $this->hasMany(Contrato::class);
    }
}