<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Foundation\Http\Middleware\PreventRequestsDuringMaintenance;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        JsonResource::withoutWrapping();

        PreventRequestsDuringMaintenance::except(['api/configuracion*', 'api/auth/*', 'up']);

        // Login: 5 intentos por minuto para el mismo correo desde la misma IP,
        // y 30 por minuto por IP en total (frena a quien prueba muchos correos).
        RateLimiter::for('login', function (Request $request) {

            $mensaje = ['message' => 'Demasiados intentos de inicio de sesión. Espera un minuto e inténtalo de nuevo.'];

            return [
                Limit::perMinute(5)->by(mb_strtolower((string) $request->input('correo')) . '|' . $request->ip())
                    ->response(fn () => response()->json($mensaje, 429)),
                Limit::perMinute(30)->by($request->ip())
                    ->response(fn () => response()->json($mensaje, 429)),
            ];

        });
    }
}
