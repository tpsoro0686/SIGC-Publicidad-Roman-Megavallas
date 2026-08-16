<?php

namespace App\Services;

use App\Models\Usuario;
use App\Models\Valla;
use Illuminate\Validation\ValidationException;

class VallaService
{
    public function listar(?string $estado = null)
    {
        return Valla::with('estructura', 'fotos')
            ->when($estado, fn ($query) => $query->where('estado', $estado))
            ->get();
    }

    public function crear(array $datos, Usuario $usuario): Valla
    {
        $valla = Valla::create($datos);

        $this->registrarBitacora($usuario, 'Creacion de valla', $valla);

        return $valla;
    }

    public function actualizar(Valla $valla, array $datos, Usuario $usuario): Valla
    {
        $valla->update($datos);

        $this->registrarBitacora($usuario, 'Edicion de valla', $valla);

        return $valla;
    }

    public function cambiarEstado(Valla $valla, string $nuevoEstado, Usuario $usuario): Valla
    {
        if ($valla->estado === 'Alquilada' && $nuevoEstado === 'Disponible') {
            throw ValidationException::withMessages([
                'estado' => ['No se puede liberar una valla alquilada directamente. Debe finalizarse el contrato primero.'],
            ]);
        }

        $valla->update(['estado' => $nuevoEstado]);

        $this->registrarBitacora($usuario, "Cambio de estado a {$nuevoEstado}", $valla);

        return $valla;
    }

    private function registrarBitacora(Usuario $usuario, string $accion, Valla $valla): void
    {
        \App\Models\Bitacora::create([
            'usuario_id' => $usuario->id,
            'modulo' => 'Vallas',
            'accion' => $accion,
            'descripcion' => "Valla {$valla->codigo}",
        ]);
    }
}