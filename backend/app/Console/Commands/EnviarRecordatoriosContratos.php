<?php

namespace App\Console\Commands;

use App\Services\RecordatorioService;
use Illuminate\Console\Command;

class EnviarRecordatoriosContratos extends Command
{
    protected $signature = 'recordatorios:contratos';

    protected $description = 'Envía recordatorios por correo de contratos próximos a vencer (hitos: 30, 22, 15, 8 y 5 días, y diario del 5 al 0).';

    public function handle(RecordatorioService $recordatorioService): int
    {
        $enviados = $recordatorioService->enviarRecordatoriosContratos();

        $this->info("Recordatorios enviados: {$enviados}");

        return self::SUCCESS;
    }
}
