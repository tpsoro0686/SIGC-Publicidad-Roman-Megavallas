<?php

namespace App\Services\Pagos;

use App\Models\PagoPortal;
use Illuminate\Http\Request;

// Pasarela de PRUEBA: no cobra nada. Sirve para ver todo el flujo en local
// antes de contratar una pasarela real. Se niega a funcionar en produccion.
class PasarelaSimulada implements PasarelaPago
{
    private const ESTADOS = ['Pagado', 'Fallido', 'Cancelado'];

    public function crearCobro(PagoPortal $pago, string $urlRetorno): CobroCreado
    {
        $this->soloPruebas();

        $separador = str_contains($urlRetorno, '?') ? '&' : '?';

        return new CobroCreado(
            urlPago: $urlRetorno . $separador . http_build_query(['pago' => 'simulado', 'ref' => $pago->referencia]),
            pasarelaReferencia: 'SIM-' . $pago->referencia,
        );
    }

    public function leerWebhook(Request $request): ResultadoPago
    {
        $this->soloPruebas();

        $referencia = (string) $request->input('referencia');
        $estado = (string) $request->input('estado');

        if ($referencia === '' || ! in_array($estado, self::ESTADOS, true)) {
            throw new \InvalidArgumentException('Datos del aviso no validos.');
        }

        return new ResultadoPago($referencia, $estado, 'SIM-' . $referencia);
    }

    private function soloPruebas(): void
    {
        if (app()->environment('production')) {
            throw new \RuntimeException('La pasarela simulada no se puede usar en produccion.');
        }
    }
}
