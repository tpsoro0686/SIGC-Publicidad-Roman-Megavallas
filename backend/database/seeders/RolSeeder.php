<?php

namespace Database\Seeders;

use App\Models\Rol;
use Illuminate\Database\Seeder;

class RolSeeder extends Seeder
{
    public function run(): void
    {
                $roles = [
            ['nombre' => 'Administrador Sistema', 'descripcion' => 'Control total del sistema: usuarios, roles y configuracion tecnica.'],
            ['nombre' => 'Administrador Empresa', 'descripcion' => 'Solo lectura de toda la informacion, con acceso a reportes detallados y exportables.'],
            ['nombre' => 'Ejecutivo', 'descripcion' => 'Gestiona vallas, reservas, contratos (solo los propios) y clientes.'],
            ['nombre' => 'Dueño', 'descripcion' => 'Solo lectura de toda la informacion, vista general de alto nivel.'],
            ['nombre' => 'Contable', 'descripcion' => 'Solo lectura de contratos e informacion financiera, sin acceso a datos operativos.'],
        ];

        foreach ($roles as $rol) {
            Rol::firstOrCreate(['nombre' => $rol['nombre']], $rol);
        }
    }
}
