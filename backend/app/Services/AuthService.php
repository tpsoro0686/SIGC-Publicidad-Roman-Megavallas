<?php

namespace App\Services;

use App\Models\Bitacora;
use App\Models\Usuario;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthService
{
    public function login(string $correo, string $password): array
    {
        $usuario = Usuario::where('correo', $correo)->first();

        if (! $usuario || ! Hash::check($password, $usuario->password)) {
            throw ValidationException::withMessages([
                'correo' => ['Las credenciales no son correctas.'],
            ]);
        }

        if ($usuario->estado !== 'Activo') {
            throw ValidationException::withMessages([
                'correo' => ['Este usuario esta inactivo. Contacte a un administrador.'],
            ]);
        }

        $token = $usuario->createToken('sigc-token')->plainTextToken;

        $this->registrarBitacora($usuario, 'Inicio de sesion');

        return [
            'usuario' => $usuario->load('rol'),
            'token' => $token,
        ];
    }

    public function logout(Usuario $usuario): void
    {
        $usuario->currentAccessToken()->delete();
        $this->registrarBitacora($usuario, 'Cierre de sesion');
    }

    private function registrarBitacora(Usuario $usuario, string $accion): void
    {
        Bitacora::create([
            'usuario_id' => $usuario->id,
            'modulo' => 'Autenticacion',
            'accion' => $accion,
            'descripcion' => "{$usuario->nombre} ({$usuario->correo})",
        ]);
    }
}
