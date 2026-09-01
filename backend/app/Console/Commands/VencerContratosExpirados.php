<?php

namespace App\Console\Commands;

use App\Services\ContratoService;
use Illuminate\Console\Command;

class VencerContratosExpirados extends Command
{
    protected $signature = 'contratos:vencer';

    protected $description = 'Marca como Finalizados los contratos activos cuya fecha de fin ya pasó, y libera la valla asociada.';

    public function handle(ContratoService $contratoService): int
    {
        $cantidad = $contratoService->vencerContratosExpirados();

        $this->info("Contratos finalizados actualizados: {$cantidad}");

        return self::SUCCESS;
    }
}
