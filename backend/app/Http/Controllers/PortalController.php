<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSolicitudPortalRequest;
use App\Http\Resources\PortalVallaResource;
use App\Models\Provincia;
use App\Models\Valla;
use App\Services\SolicitudPortalService;

// Rutas PUBLICAS del portal de clientes (sin login).
class PortalController extends Controller
{
    public function __construct(private SolicitudPortalService $solicitudService)
    {
    }

    public function vallas()
    {
        $vallas = Valla::whereNotIn('estado', SolicitudPortalService::ESTADOS_OCULTOS)
            ->with('provincia', 'fotos', 'reservaActiva', 'contratoActivo')
            ->orderBy('codigo')
            ->get();

        return PortalVallaResource::collection($vallas);
    }

    public function valla(Valla $valla)
    {
        abort_if(in_array($valla->estado, SolicitudPortalService::ESTADOS_OCULTOS, true), 404);

        return new PortalVallaResource(
            $valla->load('provincia', 'fotos', 'reservaActiva', 'contratoActivo')
        );
    }

    public function provincias()
    {
        $provincias = Provincia::whereHas('vallas', fn ($query) => $query->whereNotIn('estado', SolicitudPortalService::ESTADOS_OCULTOS))
            ->orderBy('nombre')
            ->get(['id', 'nombre']);

        return response()->json($provincias);
    }

    public function crearSolicitud(StoreSolicitudPortalRequest $request)
    {
        // Bots: el campo trampa viene lleno. Se responde "ok" sin guardar nada.
        if (filled($request->input('sitio_web'))) {

            return response()->json([
                'message' => 'Solicitud enviada.',
                'data' => ['codigo' => 'SOL-0000'],
            ], 201);

        }

        $solicitud = $this->solicitudService->crear($request->validated());

        return response()->json([
            'message' => 'Solicitud enviada. Un ejecutivo se pondrá en contacto contigo pronto.',
            'data' => ['codigo' => $solicitud->codigo, 'token' => $solicitud->token],
        ], 201);
    }
}
