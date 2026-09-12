<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\VallaController;
use App\Http\Controllers\ProvinciaController;
use App\Http\Controllers\ReservaController;
use App\Http\Controllers\ClienteController;
use App\Http\Controllers\ContratoController;
use App\Http\Controllers\UsuarioController;
use App\Http\Controllers\RolController;
use App\Http\Controllers\PerfilController;
use App\Http\Controllers\DashboardController;
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

Route::middleware('auth:sanctum')->get('/dashboard', [DashboardController::class, 'index']);

Route::middleware('auth:sanctum')->get('/provincias', [ProvinciaController::class, 'index']);

Route::middleware(['auth:sanctum', 'role:Administrador Sistema,Administrador Empresa,Ejecutivo,Dueño'])->prefix('vallas')->group(function () {
    Route::get('/', [VallaController::class, 'index']);
    Route::get('/resumen', [VallaController::class, 'resumen']);
    Route::get('/{valla}', [VallaController::class, 'show']);
});

Route::middleware(['auth:sanctum', 'role:Administrador Sistema,Ejecutivo'])->prefix('vallas')->group(function () {
    Route::post('/', [VallaController::class, 'store']);
    Route::put('/{valla}', [VallaController::class, 'update']);
    Route::patch('/{valla}/estado', [VallaController::class, 'cambiarEstado']);
});


Route::middleware(['auth:sanctum', 'role:Administrador Sistema,Administrador Empresa,Ejecutivo,Dueño'])->prefix('reservas')->group(function () {
    Route::get('/', [ReservaController::class, 'index']);
    Route::get('/resumen', [ReservaController::class, 'resumen']);
    Route::get('/{reserva}', [ReservaController::class, 'show']);
});

Route::middleware(['auth:sanctum', 'role:Administrador Sistema,Ejecutivo'])->prefix('reservas')->group(function () {
    Route::post('/', [ReservaController::class, 'store']);
    Route::patch('/{reserva}/cancelar', [ReservaController::class, 'cancelar']);
    Route::patch('/{reserva}/convertir', [ReservaController::class, 'convertir']);
});

Route::middleware(['auth:sanctum', 'role:Administrador Sistema,Administrador Empresa,Ejecutivo,Dueño,Contable'])->prefix('clientes')->group(function () {
    Route::get('/', [ClienteController::class, 'index']);
    Route::get('/resumen', [ClienteController::class, 'resumen']);
    Route::get('/{cliente}', [ClienteController::class, 'show']);
});

Route::middleware(['auth:sanctum', 'role:Administrador Sistema,Ejecutivo'])->prefix('clientes')->group(function () {
    Route::post('/', [ClienteController::class, 'store']);
    Route::put('/{cliente}', [ClienteController::class, 'update']);
});

Route::middleware(['auth:sanctum', 'role:Administrador Sistema,Administrador Empresa,Ejecutivo,Dueño,Contable'])->prefix('contratos')->group(function () {
    Route::get('/', [ContratoController::class, 'index']);
    Route::get('/resumen', [ContratoController::class, 'resumen']);
    Route::get('/{contrato}', [ContratoController::class, 'show']);
});

Route::middleware(['auth:sanctum', 'role:Administrador Sistema,Ejecutivo'])->prefix('contratos')->group(function () {
    Route::post('/', [ContratoController::class, 'store']);
    Route::patch('/{contrato}/finalizar', [ContratoController::class, 'finalizar']);
    Route::patch('/{contrato}/renovar', [ContratoController::class, 'renovar']);
    Route::delete('/{contrato}', [ContratoController::class, 'destroy']);
});

Route::middleware('auth:sanctum')->get('/roles', [RolController::class, 'index']);

Route::middleware(['auth:sanctum', 'role:Administrador Sistema'])->prefix('usuarios')->group(function () {
    Route::get('/', [UsuarioController::class, 'index']);
    Route::get('/resumen', [UsuarioController::class, 'resumen']);
    Route::post('/', [UsuarioController::class, 'store']);
    Route::get('/{usuario}', [UsuarioController::class, 'show']);
    Route::put('/{usuario}', [UsuarioController::class, 'update']);
});

Route::middleware('auth:sanctum')->prefix('perfil')->group(function () {
    Route::put('/', [PerfilController::class, 'update']);
    Route::patch('/password', [PerfilController::class, 'cambiarPassword']);
    Route::get('/estadisticas', [PerfilController::class, 'estadisticas']);
    Route::get('/actividad', [PerfilController::class, 'actividad']);
    Route::get('/actividad/exportar', [PerfilController::class, 'exportarActividad']);
    Route::get('/sesiones', [PerfilController::class, 'sesiones']);
    Route::delete('/sesiones/{tokenId}', [PerfilController::class, 'revocarSesion']);
});
