<?php

namespace App\Services;

use App\Models\Bitacora;
use App\Models\Cliente;
use App\Models\Contrato;
use App\Models\Reserva;
use App\Models\Usuario;
use App\Models\Valla;
use Carbon\Carbon;

class DashboardService
{
    public function paraUsuario(Usuario $usuario): array
    {
        $rol = $usuario->rol->nombre;

        if ($rol === 'Ejecutivo') {

            return $this->vistaEjecutivo($usuario);

        }

        if ($rol === 'Contable') {

            return $this->vistaContable();

        }

        return $this->vistaGeneral();

    }

    private function vistaGeneral(): array
    {
        return [
            'vista' => 'general',
            'vallas' => $this->resumenVallas(),
            'contratos' => $this->resumenContratos(),
            'reservas' => ['activas' => Reserva::where('estado', 'Activa')->count()],
            'clientes' => ['total' => Cliente::count()],
            'ingresos_mes' => $this->ingresosMes(),
            'ingreso_recurrente' => $this->ingresoRecurrente(),
            'ingresos_6_meses' => $this->ingresosUltimosMeses(),
            'ranking_ejecutivos' => $this->rankingEjecutivos(),
            'proximos_vencimientos' => $this->proximosVencimientos(),
            'actividad_reciente' => $this->actividadReciente(),
        ];
    }

    private function vistaContable(): array
    {
        return [
            'vista' => 'contable',
            'contratos' => $this->resumenContratos(),
            'ingresos_mes' => $this->ingresosMes(),
            'ingreso_recurrente' => $this->ingresoRecurrente(),
            'ingresos_6_meses' => $this->ingresosUltimosMeses(),
            'ranking_ejecutivos' => $this->rankingEjecutivos(),
            'proximos_vencimientos' => $this->proximosVencimientos(null, 6, false),
        ];
    }

    private function vistaEjecutivo(Usuario $usuario): array
    {
        return [
            'vista' => 'ejecutivo',
            'vallas' => $this->resumenVallas(),
            'mis_reservas' => ['activas' => Reserva::where('usuario_id', $usuario->id)->where('estado', 'Activa')->count()],
            'mis_contratos' => $this->resumenContratos($usuario->id),
            'mis_ingresos_mes' => $this->ingresosMes($usuario->id),
            'mi_ingreso_recurrente' => $this->ingresoRecurrente($usuario->id),
            'ingresos_6_meses' => $this->ingresosUltimosMeses(6, $usuario->id),
            'vallas_disponibles' => Valla::where('estado', 'Disponible')->count(),
            'mis_proximos_vencimientos' => $this->proximosVencimientos($usuario->id),
            'mi_actividad_reciente' => $this->actividadReciente(15, $usuario->id),
        ];
    }

    public function resumenVallas(): array
    {
        return [
            'total' => Valla::count(),
            'disponibles' => Valla::where('estado', 'Disponible')->count(),
            'reservadas' => Valla::where('estado', 'Reservada')->count(),
            'alquiladas' => Valla::where('estado', 'Alquilada')->count(),
            'fuera_de_servicio' => Valla::whereIn('estado', ['Mantenimiento', 'Inactiva'])->count(),
        ];
    }

    public function resumenContratos(?int $usuarioId = null): array
    {
        $base = Contrato::query()
            ->when($usuarioId, fn ($query) => $query->where('usuario_id', $usuarioId));

        return [
            'activos' => (clone $base)->where('estado', 'Activo')->count(),
            'finalizados' => (clone $base)->where('estado', 'Finalizado')->count(),
            'por_vencer' => (clone $base)->where('estado', 'Activo')
                ->whereBetween('fecha_fin', [now()->toDateString(), now()->addDays(30)->toDateString()])
                ->count(),
        ];
    }

    public function ingresosMes(?int $usuarioId = null): float
    {
        return (float) Contrato::query()
            ->when($usuarioId, fn ($query) => $query->where('usuario_id', $usuarioId))
            ->whereBetween('fecha_inicio', [now()->startOfMonth()->toDateString(), now()->endOfMonth()->toDateString()])
            ->sum('monto_usd');
    }

