<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('roles')->where('nombre', 'Administrador')->update([
            'nombre' => 'Administrador Sistema',
            'descripcion' => 'Control total del sistema: usuarios, roles y configuracion tecnica.',
        ]);

        DB::table('roles')->where('nombre', 'Operador')->update([
            'nombre' => 'Ejecutivo',
            'descripcion' => 'Gestiona vallas, reservas, contratos (solo los propios) y clientes.',
        ]);

        DB::table('roles')->where('nombre', 'Consulta')->update([
            'nombre' => 'Dueño',
            'descripcion' => 'Solo lectura de toda la informacion, vista general de alto nivel.',
        ]);

        DB::table('roles')->insertOrIgnore([
            [
                'nombre' => 'Administrador Empresa',
                'descripcion' => 'Solo lectura de toda la informacion, con acceso a reportes detallados y exportables.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nombre' => 'Contable',
                'descripcion' => 'Solo lectura de contratos e informacion financiera, sin acceso a datos operativos.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    public function down(): void
    {
        DB::table('roles')->where('nombre', 'Administrador Sistema')->update(['nombre' => 'Administrador']);
        DB::table('roles')->where('nombre', 'Ejecutivo')->update(['nombre' => 'Operador']);
        DB::table('roles')->where('nombre', 'Dueño')->update(['nombre' => 'Consulta']);

        DB::table('roles')->whereIn('nombre', ['Administrador Empresa', 'Contable'])->delete();
    }
};
