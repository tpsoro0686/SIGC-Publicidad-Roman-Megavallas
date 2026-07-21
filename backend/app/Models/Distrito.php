<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Distrito extends Model
{
    protected $fillable = ['canton_id', 'nombre'];

    public function canton(): BelongsTo
    {
        return $this->belongsTo(Canton::class);
    }

    public function estructuras(): HasMany
    {
        return $this->hasMany(Estructura::class);
    }
}
