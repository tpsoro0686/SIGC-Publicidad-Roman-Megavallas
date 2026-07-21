<?php

namespace Database\Seeders;

use App\Models\Rol;
use Illuminate\Database\Seeder;

class RolSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            ['nombre' => 'Administrador', 'descripcion' => 'Control total del sistema, incluyendo usuarios y configuracion.'],
            ['nombre' => 'Operador', 'descripcion' => 'Gestiona vallas, reservas, contratos y clientes. Sin acceso a usuarios ni configuracion.'],
            ['nombre' => 'Consulta', 'descripcion' => 'Solo lectura. Sin acceso a usuarios, configuracion ni reportes.'],
        ];

        foreach ($roles as $rol) {
            Rol::firstOrCreate(['nombre' => $rol['nombre']], $rol);
        }
    }
}
