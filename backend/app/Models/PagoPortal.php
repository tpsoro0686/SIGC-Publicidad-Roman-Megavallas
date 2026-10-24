<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PagoPortal extends Model
{
    protected $table = 'pagos_portal';

    protected $fillable = [
        'solicitud_portal_id', 'referencia', 'tipo', 'monto', 'moneda', 'estado',
        'pasarela', 'pasarela_referencia', 'pagado_en', 'datos',
    ];

    protected $casts = [
        'monto' => 'decimal:2',
        'pagado_en' => 'datetime',
        'datos' => 'array',
    ];

    public function solicitud(): BelongsTo
    {
        return $this->belongsTo(SolicitudPortal::class, 'solicitud_portal_id');
    }
}
