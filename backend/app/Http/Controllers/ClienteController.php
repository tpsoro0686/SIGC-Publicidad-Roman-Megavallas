<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreClienteRequest;
use App\Http\Requests\UpdateClienteRequest;
use App\Http\Resources\ClienteResource;
use App\Models\Cliente;
use App\Services\ClienteService;
use Illuminate\Http\Request;

class ClienteController extends Controller
{
    public function __construct(private ClienteService $clienteService)
    {
    }

    public function index(Request $request)
    {
        $clientes = $this->clienteService->listar(
            $request->query('busqueda'),
            $request->query('estado'),
        );

        return ClienteResource::collection($clientes);
    }

    public function store(StoreClienteRequest $request)
    {
        $cliente = $this->clienteService->crear($request->validated());

        return new ClienteResource($cliente);
    }

    public function show(Cliente $cliente)
    {
        $cliente = $this->clienteService->detalle($cliente);

        return new ClienteResource($cliente);
    }

    public function update(UpdateClienteRequest $request, Cliente $cliente)
    {
        $cliente = $this->clienteService->actualizar($cliente, $request->validated());

        return new ClienteResource($cliente);
    }

    public function resumen()
    {
        return response()->json($this->clienteService->resumen());
    }
}
