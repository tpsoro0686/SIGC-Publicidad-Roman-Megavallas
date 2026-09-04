<?php

namespace App\Http\Controllers;

use App\Http\Requests\CambiarPasswordRequest;
use App\Http\Requests\UpdatePerfilRequest;
use App\Http\Resources\UsuarioResource;
use App\Services\PerfilService;
use Illuminate\Http\Request;

class PerfilController extends Controller
{
    public function __construct(private PerfilService $perfilService)
    {
    }

    public function update(UpdatePerfilRequest $request)
    {
        $usuario = $this->perfilService->actualizarNombre($request->user(), $request->validated('nombre'));

        return new UsuarioResource($usuario);
    }

    public function cambiarPassword(CambiarPasswordRequest $request)
    {
        $this->perfilService->cambiarPassword(
            $request->user(),
            $request->validated('password_actual'),
            $request->validated('password_nueva'),
        );

        return response()->json(['message' => 'Contraseña actualizada correctamente.']);
    }

    public function estadisticas(Request $request)
    {
        return response()->json($this->perfilService->estadisticas($request->user()));
    }

    public function actividad(Request $request)
    {
        return response()->json($this->perfilService->actividad($request->user()));
    }

    public function exportarActividad(Request $request)
    {
        $csv = $this->perfilService->exportarActividadCsv($request->user());

        return response($csv, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="mi_actividad.csv"',
        ]);
    }

    public function sesiones(Request $request)
    {
        $tokenActualId = (string) $request->user()->currentAccessToken()->id;

        return response()->json($this->perfilService->sesiones($request->user(), $tokenActualId));
    }

    public function revocarSesion(Request $request, int $tokenId)
    {
        $this->perfilService->revocarSesion($request->user(), $tokenId);

        return response()->json(['message' => 'Sesión revocada.']);
    }
}
