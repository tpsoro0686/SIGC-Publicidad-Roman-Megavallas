<?php

namespace App\Services;

use App\Models\Bitacora;
use App\Models\Provincia;
use App\Models\Usuario;
use App\Models\Valla;
use App\Models\Contrato;
use Illuminate\Validation\ValidationException;

class VallaService
{
    private const PREFIJOS_PROVINCIA = [
        'San Jose' => 'SJ',
        'Alajuela' => 'A',
        'Cartago' => 'C',
        'Heredia' => 'H',
        'Guanacaste' => 'G',
        'Puntarenas' => 'P',
        'Limon' => 'L',
    ];

    public function listar(?string $estado = null, ?int $provinciaId = null)
    {
        return Valla::with('provincia', 'fotos')
            ->when($estado, fn ($query) => $query->where('estado', $estado))
            ->when($provinciaId, fn ($query) => $query->where('provincia_id', $provinciaId))
            ->get();
    }

    public function crear(array $datos, Usuario $usuario): Valla
    {
        $datos['codigo'] = $datos['codigo'] ?? $this->generarCodigo($datos['provincia_id']);

        $valla = Valla::create($datos);
        $valla->refresh();

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

    private function generarCodigo(int $provinciaId): string
    {
        $provincia = Provincia::findOrFail($provinciaId);
        $prefijo = $this->prefijoPorProvincia($provincia->nombre);
        $siguiente = Valla::where('codigo', 'like', "{$prefijo}-%")->count() + 1;

        return sprintf('%s-%03d', $prefijo, $siguiente);
    }

    private function prefijoPorProvincia(string $nombreProvincia): string
    {
        return self::PREFIJOS_PROVINCIA[$nombreProvincia] ?? 'XX';
    }

    private function registrarBitacora(Usuario $usuario, string $accion, Valla $valla): void
    {
        Bitacora::create([
            'usuario_id' => $usuario->id,
            'modulo' => 'Vallas',
            'accion' => $accion,
            'descripcion' => "Valla {$valla->codigo}",
        ]);
    }

    public function resumen(): array
    {
        return [
            'total' => Valla::count(),
            'disponibles' => Valla::where('estado', 'Disponible')->count(),
            'reservadas' => Valla::where('estado', 'Reservada')->count(),
            'contratos_activos' => Contrato::where('estado', 'Activo')
                ->where('fecha_fin', '>=', now())
                ->count(),
            'contratos_por_vencer' => Contrato::where('estado', 'Activo')
                ->whereBetween('fecha_fin', [now(), now()->addDays(30)])
                ->count(),
            'contratos_vencidos' => Contrato::where('estado', 'Activo')
                ->where('fecha_fin', '<', now())
                ->count(),
        ];
    }

    
}