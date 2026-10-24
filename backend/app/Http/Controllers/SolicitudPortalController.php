<?php

namespace App\Http\Controllers;

use App\Http\Resources\SolicitudPortalResource;
use App\Models\SolicitudPortal;
use App\Services\SolicitudPortalService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

// Bandeja de solicitudes del portal dentro del SIGC (con login).
class SolicitudPortalController extends Controller
{
    public function __construct(private SolicitudPortalService $service)
    {
    }

    public function index(Request $request)
    {
        $solicitudes = $this->service->listar(
            $request->user(),
            $request->query('estado'),
            $request->query('busqueda'),
            (int) $request->query('per_page', 20),
        );

        return SolicitudPortalResource::collection($solicitudes);
    }

    public function resumen(Request $request)
    {
        return response()->json($this->service->resumen($request->user()));
    }

    public function show(Request $request, SolicitudPortal $solicitud)
    {
        return new SolicitudPortalResource($this->service->obtener($request->user(), $solicitud));
    }

    public function cambiarEstado(Request $request, SolicitudPortal $solicitud)
    {
        $datos = $request->validate([
            'estado' => ['required', Rule::in(['Nueva', 'En seguimiento', 'Cerrada'])],
        ]);

        return new SolicitudPortalResource(
            $this->service->cambiarEstado($solicitud, $datos['estado'], $request->user())
        );
    }

    public function reasignar(Request $request, SolicitudPortal $solicitud)
    {
        $datos = $request->validate([
            'usuario_id' => ['required', 'integer'],
        ]);

        return new SolicitudPortalResource(
            $this->service->reasignar($solicitud, (int) $datos['usuario_id'], $request->user())
        );
    }
}
