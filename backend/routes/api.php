<?php

use App\Http\Controllers\AuthController;
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