    public function ingresoRecurrente(?int $usuarioId = null): float
    {
        return (float) Contrato::query()
            ->when($usuarioId, fn ($query) => $query->where('usuario_id', $usuarioId))
            ->where('estado', 'Activo')
            ->get()
            ->sum('monto_mensual');
    }

    public function ingresosUltimosMeses(int $meses = 6, ?int $usuarioId = null): array
    {
        $resultado = [];

        for ($i = $meses - 1; $i >= 0; $i--) {

            $mes = now()->subMonths($i);

            $inicio = $mes->copy()->startOfMonth()->toDateString();

            $fin = $mes->copy()->endOfMonth()->toDateString();

            $total = Contrato::query()
                ->when($usuarioId, fn ($query) => $query->where('usuario_id', $usuarioId))
                ->whereBetween('fecha_inicio', [$inicio, $fin])
                ->sum('monto_usd');

            $resultado[] = [
                'mes' => $mes->format('Y-m'),
                'etiqueta' => ucfirst($mes->translatedFormat('M')),
                'total' => (float) $total,
            ];

        }

        return $resultado;
    }

    private function rankingEjecutivos(int $limite = 5): array
    {
        return Contrato::query()
            ->whereBetween('fecha_inicio', [now()->startOfMonth()->toDateString(), now()->endOfMonth()->toDateString()])
            ->selectRaw('usuario_id, COUNT(*) as contratos, SUM(monto_usd) as monto_vendido')
            ->groupBy('usuario_id')
            ->orderByDesc('monto_vendido')
            ->limit($limite)
            ->get()
            ->map(function ($fila) {

                $usuario = Usuario::find($fila->usuario_id);

                return [
                    'usuario_id' => $fila->usuario_id,
                    'nombre' => $usuario?->nombre ?? 'Usuario eliminado',
                    'contratos' => (int) $fila->contratos,
                    'monto_vendido' => (float) $fila->monto_vendido,
                ];

            })
            ->values()
            ->all();
    }

    private function proximosVencimientos(?int $usuarioId = null, int $limite = 6, bool $incluirReservas = true): array
    {
        $items = collect();

        if ($incluirReservas) {

            $reservas = Reserva::with('valla', 'cliente')
                ->when($usuarioId, fn ($query) => $query->where('usuario_id', $usuarioId))
                ->where('estado', 'Activa')
                ->whereBetween('fecha_vencimiento', [now()->toDateString(), now()->addDays(7)->toDateString()])
                ->get()
                ->map(fn ($reserva) => [
                    'tipo' => 'Reserva',
                    'codigo' => $reserva->valla->codigo,
                    'cliente' => $reserva->cliente->nombre,
                    'fecha' => $reserva->fecha_vencimiento,
                    'dias_restantes' => now()->startOfDay()->diffInDays(Carbon::parse($reserva->fecha_vencimiento), false),
                ]);

            $items = $items->concat($reservas);

        }

        $contratos = Contrato::with('valla', 'cliente')
            ->when($usuarioId, fn ($query) => $query->where('usuario_id', $usuarioId))
            ->where('estado', 'Activo')
            ->whereBetween('fecha_fin', [now()->toDateString(), now()->addDays(30)->toDateString()])
            ->get()
            ->map(fn ($contrato) => [
                'tipo' => 'Contrato',
                'codigo' => $contrato->codigo,
                'cliente' => $contrato->cliente->nombre,
                'fecha' => $contrato->fecha_fin->toDateString(),
                'dias_restantes' => now()->startOfDay()->diffInDays($contrato->fecha_fin, false),
            ]);

        $items = $items->concat($contratos);

        return $items->sortBy('dias_restantes')->take($limite)->values()->all();
    }

    private function actividadReciente(int $limite = 15, ?int $usuarioId = null): array
    {
        return Bitacora::with('usuario')
            ->when($usuarioId, fn ($query) => $query->where('usuario_id', $usuarioId))
            ->whereIn('modulo', ['Vallas', 'Reservas', 'Contratos'])
            ->latest('created_at')
            ->limit($limite)
            ->get()
            ->map(fn ($registro) => [
                'usuario' => $registro->usuario?->nombre ?? 'Usuario eliminado',
                'modulo' => $registro->modulo,
                'accion' => $registro->accion,
                'descripcion' => $registro->descripcion,
                'fecha' => $registro->created_at,
            ])
            ->all();
    }
}
