<?php

namespace App\Console\Commands;

use App\Models\Valla;
use Illuminate\Console\Command;

class LiberarOcupadasVencidas extends Command
{
    protected $signature = 'vallas:liberar-ocupadas-vencidas';

    protected $description = 'Pasa a Disponible las vallas cargadas como ocupadas cuya fecha ya pasó y que no tienen contrato ni reserva activos';

    public function handle(): int
    {
        $vallas = Valla::where('estado', 'Alquilada')
            ->whereNotNull('ocupada_hasta')
            ->whereDate('ocupada_hasta', '<', now()->toDateString())
            ->whereDoesntHave('contratoActivo')
            ->whereDoesntHave('reservaActiva')
            ->get();

        foreach ($vallas as $valla) {
            $valla->update(['estado' => 'Disponible']);
        }

        $this->info("Vallas liberadas: {$vallas->count()}");

        return self::SUCCESS;
    }
}
