<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

// Tabla de una sola fila: parametros globales del sistema.
class Configuracion extends Model
{
    protected $table = 'configuracion';

    protected $fillable = [
        'tipo_cambio', 'tipo_cambio_auto', 'tipo_cambio_actualizado_en',
        'empresa', 'correo', 'telefono', 'direccion', 'cedula_tipo', 'cedula_numero', 'sitio_web',
        'logo',
        'comision_ejecutivo_pct',
        'dias_aviso_vencimiento',
        'notificaciones_activas', 'notificaciones_correo_remitente', 'notificaciones_nombre_remitente',
        'scheduler_ultima_corrida',
    ];

    protected $casts = [
        'tipo_cambio_auto' => 'boolean',
        'tipo_cambio_actualizado_en' => 'datetime',
        'notificaciones_activas' => 'boolean',
        'scheduler_ultima_corrida' => 'datetime',
    ];

    public static function actual(): self
    {
        return static::firstOrCreate(['id' => 1], [
            'tipo_cambio' => 0,
            'comision_ejecutivo_pct' => 0,
        ]);
    }
}
