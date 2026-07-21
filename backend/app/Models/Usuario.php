<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

// Este modelo reemplaza al "User" por defecto de Laravel.
// Ver README.md para el cambio necesario en config/auth.php.
class Usuario extends Authenticatable
{
    use HasApiTokens;

    protected $table = 'usuarios';

    protected $fillable = ['rol_id', 'nombre', 'correo', 'password', 'estado'];

    protected $hidden = ['password'];

    // Laravel usa "email" internamente para auth; se mapea a "correo".
    public function getAuthPasswordName(): string
    {
        return 'password';
    }

    public function rol(): BelongsTo
    {
        return $this->belongsTo(Rol::class);
    }

    public function reservas(): HasMany
    {
        return $this->hasMany(Reserva::class);
    }

    public function contratos(): HasMany
    {
        return $this->hasMany(Contrato::class);
    }

    public function bitacora(): HasMany
    {
        return $this->hasMany(Bitacora::class);
    }
}
