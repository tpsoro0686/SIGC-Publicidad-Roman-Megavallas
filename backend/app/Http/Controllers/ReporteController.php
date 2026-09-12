<?php

namespace App\Http\Controllers;

use App\Http\Requests\GenerarReporteRequest;
use App\Http\Resources\ReporteResource;
use App\Models\Reporte;
use App\Services\ReporteService;
use Illuminate\Http\Request;

class ReporteController extends Controller
{
    public function __construct(private ReporteService $reporteService)
    {
    }

    public function index()
    {
        return ReporteResource::collection($this->reporteService->listar());
    }

    public function resumen(Request $request)
    {
        return response()->json($this->reporteService->resumenTarjetas($request->user()));
    }

    public function tipos(Request $request)
    {
        return response()->json($this->reporteService->tiposPermitidos($request->user()));
    }

        public function store(GenerarReporteRequest $request)
    {
        $reporte = $this->reporteService->generar(
            $request->validated('tipo'),
            $request->validated('fecha_desde'),
            $request->validated('fecha_hasta'),
            $request->user(),
        );

        return new ReporteResource($reporte);
    }

    public function descargar(Reporte $reporte, string $formato)
    {
        return $this->reporteService->descargar($reporte, $formato);
    }
}
