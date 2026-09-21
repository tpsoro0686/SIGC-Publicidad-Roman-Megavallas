<?php

namespace App\Console\Commands;

use App\Services\ConfiguracionService;
use Illuminate\Console\Command;

class ActualizarTipoCambio extends Command
{
    protected $signature = 'configuracion:actualizar-tipo-cambio';

    protected $description = 'Actualiza el tipo de cambio USD -> CRC automáticamente si la opción está activada.';

    public function handle(ConfiguracionService $configuracionService): int
    {
        $configuracionService->actualizarTipoCambioAutomatico();

        $this->info('Tipo de cambio revisado.');

        return self::SUCCESS;
    }
}
