<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreVallaRequest;
use App\Http\Requests\UpdateVallaRequest;
use App\Http\Requests\CambiarEstadoVallaRequest;
use App\Http\Resources\VallaResource;
use App\Models\Valla;
use App\Services\VallaService;
use Illuminate\Http\Request;

class VallaController extends Controller
{
    public function __construct(private VallaService $vallaService)
    {
    }

    public function index(Request $request)
    {
        $vallas = $this->vallaService->listar(
            $request->query('estado'),
            $request->query('provincia_id'),
        );

        return VallaResource::collection($vallas);
    }

    public function store(StoreVallaRequest $request)
    {
        $valla = $this->vallaService->crear(
            $request->validated(),
            $request->user(),
        );

        return new VallaResource($valla);
    }

    public function show(Valla $valla)
    {
        return new VallaResource($valla->load(
            'provincia',
            'fotos',
            'reservaActiva.usuario',
            'contratoActivo.cliente',
            'contratoActivo.usuario',
        ));
    }

    public function update(UpdateVallaRequest $request, Valla $valla)
    {
        $valla = $this->vallaService->actualizar(
            $valla,
            $request->validated(),
            $request->user(),
        );

        return new VallaResource($valla);
    }

    public function cambiarEstado(CambiarEstadoVallaRequest $request, Valla $valla)
    {
        $valla = $this->vallaService->cambiarEstado(
            $valla,
            $request->validated('estado'),
            $request->user(),
        );

        return new VallaResource($valla);
    }

    public function resumen()
    {
        return response()->json($this->vallaService->resumen());
    }
    
}