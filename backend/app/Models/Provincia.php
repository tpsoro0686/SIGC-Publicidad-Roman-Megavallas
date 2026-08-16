<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Provincia extends Model
{
    protected $fillable = ['nombre'];

    public function vallas(): HasMany
    {
        return $this->hasMany(Valla::class);
    }
}