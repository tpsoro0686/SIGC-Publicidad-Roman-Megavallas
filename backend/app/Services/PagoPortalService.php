<?php

namespace App\Services;

use App\Models\PagoPortal;
use App\Models\SolicitudPortal;
use App\Services\Pagos\PasarelaPago;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

// Logica de pagos del portal. No sabe nada de una pasarela en particular:
// habla con la que este configurada en config/pagos.php (interfaz PasarelaPago).
class PagoPortalService
{
    public function habilitados(): bool
    {
        return (bool) config('pagos.habilitados');
    }

    public function pasarela(?string $nombre = null): PasarelaPago
    {
        $nombre ??= config('pagos.pasarela');

        $clase = config("pagos.pasarelas.{$nombre}");

        abort_if(! $clase, 404);

        return app($clase);
    }

    // Todo en centimos (enteros) para no arrastrar errores de decimales.
    public function montos(SolicitudPortal $solicitud): array
    {
        $solicitud->loadMissing('vallas');

        // Meses que el cliente quiere contratar (si no eligió, se cuenta 1 mes)
        $meses = max(1, (int) $solicitud->plazo_meses_deseado);

        $mensual = (int) round($solicitud->vallas->sum(fn ($valla) => (float) $valla->pivot->precio_mostrado) * 100);

        $alquiler = $mensual * $meses;

        $instalacion = (int) round($solicitud->vallas->sum(fn ($valla) => (float) $valla->precio_instalacion) * 100);

        $total = $alquiler + $instalacion;

        $pagado = (int) round(
            (float) $solicitud->pagos()->where('estado', 'Pagado')->sum('monto') * 100
        );

        $saldo = max(0, $total - $pagado);

        $adelanto = $pagado === 0
            ? min($saldo, (int) round($total * config('pagos.porcentaje_adelanto') / 100))
            : 0;

        return compact('meses', 'mensual', 'alquiler', 'instalacion', 'total', 'pagado', 'saldo', 'adelanto');
    }

    public function opciones(SolicitudPortal $solicitud): array
    {
        $m = $this->montos($solicitud);

        $aDolares = fn (int $centimos) => round($centimos / 100, 2);

        return [
            'codigo' => $solicitud->codigo,
            'moneda' => config('pagos.moneda'),
            'porcentaje_adelanto' => config('pagos.porcentaje_adelanto'),
            'meses' => $m['meses'],
            'mensual' => $aDolares($m['mensual']),
            'alquiler' => $aDolares($m['alquiler']),
            'instalacion' => $aDolares($m['instalacion']),
            'total' => $aDolares($m['total']),
            'pagado' => $aDolares($m['pagado']),
            'saldo' => $aDolares($m['saldo']),
            'opciones' => [
                'adelanto' => $m['adelanto'] > 0 ? $aDolares($m['adelanto']) : null,
                'completo' => $m['saldo'] > 0 ? $aDolares($m['saldo']) : null,
            ],
            'pagos' => $solicitud->pagos()->orderBy('id')->get()->map(fn (PagoPortal $pago) => [
                'referencia' => $pago->referencia,
                'tipo' => $pago->tipo,
                'monto' => (float) $pago->monto,
                'estado' => $pago->estado,
                'pagado_en' => $pago->pagado_en,
            ])->values(),
        ];
    }

    // Crea el cobro y devuelve [pago, urlPago] para mandar al cliente a la pasarela.
    public function iniciar(SolicitudPortal $solicitud, string $tipo): array
    {
        $m = $this->montos($solicitud);

        $centimos = $tipo === 'Adelanto' ? $m['adelanto'] : $m['saldo'];

        if ($centimos <= 0) {

            throw ValidationException::withMessages([
                'tipo' => $tipo === 'Adelanto'
                    ? 'El adelanto ya no está disponible para esta solicitud.'
                    : 'Esta solicitud no tiene saldo pendiente.',
            ]);

        }

        $nombre = config('pagos.pasarela');

        $pago = DB::transaction(function () use ($solicitud, $tipo, $centimos, $nombre) {

            // Un solo cobro pendiente a la vez: los anteriores quedan cancelados
            $solicitud->pagos()->where('estado', 'Pendiente')->update(['estado' => 'Cancelado']);

            $pago = $solicitud->pagos()->create([
                'tipo' => $tipo,
                'monto' => $centimos / 100,
                'moneda' => config('pagos.moneda'),
                'estado' => 'Pendiente',
                'pasarela' => $nombre,
            ]);

            $pago->update(['referencia' => 'PAG-' . str_pad((string) $pago->id, 5, '0', STR_PAD_LEFT)]);

            return $pago;

        });

        try {

            $cobro = $this->pasarela($nombre)->crearCobro($pago, $this->urlRetorno($solicitud));

        }

        catch (\Throwable $error) {

            $pago->update(['estado' => 'Fallido']);

            report($error);

            throw $error;

        }

        $pago->update([
            'pasarela_referencia' => $cobro->pasarelaReferencia,
            'datos' => $cobro->datos ?: null,
        ]);

        return [$pago->fresh(), $cobro->urlPago];
    }

    // Aviso (webhook) de la pasarela. Es seguro recibirlo varias veces.
    public function procesarAviso(string $nombrePasarela, Request $request): ?PagoPortal
    {
        $resultado = $this->pasarela($nombrePasarela)->leerWebhook($request);

        return DB::transaction(function () use ($nombrePasarela, $resultado) {

            $pago = PagoPortal::where('pasarela', $nombrePasarela)
                ->where('referencia', $resultado->referencia)
                ->lockForUpdate()
                ->first();

            abort_if(! $pago, 404);

            $permitido = match ($pago->estado) {
                'Pendiente' => true,
                'Pagado' => $resultado->estado === 'Reembolsado',
                default => false,
            };

            if (! $permitido || $pago->estado === $resultado->estado) {
                return $pago;
            }

            $pago->update([
                'estado' => $resultado->estado,
                'pasarela_referencia' => $resultado->pasarelaReferencia ?? $pago->pasarela_referencia,
                'pagado_en' => $resultado->estado === 'Pagado' ? now() : $pago->pagado_en,
                'datos' => $resultado->datos ?: $pago->datos,
            ]);

            return $pago;

        });
    }

    private function urlRetorno(SolicitudPortal $solicitud): string
    {
        $base = config('pagos.url_retorno');

        return $base . (str_contains($base, '?') ? '&' : '?') . http_build_query(['token' => $solicitud->token]);
    }
}
