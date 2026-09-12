<?php

namespace App\Services;

use App\Models\Cliente;
use App\Models\Contrato;
use App\Models\Reporte;
use App\Models\Reserva;
use App\Models\Usuario;
use App\Models\Valla;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class ReporteService
{
    private const TIPOS_POR_ROL = [
        'Administrador Sistema' => ['Contratos', 'Reservas', 'Vallas', 'Clientes', 'Financiero'],
        'Administrador Empresa' => ['Contratos', 'Reservas', 'Vallas', 'Clientes', 'Financiero'],
        'Ejecutivo' => ['Contratos', 'Reservas', 'Vallas', 'Clientes'],
        'Contable' => ['Contratos', 'Financiero'],
    ];

    public function __construct(private DashboardService $dashboardService)
    {
    }

    public function tiposPermitidos(Usuario $usuario): array
    {
        return self::TIPOS_POR_ROL[$usuario->rol->nombre] ?? [];
    }

    public function listar()
    {
        return Reporte::with('usuario')->latest()->get();
    }

    public function resumenTarjetas(Usuario $usuario): array
    {
        $esEjecutivo = $usuario->rol->nombre === 'Ejecutivo';

        $usuarioId = $esEjecutivo ? $usuario->id : null;

        $contratos = $this->dashboardService->resumenContratos($usuarioId);

        $ingresosTotales = Contrato::when($usuarioId, fn ($q) => $q->where('usuario_id', $usuarioId))->sum('monto_usd');

        $resultado = [
            'contratos_activos' => $contratos['activos'],
            'contratos_por_vencer' => $contratos['por_vencer'],
            'contratos_finalizados' => $contratos['finalizados'],
            'ingresos_totales' => (float) $ingresosTotales,
        ];

        if ($usuario->rol->nombre !== 'Contable') {

            $resultado['reservas_activas'] = Reserva::where('estado', 'Activa')
                ->when($usuarioId, fn ($q) => $q->where('usuario_id', $usuarioId))
                ->count();

            $resultado['vallas_disponibles'] = Valla::where('estado', 'Disponible')->count();

        }

        return $resultado;
    }

        public function generar(string $tipo, ?string $desde, ?string $hasta, Usuario $usuario): Reporte
    {
        if (! in_array($tipo, $this->tiposPermitidos($usuario), true)) {

            throw ValidationException::withMessages([
                'tipo' => ['No tenés permiso para generar este tipo de reporte.'],
            ]);

        }

        $soloPropio = $usuario->rol->nombre === 'Ejecutivo' ? $usuario->id : null;

        $datos = $this->recolectarDatos($tipo, $desde, $hasta, $soloPropio);

        $reporte = Reporte::create([
            'tipo' => $tipo,
            'formato' => 'PDF',
            'filtros' => ['fecha_desde' => $desde, 'fecha_hasta' => $hasta],
            'usuario_id' => $usuario->id,
        ]);

        Storage::disk('local')->makeDirectory('reportes');

        $reporte->archivo_pdf = $this->generarPdf($tipo, $datos, $usuario);

        $reporte->save();

        return $reporte->load('usuario');
    }

    public function descargar(Reporte $reporte, string $formato)
    {
        $ruta = $formato === 'excel' ? $reporte->archivo_excel : $reporte->archivo_pdf;

        if (! $ruta || ! Storage::disk('local')->exists($ruta)) {

            abort(404, 'Archivo no encontrado.');

        }

        return Storage::disk('local')->download($ruta);
    }

    private function recolectarDatos(string $tipo, ?string $desde, ?string $hasta, ?int $usuarioId): array
    {
        return match ($tipo) {
            'Contratos' => $this->datosContratos($desde, $hasta, $usuarioId),
            'Reservas' => $this->datosReservas($desde, $hasta, $usuarioId),
            'Vallas' => $this->datosVallas(),
            'Clientes' => $this->datosClientes(),
            'Financiero' => $this->datosFinanciero(),
        };
    }

    private function datosContratos(?string $desde, ?string $hasta, ?int $usuarioId): array
    {
        $contratos = Contrato::with('valla', 'cliente', 'usuario')
            ->when($usuarioId, fn ($q) => $q->where('usuario_id', $usuarioId))
            ->when($desde, fn ($q) => $q->where('fecha_inicio', '>=', $desde))
            ->when($hasta, fn ($q) => $q->where('fecha_inicio', '<=', $hasta))
            ->orderBy('fecha_inicio')
            ->get();

        $filas = $contratos->map(fn ($c) => [
            $c->codigo, $c->valla->codigo, $c->cliente->nombre, $c->usuario->nombre,
            '$' . number_format($c->monto_usd, 2), $c->plazo_meses,
            $c->fecha_inicio->format('Y-m-d'), $c->fecha_fin->format('Y-m-d'), $c->estado,
        ])->all();

        return [
            'columnas' => ['Código', 'Valla', 'Cliente', 'Ejecutivo', 'Monto', 'Plazo (meses)', 'Inicio', 'Fin', 'Estado'],
            'filas' => $filas,
            'totales' => ['label' => 'Monto total', 'valor' => '$' . number_format($contratos->sum('monto_usd'), 2)],
        ];
    }

    private function datosReservas(?string $desde, ?string $hasta, ?int $usuarioId): array
    {
        $reservas = Reserva::with('valla', 'cliente', 'usuario')
            ->when($usuarioId, fn ($q) => $q->where('usuario_id', $usuarioId))
            ->when($desde, fn ($q) => $q->where('fecha_reserva', '>=', $desde))
            ->when($hasta, fn ($q) => $q->where('fecha_reserva', '<=', $hasta))
            ->orderBy('fecha_reserva')
            ->get();

        $filas = $reservas->map(fn ($r) => [
            $r->valla->codigo, $r->cliente->nombre, $r->usuario->nombre,
            $r->fecha_reserva, $r->fecha_vencimiento, $r->estado,
        ])->all();

        return [
            'columnas' => ['Valla', 'Cliente', 'Ejecutivo', 'Fecha reserva', 'Vence', 'Estado'],
            'filas' => $filas,
            'totales' => ['label' => 'Total de reservas', 'valor' => (string) $reservas->count()],
        ];
    }

    private function datosVallas(): array
    {
        $vallas = Valla::with('provincia')->orderBy('codigo')->get();

        $filas = $vallas->map(fn ($v) => [
            $v->codigo, $v->provincia->nombre, $v->referencia, $v->tamano ?? '-', $v->estado,
        ])->all();

        return [
            'columnas' => ['Código', 'Provincia', 'Referencia', 'Tamaño', 'Estado'],
            'filas' => $filas,
            'totales' => ['label' => 'Total de vallas', 'valor' => (string) $vallas->count()],
        ];
    }

    private function datosClientes(): array
    {
        $clientes = Cliente::withCount('reservas', 'contratos')->orderBy('nombre')->get();

        $filas = $clientes->map(fn ($c) => [
            $c->nombre, $c->cedula, $c->telefono ?? '-', (string) $c->reservas_count, (string) $c->contratos_count, $c->estado,
        ])->all();

        return [
            'columnas' => ['Nombre', 'Cédula', 'Teléfono', 'Reservas', 'Contratos', 'Estado'],
            'filas' => $filas,
            'totales' => ['label' => 'Total de clientes', 'valor' => (string) $clientes->count()],
        ];
    }

    private function datosFinanciero(): array
    {
        $serie = $this->dashboardService->ingresosUltimosMeses(6);

        $filas = collect($serie)->map(fn ($item) => [$item['etiqueta'], '$' . number_format($item['total'], 2)])->all();

        return [
            'columnas' => ['Mes', 'Ingresos'],
            'filas' => $filas,
            'totales' => ['label' => 'Ingreso recurrente actual', 'valor' => '$' . number_format($this->dashboardService->ingresoRecurrente(), 2)],
        ];
    }

    private function generarPdf(string $tipo, array $datos, Usuario $usuario): string
    {
        $pdf = Pdf::loadView('reportes.pdf', [
            'tipo' => $tipo,
            'datos' => $datos,
            'usuario' => $usuario,
            'fecha' => now()->format('Y-m-d H:i'),
        ]);

        $ruta = 'reportes/' . uniqid("{$tipo}-") . '.pdf';

        Storage::disk('local')->put($ruta, $pdf->output());

        return $ruta;
    }

    private function generarExcel(string $tipo, array $datos, string $nombreBase): string
    {
        $spreadsheet = new Spreadsheet();

        $sheet = $spreadsheet->getActiveSheet();

        $sheet->setTitle(substr($tipo, 0, 31));

        $sheet->fromArray($datos['columnas'], null, 'A1');

        $sheet->fromArray($datos['filas'], null, 'A2');

        $filaTotal = count($datos['filas']) + 3;

        $sheet->setCellValue("A{$filaTotal}", $datos['totales']['label']);

        $sheet->setCellValue("B{$filaTotal}", $datos['totales']['valor']);

        foreach (range('A', $sheet->getHighestColumn()) as $columna) {

            $sheet->getColumnDimension($columna)->setAutoSize(true);

        }

        $ruta = "{$nombreBase}-" . uniqid() . '.xlsx';

        $rutaCompleta = Storage::disk('local')->path($ruta);

        (new Xlsx($spreadsheet))->save($rutaCompleta);

        return $ruta;
    }
}
