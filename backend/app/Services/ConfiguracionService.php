<?php

namespace App\Services;

use App\Models\Bitacora;
use App\Models\Configuracion;
use App\Models\Usuario;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

class ConfiguracionService
{
    public function obtener(): Configuracion
    {
        return Configuracion::actual();
    }

    public function actualizar(Usuario $usuario, array $datos): Configuracion
    {
        $configuracion = Configuracion::actual();

        $configuracion->update($datos);

        Bitacora::create([
            'usuario_id' => $usuario->id,
            'modulo' => 'Configuración',
            'accion' => 'Actualización de parámetros del sistema',
            'descripcion' => 'Se actualizaron los datos generales de configuración.',
        ]);

        return $configuracion->fresh();
    }

    public function actualizarLogo(Usuario $usuario, $archivo): Configuracion
    {
        $configuracion = Configuracion::actual();

        $ruta = $archivo->store('logo', 'public');

        $configuracion->update(['logo' => $ruta]);

        Bitacora::create([
            'usuario_id' => $usuario->id,
            'modulo' => 'Configuración',
            'accion' => 'Actualización de logo',
            'descripcion' => 'Se reemplazó el logo de la empresa.',
        ]);

        return $configuracion->fresh();
    }

    public function actualizarTipoCambioManual(Usuario $usuario): Configuracion
    {
        $tasa = $this->consultarTipoCambio();

        $configuracion = Configuracion::actual();

        $configuracion->update([
            'tipo_cambio' => $tasa,
            'tipo_cambio_actualizado_en' => now(),
        ]);

        Bitacora::create([
            'usuario_id' => $usuario->id,
            'modulo' => 'Configuración',
            'accion' => 'Actualización manual de tipo de cambio',
            'descripcion' => "Nuevo tipo de cambio: ₡{$tasa} por USD.",
        ]);

        return $configuracion->fresh();
    }

    public function actualizarTipoCambioAutomatico(): void
    {
        $configuracion = Configuracion::actual();

        if (! $configuracion->tipo_cambio_auto) {

            return;

        }

        $tasa = $this->consultarTipoCambio();

        $configuracion->update([
            'tipo_cambio' => $tasa,
            'tipo_cambio_actualizado_en' => now(),
        ]);
    }

    private function consultarTipoCambio(): float
    {
        $respuesta = Http::timeout(10)->get('https://open.er-api.com/v6/latest/USD');

        if (! $respuesta->successful() || ! $respuesta->json('rates.CRC')) {

            abort(422, 'No se pudo consultar el tipo de cambio en este momento.');

        }

        return round((float) $respuesta->json('rates.CRC'), 2);
    }

    public function salud(): array
    {
        $baseDatos = config('database.connections.mysql.database');

        $tamanoMb = (float) DB::selectOne(
            'SELECT ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS tamano
             FROM information_schema.tables WHERE table_schema = ?',
            [$baseDatos]
        )->tamano;

        return [
            'php_version' => phpversion(),
            'laravel_version' => app()->version(),
            'base_datos_mb' => $tamanoMb,
            'scheduler_ultima_corrida' => Configuracion::actual()->scheduler_ultima_corrida,
            'modo_mantenimiento' => app()->isDownForMaintenance(),
        ];
    }

    public function toggleMantenimiento(Usuario $usuario, bool $activar): array
    {
        if ($activar) {

            Artisan::call('down');

        } else {

            Artisan::call('up');

        }

        Bitacora::create([
            'usuario_id' => $usuario->id,
            'modulo' => 'Configuración',
            'accion' => $activar ? 'Activó modo mantenimiento' : 'Desactivó modo mantenimiento',
            'descripcion' => $activar
                ? 'El sistema quedó en modo mantenimiento.'
                : 'El sistema volvió a estar disponible.',
        ]);

        return ['modo_mantenimiento' => app()->isDownForMaintenance()];
    }
}
