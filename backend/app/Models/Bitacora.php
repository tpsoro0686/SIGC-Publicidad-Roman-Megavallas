<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Bitacora extends Model
{
    protected $table = 'bitacora';

    public $timestamps = false;

    protected $fillable = ['usuario_id', 'modulo', 'accion', 'descripcion'];

    protected $dates = ['created_at'];

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class);
    }
}
