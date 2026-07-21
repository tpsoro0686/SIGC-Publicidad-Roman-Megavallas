<?php

namespace Database\Seeders;

use App\Models\Canton;
use App\Models\Distrito;
use App\Models\Provincia;
use Illuminate\Database\Seeder;

// Catalogo geografico de Costa Rica: Provincia -> Canton -> Distrito.
// Solo se incluyen las 7 provincias y una muestra de cantones/distritos
// (San Jose) a modo de ejemplo. El catalogo completo (81 cantones,
// 490+ distritos) se recomienda importarlo desde datos abiertos del
// IFAM / INEC como un CSV, en vez de escribirlo a mano aqui.
class ProvinciaSeeder extends Seeder
{
    public function run(): void
    {
        $provincias = ['San Jose', 'Alajuela', 'Cartago', 'Heredia', 'Guanacaste', 'Puntarenas', 'Limon'];

        foreach ($provincias as $nombre) {
            Provincia::firstOrCreate(['nombre' => $nombre]);
        }

        // Muestra de cantones y distritos de San Jose, como ejemplo del patron a seguir.
        $sanJose = Provincia::where('nombre', 'San Jose')->first();

        $cantonesEjemplo = [
            'San Jose' => ['Carmen', 'Merced', 'Hospital', 'Catedral', 'Zapote'],
            'Escazu' => ['Escazu', 'San Antonio', 'San Rafael'],
            'Desamparados' => ['Desamparados', 'San Miguel', 'San Juan de Dios'],
        ];

        foreach ($cantonesEjemplo as $nombreCanton => $distritos) {
            $canton = Canton::firstOrCreate([
                'provincia_id' => $sanJose->id,
                'nombre' => $nombreCanton,
            ]);

            foreach ($distritos as $nombreDistrito) {
                Distrito::firstOrCreate([
                    'canton_id' => $canton->id,
                    'nombre' => $nombreDistrito,
                ]);
            }
        }
    }
}
