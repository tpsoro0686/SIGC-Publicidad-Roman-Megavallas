<?php

namespace Database\Seeders;

use App\Models\Configuracion;
use Illuminate\Database\Seeder;

class ConfiguracionSeeder extends Seeder
{
    public function run(): void
    {
        Configuracion::firstOrCreate(['id' => 1], [
            'tipo_cambio' => 520.00,
            'empresa' => 'Publicidad Roman Megavallas',
            'comision_ejecutivo_pct' => 5.00,
        ]);
    }
}
