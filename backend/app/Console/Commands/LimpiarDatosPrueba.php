<?php

namespace App\Console\Commands;

use App\Models\Rol;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;

class LimpiarDatosPrueba extends Command
{
    protected $signature = 'sigc:limpiar-datos-prueba
                            {--force : No pedir confirmación escrita}';

    protected $description = 'Borra TODOS los datos de prueba (incluidos los usuarios) y crea el administrador real. Conserva roles, provincias y configuración.';

    /** Tablas que se vacían por completo (se desactivan las llaves foráneas). */
    private const TABLAS = [
        'bitacora',
        'reportes',
        'contratos',
        'reservas',
        'fotos_vallas',
        'vallas',
        'clientes',
        'personal_access_tokens',
        'jobs',
        'failed_jobs',
        'usuarios',
    ];

    public function handle(): int
    {
        $rol = Rol::where('nombre', 'Administrador Sistema')->first();

        if (! $rol) {
            $this->error('No existe el rol "Administrador Sistema". Corre primero: php artisan db:seed --class=RolSeeder');

            return self::FAILURE;
        }

        $this->info('Se CONSERVAN: roles, provincias y configuración.');
        $this->newLine();
        $this->info('Se BORRAN:');

        foreach (self::TABLAS as $tabla) {
            if (Schema::hasTable($tabla)) {
                $this->line(sprintf('  - %-24s %d registro(s)', $tabla, DB::table($tabla)->count()));
            }
        }

        $this->newLine();
        $this->info('Como se borran todos los usuarios, hay que crear el administrador con el que vas a entrar.');

        $nombre = trim((string) $this->ask('Nombre del administrador'));
        $correo = trim((string) $this->ask('Correo del administrador'));

        if ($nombre === '' || ! filter_var($correo, FILTER_VALIDATE_EMAIL)) {
            $this->error('Nombre o correo inválido. No se borró nada.');

            return self::FAILURE;
        }

        $password = (string) $this->secret('Contraseña (mínimo 8 caracteres)');

        if (strlen($password) < 8) {
            $this->error('La contraseña es demasiado corta. No se borró nada.');

            return self::FAILURE;
        }

        if ($password !== (string) $this->secret('Repite la contraseña')) {
            $this->error('Las contraseñas no coinciden. No se borró nada.');

            return self::FAILURE;
        }

        if (! $this->option('force')) {
            $this->newLine();
            $respuesta = $this->ask('Esta acción NO se puede deshacer. Escribe BORRAR para continuar');

            if ($respuesta !== 'BORRAR') {
                $this->warn('Cancelado. No se borró nada.');

                return self::SUCCESS;
            }
        }

        // Archivos generados por reportes (PDF y Excel) antes de perder las rutas
        foreach (DB::table('reportes')->get(['archivo_pdf', 'archivo_excel']) as $fila) {
            foreach ([$fila->archivo_pdf, $fila->archivo_excel] as $ruta) {
                if ($ruta && Storage::disk('local')->exists($ruta)) {
                    Storage::disk('local')->delete($ruta);
                }
            }
        }

        Schema::disableForeignKeyConstraints();

        try {
            foreach (self::TABLAS as $tabla) {
                if (Schema::hasTable($tabla)) {
                    DB::table($tabla)->truncate();
                }
            }
        } finally {
            Schema::enableForeignKeyConstraints();
        }

        DB::table('usuarios')->insert([
            'rol_id' => $rol->id,
            'nombre' => $nombre,
            'correo' => $correo,
            'password' => Hash::make($password),
            'estado' => 'Activo',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->newLine();
        $this->info("Listo. Datos de prueba eliminados. Ya puedes entrar con {$correo}.");

        return self::SUCCESS;
    }
}
