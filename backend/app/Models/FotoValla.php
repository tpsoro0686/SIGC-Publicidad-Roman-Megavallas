<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FotoValla extends Model
{
    protected $table = 'fotos_vallas';

    public $timestamps = false;

    protected $fillable = ['valla_id', 'ruta_archivo'];

    protected $dates = ['created_at'];

    public function valla(): BelongsTo
    {
        return $this->belongsTo(Valla::class);
    }
}
