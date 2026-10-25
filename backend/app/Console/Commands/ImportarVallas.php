<?php

namespace App\Console\Commands;

use App\Models\Provincia;
use App\Models\Valla;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Shared\Date;

class ImportarVallas extends Command
{
    protected $signature = 'vallas:importar {archivo : Ruta del Excel (.xlsx), hoja "Vallas"}
                            {--simular : Solo revisa el archivo y muestra los problemas, sin guardar nada}';

    protected $description = 'Carga vallas desde un Excel. Todo o nada: si una fila tiene error no se guarda ninguna.';

    private const ENCABEZADOS = [
        'codigo' => 'codigo',
        'provincia' => 'provincia',
        'referencia' => 'referencia',
        'latitud' => 'latitud',
        'longitud' => 'longitud',
        'tamano (m)' => 'tamano',
        'vehiculos diarios' => 'vehiculos_diarios',
        'precio normal (mes)' => 'precio_normal',
        'precio minimo' => 'precio_minimo',
        'instalacion' => 'precio_instalacion',
        'estado' => 'estado',
        'estado sugerido' => 'estado',
        'disponible desde' => 'ocupada_hasta',
        'cliente / nota' => 'ocupada_nota',
    ];

    private const ESTADOS = ['Disponible', 'Reservada', 'Alquilada', 'Mantenimiento', 'Inactiva'];

    public function handle(): int
    {
        $archivo = $this->argument('archivo');

        if (! is_file($archivo)) {
            $this->error("No existe el archivo: {$archivo}");

            return self::FAILURE;
        }

        $libro = IOFactory::load($archivo);
        $hoja = $libro->getSheetByName('Vallas') ?? $libro->getActiveSheet();
        $filas = $hoja->toArray(null, true, true, false);

        $columnas = $this->mapearColumnas(array_shift($filas) ?? []);

        foreach (['codigo', 'provincia', 'referencia', 'latitud', 'longitud'] as $obligatoria) {
            if (! in_array($obligatoria, $columnas, true)) {
                $this->error("Falta la columna \"{$obligatoria}\" en el encabezado.");

                return self::FAILURE;
            }
        }

        $provincias = Provincia::all()->keyBy(fn ($p) => $this->clave($p->nombre));
        $existentes = Valla::pluck('codigo')->map(fn ($c) => mb_strtoupper($c))->flip();

        $validas = [];
        $errores = [];
        $vistos = [];

        foreach ($filas as $indice => $fila) {

            $numero = $indice + 2; // fila real en Excel (1 = encabezado)

            $dato = [];
            foreach ($columnas as $posicion => $campo) {
                $dato[$campo] = is_string($fila[$posicion] ?? null) ? trim($fila[$posicion]) : ($fila[$posicion] ?? null);
            }

            if (blank($dato['codigo'] ?? null) && blank($dato['referencia'] ?? null)) {
                continue; // fila vacía
            }

            $problemas = [];

            $codigo = mb_strtoupper((string) ($dato['codigo'] ?? ''));

            if ($codigo === '') {
                $problemas[] = 'falta el código';
            } elseif (isset($existentes[$codigo])) {
                $problemas[] = "el código {$codigo} ya existe en el sistema";
            } elseif (isset($vistos[$codigo])) {
                $problemas[] = "el código {$codigo} está repetido en el archivo (fila {$vistos[$codigo]})";
            }

            $vistos[$codigo] = $numero;

            $provincia = $provincias[$this->clave((string) ($dato['provincia'] ?? ''))] ?? null;

            if (! $provincia) {
                $problemas[] = 'provincia no reconocida: "' . ($dato['provincia'] ?? '') . '"';
            }

            if (blank($dato['referencia'] ?? null)) {
                $problemas[] = 'falta la referencia';
            }

            $lat = $this->numero($dato['latitud'] ?? null);
            $lon = $this->numero($dato['longitud'] ?? null);

            if ($lat === null || $lon === null) {
                $problemas[] = 'faltan las coordenadas (latitud y longitud)';
            } elseif ($lat < 8 || $lat > 11.3 || $lon < -86 || $lon > -82.5) {
                $problemas[] = "coordenadas fuera de Costa Rica ({$lat}, {$lon})";
            }

            $estado = $this->estado($dato['estado'] ?? null);

            if (! $estado) {
                $problemas[] = 'estado no válido: "' . ($dato['estado'] ?? '') . '"';
            }

            $hasta = $this->fecha($dato['ocupada_hasta'] ?? null);

            if (filled($dato['ocupada_hasta'] ?? null) && ! $hasta) {
                $problemas[] = 'la fecha "disponible desde" no es válida';
            }

            $precios = [];

            foreach (['precio_normal', 'precio_minimo', 'precio_instalacion'] as $campo) {

                $valor = $dato[$campo] ?? null;

                if (blank($valor)) {
                    $precios[$campo] = null;

                    continue;
                }

                $n = $this->numero($valor);

                if ($n === null || $n < 0) {
                    $problemas[] = "{$campo} no es un número válido";
                }

                $precios[$campo] = $n;

            }

            if (isset($precios['precio_normal'], $precios['precio_minimo']) && $precios['precio_minimo'] > $precios['precio_normal']) {
                $problemas[] = 'el precio mínimo es mayor que el precio normal';
            }

            if ($problemas) {

                $errores[] = "Fila {$numero} ({$codigo}): " . implode('; ', $problemas);

                continue;

            }

            $vehiculos = $this->numero($dato['vehiculos_diarios'] ?? null);

            $validas[] = [
                'provincia_id' => $provincia->id,
                'codigo' => $codigo,
                'referencia' => Str::limit((string) $dato['referencia'], 255, ''),
                'latitud' => $lat,
                'longitud' => $lon,
                'tamano' => filled($dato['tamano'] ?? null) ? (string) $dato['tamano'] : null,
                'vehiculos_diarios' => $vehiculos !== null ? (int) $vehiculos : null,
                'precio_normal' => $precios['precio_normal'],
                'precio_minimo' => $precios['precio_minimo'],
                'precio_instalacion' => $precios['precio_instalacion'],
                'estado' => $estado,
                'ocupada_hasta' => $estado === 'Alquilada' ? $hasta : null,
                'ocupada_nota' => $estado === 'Disponible' ? null : (filled($dato['ocupada_nota'] ?? null) ? Str::limit((string) $dato['ocupada_nota'], 150, '') : null),
            ];

        }

        if ($errores) {

            $this->error(count($errores) . ' fila(s) con problemas. No se guardó nada:');

            foreach ($errores as $error) {
                $this->line('  - ' . $error);
            }

            return self::FAILURE;

        }

        $this->info(count($validas) . ' vallas listas para cargar.');

        foreach (collect($validas)->countBy('estado') as $estado => $total) {
            $this->line("  {$estado}: {$total}");
        }

        if ($this->option('simular')) {

            $this->warn('Modo simulación: no se guardó nada.');

            return self::SUCCESS;

        }

        DB::transaction(function () use ($validas) {
            foreach ($validas as $fila) {
                Valla::create($fila);
            }
        });

        $this->info('Listo: vallas cargadas.');

        return self::SUCCESS;
    }

