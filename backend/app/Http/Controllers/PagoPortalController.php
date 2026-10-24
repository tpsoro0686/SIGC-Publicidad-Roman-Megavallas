<?php

namespace App\Http\Controllers;

use App\Models\SolicitudPortal;
use App\Services\PagoPortalService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

// Rutas PUBLICAS del portal para pagar. Al cliente se le identifica con el
// "token" secreto de su solicitud (no hay login).
class PagoPortalController extends Controller
{
    public function __construct(private PagoPortalService $pagos)
    {
    }

    // El portal consulta esto para saber si debe mostrar opciones de pago.
    public function configuracion()
    {
        return response()->json([
            'pagos_habilitados' => $this->pagos->habilitados(),
            'moneda' => config('pagos.moneda'),
            'porcentaje_adelanto' => config('pagos.porcentaje_adelanto'),
        ]);
    }

    public function opciones(string $token)
    {
        abort_if(! $this->pagos->habilitados(), 404);

        return response()->json($this->pagos->opciones($this->solicitud($token)));
    }

    public function iniciar(Request $request, string $token)
    {
        abort_if(! $this->pagos->habilitados(), 404);

        $datos = $request->validate([
            'tipo' => ['required', Rule::in(['Adelanto', 'Completo'])],
        ]);

        try {

            [$pago, $url] = $this->pagos->iniciar($this->solicitud($token), $datos['tipo']);

        }

        catch (\Illuminate\Validation\ValidationException $error) {

            throw $error;

        }

        catch (\Throwable) {

            return response()->json(['message' => 'No se pudo iniciar el pago. Inténtalo de nuevo en unos minutos.'], 502);

        }

        return response()->json([
            'referencia' => $pago->referencia,
            'monto' => (float) $pago->monto,
            'url_pago' => $url,
        ], 201);
    }

    // La pasarela avisa aqui el resultado del pago.
    public function aviso(Request $request, string $pasarela)
    {
        try {

            $pago = $this->pagos->procesarAviso($pasarela, $request);

        }

        catch (\InvalidArgumentException $error) {

            return response()->json(['message' => $error->getMessage()], 422);

        }

        return response()->json(['referencia' => $pago?->referencia, 'estado' => $pago?->estado]);
    }

    private function solicitud(string $token): SolicitudPortal
    {
        return SolicitudPortal::where('token', $token)->firstOrFail();
    }
}
