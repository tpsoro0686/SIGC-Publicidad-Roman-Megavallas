<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreUsuarioRequest;
use App\Http\Requests\UpdateUsuarioRequest;
use App\Http\Resources\UsuarioResource;
use App\Models\Usuario;
use App\Services\UsuarioService;
use Illuminate\Http\Request;

class UsuarioController extends Controller
{
    public function __construct(private UsuarioService $usuarioService)
    {
    }

    public function index(Request $request)
    {
        $usuarios = $this->usuarioService->listar(
            $request->query('busqueda'),
            $request->query('estado'),
            $request->query('rol_id'),
        );

        return UsuarioResource::collection($usuarios);
    }

    public function store(StoreUsuarioRequest $request)
    {
        $usuario = $this->usuarioService->crear($request->validated());

        return new UsuarioResource($usuario->load('rol'));
    }

    public function show(Usuario $usuario)
    {
        return new UsuarioResource($usuario->load('rol'));
    }

    public function update(UpdateUsuarioRequest $request, Usuario $usuario)
    {
        $usuario = $this->usuarioService->actualizar($usuario, $request->validated(), $request->user());

        return new UsuarioResource($usuario);
    }

    public function resumen()
    {
        return response()->json($this->usuarioService->resumen());
    }
}
