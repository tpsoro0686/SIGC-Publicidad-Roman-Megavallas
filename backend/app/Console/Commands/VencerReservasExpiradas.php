<?php

namespace App\Console\Commands;

use App\Services\ReservaService;
use Illuminate\Console\Command;

class VencerReservasExpiradas extends Command
{
    protected $signature = 'reservas:vencer';

    protected $description = 'Marca como Vencidas las reservas activas cuya fecha de vencimiento ya pasó, y libera la valla asociada.';

    public function handle(ReservaService $reservaService): int
    {
        $cantidad = $reservaService->vencerReservasExpiradas();

        $this->info("Reservas vencidas actualizadas: {$cantidad}");

        return self::SUCCESS;
    }
}
