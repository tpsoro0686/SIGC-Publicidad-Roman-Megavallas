<?php

namespace App\Http\Controllers;

use App\Http\Requests\RenovarContratoRequest;
use App\Http\Requests\StoreContratoRequest;
use App\Http\Resources\ContratoResource;
use App\Models\Contrato;
use App\Services\ContratoService;
use Illuminate\Http\Request;

class ContratoController extends Controller
{
    public function __construct(private ContratoService $contratoService)
    {
    }

    public function index(Request $request)
    {
        $contratos = $this->contratoService->listar($request->query('estado'));

        return ContratoResource::collection($contratos);
    }

    public function store(StoreContratoRequest $request)
    {
        $contrato = $this->contratoService->crear($request->validated(), $request->user());

        return new ContratoResource($contrato);
    }

    public function show(Contrato $contrato)
    {
        return new ContratoResource($contrato->load('valla', 'cliente', 'usuario'));
    }

    public function finalizar(Contrato $contrato)
    {
        $contrato = $this->contratoService->finalizarAntes($contrato);

        return new ContratoResource($contrato);
    }

    public function renovar(RenovarContratoRequest $request, Contrato $contrato)
    {
        $contrato = $this->contratoService->renovar($contrato, $request->validated());

        return new ContratoResource($contrato);
    }

    public function destroy(Contrato $contrato)
    {
        $this->contratoService->eliminar($contrato);

        return response()->json(null, 204);
    }

    public function resumen()
    {
        return response()->json($this->contratoService->resumen());
    }
}
