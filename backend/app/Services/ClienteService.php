<?php

namespace App\Services;

use App\Models\Cliente;

class ClienteService
{
    public function listar(?string $busqueda, ?string $estado)
    {
        return Cliente::withCount('reservas', 'contratos')
            ->when($busqueda, function ($query) use ($busqueda) {

                $query->where(function ($sub) use ($busqueda) {

                    $sub->where('nombre', 'like', "%{$busqueda}%")
                        ->orWhere('cedula', 'like', "%{$busqueda}%");

                });

            })
            ->when($estado, fn ($query) => $query->where('estado', $estado))
            ->orderBy('nombre')
            ->get();
    }

    public function crear(array $datos): Cliente
    {
        return Cliente::create(array_merge($datos, [
            'estado' => $datos['estado'] ?? 'Activo',
        ]));
    }

    public function actualizar(Cliente $cliente, array $datos): Cliente
    {
        $cliente->update($datos);

        return $cliente;
    }

    public function detalle(Cliente $cliente): Cliente
    {
        return $cliente->load([
            'reservas' => fn ($query) => $query->with('valla', 'usuario')->latest('fecha_reserva'),
            'contratos' => fn ($query) => $query->latest('fecha_inicio'),
        ]);
    }

    public function resumen(): array
    {
        return [
            'total' => Cliente::count(),
            'activos' => Cliente::where('estado', 'Activo')->count(),
            'con_contrato_activo' => Cliente::whereHas('contratos', fn ($query) => $query->where('estado', 'Activo'))->count(),
        ];
    }
}
