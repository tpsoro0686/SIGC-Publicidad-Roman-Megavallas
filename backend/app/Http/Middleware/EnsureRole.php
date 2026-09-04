<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureRole
{
    public function handle(Request $request, Closure $next, string ...$rolesPermitidos): Response
    {
        $usuario = $request->user();

        if (!$usuario || !in_array($usuario->rol->nombre, $rolesPermitidos, true)) {

            return response()->json([
                'message' => 'No tenés permisos para realizar esta accion.',
            ], 403);

        }

        return $next($request);
    }
}
