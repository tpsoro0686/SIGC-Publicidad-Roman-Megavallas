<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

use Illuminate\Support\Facades\Schedule;

Schedule::command('reservas:vencer')->everyFiveMinutes();
Schedule::command('contratos:vencer')->everyFiveMinutes();
Schedule::command('configuracion:actualizar-tipo-cambio')->dailyAt('06:00');
Schedule::command('recordatorios:contratos')->dailyAt('07:00');

Schedule::call(function () {
    \App\Models\Configuracion::actual()->update(['scheduler_ultima_corrida' => now()]);
})->everyFiveMinutes();

// Borra los tokens de sesion ya vencidos
Schedule::command('sanctum:prune-expired --hours=24')->daily();

// Respaldo diario de la base de datos (se conservan los ultimos 14)
Schedule::command('respaldo:base-datos')->dailyAt('02:00');

// Libera las vallas cargadas como ocupadas cuya fecha ya pasó (y que no tienen contrato ni reserva activos)
Schedule::command('vallas:liberar-ocupadas-vencidas')->dailyAt('00:10');
