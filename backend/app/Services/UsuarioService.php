<?php

namespace App\Services;

use App\Models\Usuario;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class UsuarioService
{
    public function listar(?string $busqueda, ?string $estado, ?int $rolId)
    {
        return Usuario::with('rol')
            ->when($busqueda, function ($query) use ($busqueda) {

                $query->where(function ($sub) use ($busqueda) {

                    $sub->where('nombre', 'like', "%{$busqueda}%")
                        ->orWhere('correo', 'like', "%{$busqueda}%");

                });

            })
            ->when($estado, fn ($query) => $query->where('estado', $estado))
            ->when($rolId, fn ($query) => $query->where('rol_id', $rolId))
            ->orderBy('nombre')
            ->get();
    }

    public function crear(array $datos): Usuario
    {
        return Usuario::create([
            'nombre' => $datos['nombre'],
            'correo' => $datos['correo'],
            'password' => Hash::make($datos['password']),
            'rol_id' => $datos['rol_id'],
            'estado' => 'Activo',
        ]);
    }

    public function actualizar(Usuario $usuario, array $datos, Usuario $usuarioActual): Usuario
    {
        if (isset($datos['estado']) && $datos['estado'] === 'Inactivo' && $usuario->id === $usuarioActual->id) {

            throw ValidationException::withMessages([
                'estado' => ['No podés inactivar tu propia cuenta.'],
            ]);

        }

        if (isset($datos['password']) && $datos['password'] !== '') {

            $datos['password'] = Hash::make($datos['password']);

        } else {

            unset($datos['password']);

        }

        $usuario->update($datos);

        return $usuario->load('rol');
    }

    public function resumen(): array
    {
        return [
            'total' => Usuario::count(),
            'activos' => Usuario::where('estado', 'Activo')->count(),
            'inactivos' => Usuario::where('estado', 'Inactivo')->count(),
            'administradores' => Usuario::whereHas('rol', fn ($query) => $query->where('nombre', 'Administrador'))->count(),
        ];
    }
}