    private function mapearColumnas(array $encabezado): array
    {
        $mapa = [];

        foreach ($encabezado as $posicion => $titulo) {

            $clave = $this->clave((string) $titulo);

            if (isset(self::ENCABEZADOS[$clave])) {
                $mapa[$posicion] = self::ENCABEZADOS[$clave];
            }

        }

        return $mapa;
    }

    private function clave(string $texto): string
    {
        return mb_strtolower(trim(Str::ascii($texto)));
    }

    private function numero($valor): ?float
    {
        if ($valor === null || $valor === '') {
            return null;
        }

        if (is_numeric($valor)) {
            return (float) $valor;
        }

        $limpio = str_replace([' ', '$'], '', (string) $valor);

        // "1.550,50" o "1,550.50" o "2.050" (miles con punto) o "13,5"
        if (preg_match('/^\d{1,3}(\.\d{3})+$/', $limpio)) {
            $limpio = str_replace('.', '', $limpio);
        } else {
            $limpio = str_replace(',', '.', $limpio);
        }

        return is_numeric($limpio) ? (float) $limpio : null;
    }

    private function estado($valor): ?string
    {
        $v = $this->clave((string) $valor);

        foreach (self::ESTADOS as $estado) {
            if ($this->clave($estado) === $v) {
                return $estado;
            }
        }

        return $v === '' ? 'Disponible' : null;
    }

    private function fecha($valor): ?string
    {
        if (blank($valor)) {
            return null;
        }

        try {

            if (is_numeric($valor)) {
                return Date::excelToDateTimeObject($valor)->format('Y-m-d');
            }

            return \Carbon\Carbon::parse((string) $valor)->toDateString();

        } catch (\Throwable) {

            return null;

        }
    }
}
