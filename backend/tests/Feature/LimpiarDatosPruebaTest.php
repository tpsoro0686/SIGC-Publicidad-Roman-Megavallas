<?php

namespace Tests\Feature;

use App\Models\Cliente;
use App\Models\Provincia;
use App\Models\Reserva;
use App\Models\Rol;
use App\Models\SolicitudPortal;
use App\Models\Usuario;
use App\Models\Valla;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class LimpiarDatosPruebaTest extends TestCase
{
    use RefreshDatabase;

    public function test_deja_solo_el_administrador_y_conserva_roles_y_provincias(): void
    {
        Mail::fake();

        $rol = Rol::create(['nombre' => 'Administrador Sistema', 'descripcion' => 'x']);
        $ejecutivo = Rol::create(['nombre' => 'Ejecutivo', 'descripcion' => 'x']);
        $provincia = Provincia::create(['nombre' => 'San José']);

        Usuario::create(['rol_id' => $ejecutivo->id, 'nombre' => 'Eje', 'correo' => 'eje@x.cr', 'password' => 'secreto123', 'estado' => 'Activo']);

        $valla = Valla::create(['provincia_id' => $provincia->id, 'codigo' => 'SJ-001', 'referencia' => 'r', 'latitud' => 9.9, 'longitud' => -84, 'precio_normal' => 1000, 'estado' => 'Disponible']);

        $this->postJson('/api/portal/solicitudes', ['nombre' => 'X', 'telefono' => '88881234', 'correo' => 'x@x.cr', 'vallas' => [$valla->id]])->assertCreated();

        $roles = Rol::count();

        $this->assertSame(1, SolicitudPortal::count());
        $this->assertSame(1, Reserva::count());

        $this->artisan('sigc:limpiar-datos-prueba', ['--force' => true])
            ->expectsQuestion('Nombre del administrador', 'Administrador SIGC')
            ->expectsQuestion('Correo del administrador', 'adminsigcroman@gmail.com')
            ->expectsQuestion('Contraseña (mínimo 8 caracteres)', 'ClaveSegura123')
            ->expectsQuestion('Repite la contraseña', 'ClaveSegura123')
            ->assertSuccessful();

        $this->assertSame(0, Valla::count());
        $this->assertSame(0, Reserva::count());
        $this->assertSame(0, Cliente::count());
        $this->assertSame(0, SolicitudPortal::count());
        $this->assertSame(0, DB::table('solicitud_portal_vallas')->count());

        $this->assertSame(1, Usuario::count());
        $admin = Usuario::first();
        $this->assertSame('adminsigcroman@gmail.com', $admin->correo);
        $this->assertTrue(Hash::check('ClaveSegura123', $admin->password));

        $this->assertSame($roles, Rol::count());
        $this->assertSame(1, Provincia::count());
    }
}
