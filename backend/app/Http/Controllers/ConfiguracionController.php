<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateConfiguracionRequest;
use App\Services\ConfiguracionService;
use Illuminate\Http\Request;

class ConfiguracionController extends Controller
{
    public function __construct(private ConfiguracionService $configuracionService)
    {
    }

    public function show()
    {
        return response()->json($this->configuracionService->obtener());
    }

    public function update(UpdateConfiguracionRequest $request)
    {
        $configuracion = $this->configuracionService->actualizar($request->user(), $request->validated());

        return response()->json($configuracion);
    }

    public function actualizarLogo(Request $request)
    {
        $request->validate([
            'logo' => ['required', 'image', 'max:2048'],
        ]);

        $configuracion = $this->configuracionService->actualizarLogo($request->user(), $request->file('logo'));

        return response()->json($configuracion);
    }

    public function actualizarTipoCambio(Request $request)
    {
        $configuracion = $this->configuracionService->actualizarTipoCambioManual($request->user());

        return response()->json($configuracion);
    }

    public function salud()
    {
        return response()->json($this->configuracionService->salud());
    }

    public function mantenimiento(Request $request)
    {
        $request->validate(['activar' => ['required', 'boolean']]);

        return response()->json(
            $this->configuracionService->toggleMantenimiento($request->user(), $request->boolean('activar'))
        );
    }
}
