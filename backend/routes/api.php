<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\VallaController;
use App\Http\Controllers\ProvinciaController;
use App\Http\Controllers\ReservaController;
use App\Http\Controllers\ClienteController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
    });
});

// A partir de aca se agregan las rutas de los demas modulos
// (vallas, reservas, contratos, clientes, etc.), todas protegidas
// con el middleware auth:sanctum salvo que se indique lo contrario.

Route::middleware('auth:sanctum')->get('/provincias', [ProvinciaController::class, 'index']);

Route::middleware('auth:sanctum')->prefix('vallas')->group(function () {
    Route::get('/', [VallaController::class, 'index']);
    Route::get('/resumen', [VallaController::class, 'resumen']);
    Route::post('/', [VallaController::class, 'store']);
    Route::get('/{valla}', [VallaController::class, 'show']);
    Route::put('/{valla}', [VallaController::class, 'update']);
    Route::patch('/{valla}/estado', [VallaController::class, 'cambiarEstado']);
});

Route::middleware('auth:sanctum')->prefix('reservas')->group(function () {
    Route::get('/', [ReservaController::class, 'index']);
    Route::get('/resumen', [ReservaController::class, 'resumen']);
    Route::post('/', [ReservaController::class, 'store']);
    Route::get('/{reserva}', [ReservaController::class, 'show']);
    Route::patch('/{reserva}/cancelar', [ReservaController::class, 'cancelar']);
    Route::patch('/{reserva}/convertir', [ReservaController::class, 'convertir']);
});

Route::middleware('auth:sanctum')->prefix('clientes')->group(function () {
    Route::get('/', [ClienteController::class, 'index']);
    Route::get('/resumen', [ClienteController::class, 'resumen']);
    Route::post('/', [ClienteController::class, 'store']);
    Route::get('/{cliente}', [ClienteController::class, 'show']);
    Route::put('/{cliente}', [ClienteController::class, 'update']);
});
