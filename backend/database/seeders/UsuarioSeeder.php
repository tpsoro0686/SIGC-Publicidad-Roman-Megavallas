<?php

namespace Database\Seeders;

use App\Models\Rol;
use App\Models\Usuario;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UsuarioSeeder extends Seeder
{
    public function run(): void
    {
        $admin = Rol::where('nombre', 'Administrador')->first();

        Usuario::firstOrCreate(
            ['correo' => 'admin@publicidadroman.com'],
            [
                'rol_id' => $admin->id,
                'nombre' => 'Administrador SIGC',
                'password' => Hash::make('CAMBIAR-ESTA-PASSWORD'),
                'estado' => 'Activo',
            ]
        );
    }
}
