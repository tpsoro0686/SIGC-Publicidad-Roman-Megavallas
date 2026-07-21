<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Cliente extends Model
{
    protected $fillable = ['nombre', 'cedula', 'telefono', 'correo', 'direccion', 'estado'];

    public function reservas(): HasMany
    {
        return $this->hasMany(Reserva::class);
    }

    public function contratos(): HasMany
    {
        return $this->hasMany(Contrato::class);
    }
}
