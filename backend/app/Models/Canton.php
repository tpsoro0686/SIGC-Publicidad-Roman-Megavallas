<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Canton extends Model
{
    protected $table = 'cantones';

    protected $fillable = ['provincia_id', 'nombre'];

    public function provincia(): BelongsTo
    {
        return $this->belongsTo(Provincia::class);
    }

    public function distritos(): HasMany
    {
        return $this->hasMany(Distrito::class);
    }
}
