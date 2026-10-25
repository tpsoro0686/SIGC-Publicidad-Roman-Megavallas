<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Symfony\Component\Process\Process;

class RespaldarBaseDatos extends Command
{
    protected $signature = 'respaldo:base-datos {--conservar=14 : Cuántos respaldos mantener}';

    protected $description = 'Genera un respaldo comprimido de la base de datos MySQL en storage/app/respaldos';

    public function handle(): int
    {
        $conexion = config('database.default');
        $config = config("database.connections.{$conexion}");

        if (! in_array($config['driver'] ?? '', ['mysql', 'mariadb'], true)) {

            $this->warn('El respaldo automático solo funciona con MySQL/MariaDB.');

            return self::SUCCESS;

        }

        $carpeta = storage_path('app/respaldos');

        if (! is_dir($carpeta)) {
            mkdir($carpeta, 0750, true);
        }

        $archivo = $carpeta . '/sigc-' . now()->format('Y-m-d_His') . '.sql.gz';

        // La contraseña va por variable de entorno para que no aparezca en la lista de procesos
        $proceso = Process::fromShellCommandline(
            'mysqldump --single-transaction --quick --no-tablespaces -h "$DB_H" -P "$DB_P" -u "$DB_U" "$DB_N" | gzip > "$ARCHIVO"',
            null,
            [
                'MYSQL_PWD' => (string) ($config['password'] ?? ''),
                'DB_H' => (string) ($config['host'] ?? '127.0.0.1'),
                'DB_P' => (string) ($config['port'] ?? '3306'),
                'DB_U' => (string) ($config['username'] ?? ''),
                'DB_N' => (string) ($config['database'] ?? ''),
                'ARCHIVO' => $archivo,
            ],
        );

        $proceso->setTimeout(300);
        $proceso->run();

        if (! $proceso->isSuccessful() || ! is_file($archivo) || filesize($archivo) < 200) {

            @unlink($archivo);

            $this->error('No se pudo generar el respaldo: ' . trim($proceso->getErrorOutput()));

            return self::FAILURE;

        }

        $this->info('Respaldo creado: ' . basename($archivo));

        $archivos = glob($carpeta . '/sigc-*.sql.gz') ?: [];
        rsort($archivos);

        foreach (array_slice($archivos, max(1, (int) $this->option('conservar'))) as $viejo) {
            @unlink($viejo);
        }

        return self::SUCCESS;
    }
}
