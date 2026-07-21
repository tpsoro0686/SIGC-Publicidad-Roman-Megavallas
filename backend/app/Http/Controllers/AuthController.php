<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Http\Resources\UsuarioResource;
use App\Services\AuthService;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function __construct(private AuthService $authService)
    {
    }

    public function login(LoginRequest $request)
    {
        $data = $this->authService->login(
            $request->validated('correo'),
            $request->validated('password'),
        );

        return response()->json([
            'usuario' => new UsuarioResource($data['usuario']),
            'token' => $data['token'],
        ]);
    }

    public function logout(Request $request)
    {
        $this->authService->logout($request->user());

        return response()->json(['message' => 'Sesion cerrada correctamente.']);
    }

    public function me(Request $request)
    {
        return new UsuarioResource($request->user()->load('rol'));
    }
}
