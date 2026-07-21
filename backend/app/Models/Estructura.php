<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Estructura extends Model
{
    protected $fillable = ['distrito_id', 'lugar', 'latitud', 'longitud'];

    public function distrito(): BelongsTo
    {
        return $this->belongsTo(Distrito::class);
    }

    // Las caras (una o dos) de esta estructura física.
    public function vallas(): HasMany
    {
        return $this->hasMany(Valla::class);
    }
}
