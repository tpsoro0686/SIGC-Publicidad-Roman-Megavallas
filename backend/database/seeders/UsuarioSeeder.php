<?php

namespace Database\Seeders;

use App\Models\Rol;
use App\Models\Usuario;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UsuarioSeeder extends Seeder
{
    public function run(): void
    {
        $admin = Rol::where('nombre', 'Administrador Sistema')->firstOrFail();

        // La contraseña sale de SEED_ADMIN_PASSWORD (.env); si no existe, se genera una y se muestra aquí.
        $password = env('SEED_ADMIN_PASSWORD') ?: Str::random(14);

        $creado = Usuario::firstOrCreate(
            ['correo' => 'admin@publicidadroman.com'],
            [
                'rol_id' => $admin->id,
                'nombre' => 'Administrador SIGC',
                'password' => Hash::make($password),
                'estado' => 'Activo',
            ]
        );

        if ($creado->wasRecentlyCreated) {

            $this->command?->warn("Usuario admin@publicidadroman.com creado. Contraseña inicial: {$password}");

        }
    }
}
