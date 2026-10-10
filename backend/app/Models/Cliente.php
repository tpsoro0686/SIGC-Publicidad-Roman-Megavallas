<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Cliente extends Model
{
    protected $fillable = ['nombre', 'cedula', 'telefono', 'correo', 'direccion', 'estado'];

    /** Datos que todo cliente debe tener completos para poder firmar un contrato. */
    public const CAMPOS_PARA_CONTRATO = ['cedula', 'telefono', 'correo', 'direccion'];

    public function datosCompletos(): bool
    {
        foreach (self::CAMPOS_PARA_CONTRATO as $campo) {

            if (blank($this->{$campo})) {

                return false;

            }

        }

        return true;
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
