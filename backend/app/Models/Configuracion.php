<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

// Tabla de una sola fila: parametros globales del sistema.
class Configuracion extends Model
{
    protected $table = 'configuracion';

    protected $fillable = ['tipo_cambio', 'empresa', 'logo', 'comision_ejecutivo_pct'];

    public static function actual(): self
    {
        return static::firstOrCreate(['id' => 1], [
            'tipo_cambio' => 0,
            'comision_ejecutivo_pct' => 0,
        ]);
    }
}
