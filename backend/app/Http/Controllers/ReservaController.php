<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreReservaRequest;
use App\Http\Resources\ReservaResource;
use App\Models\Reserva;
use App\Services\ReservaService;
use Illuminate\Http\Request;

class ReservaController extends Controller
{
    public function __construct(private ReservaService $reservaService)
    {
    }

    public function index(Request $request)
    {
        $reservas = $this->reservaService->listar(
            $request->query('estado'),
            $request->boolean('solo_mias'),
            $request->user(),
        );

        return ReservaResource::collection($reservas);
    }

    public function store(StoreReservaRequest $request)
    {
        $reserva = $this->reservaService->crear(
            $request->validated(),
            $request->user(),
        );

        return new ReservaResource($reserva);
    }

    public function show(Reserva $reserva)
    {
        return new ReservaResource($reserva->load('valla', 'cliente', 'usuario'));
    }

    public function cancelar(Request $request, Reserva $reserva)
    {
        $reserva = $this->reservaService->cancelar($reserva, $request->user());

        return new ReservaResource($reserva);
    }

    public function convertir(Request $request, Reserva $reserva)
    {
        $reserva = $this->reservaService->convertir($reserva, $request->user());

        return new ReservaResource($reserva);
    }

    public function resumen(Request $request)
    {
        return response()->json($this->reservaService->resumen($request->user()));
    }
}
