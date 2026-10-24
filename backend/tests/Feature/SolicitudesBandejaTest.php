<?php

namespace Tests\Feature;

use App\Models\Provincia;
use App\Models\Rol;
use App\Models\SolicitudPortal;
use App\Models\Usuario;
use App\Models\Valla;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SolicitudesBandejaTest extends TestCase
{
    use RefreshDatabase;

    private function usuario(string $rol, string $nombre, string $estado = 'Activo', ?int $turno = null): Usuario
    {
        $r = Rol::firstOrCreate(['nombre' => $rol], ['descripcion' => $rol]);

        return Usuario::create([
            'rol_id' => $r->id, 'nombre' => $nombre, 'correo' => strtolower(str_replace(' ', '', $nombre)) . '@sigc.test',
            'password' => 'secreto123', 'estado' => $estado, 'turno_portal' => $turno,
        ]);
    }

    public function test_lista_de_ejecutivos_para_reasignar(): void
    {
        Mail::fake();

        $beto = $this->usuario('Ejecutivo', 'Beto Rojas', 'Activo', 2);
        $ana = $this->usuario('Ejecutivo', 'Ana Perez', 'Activo', 1);
        $this->usuario('Ejecutivo', 'Dani Inactivo', 'Inactivo', 3);
        $this->usuario('Contable', 'Conta Uno');
        $empresa = $this->usuario('Administrador Empresa', 'Admin Empresa');

        $provincia = Provincia::create(['nombre' => 'San José']);
        $valla = Valla::create(['provincia_id' => $provincia->id, 'codigo' => 'SJ-001', 'referencia' => 'r',
            'latitud' => 9.9, 'longitud' => -84, 'precio_normal' => 1000, 'precio_instalacion' => 100, 'estado' => 'Disponible']);

        $this->postJson('/api/portal/solicitudes', ['nombre' => 'X', 'telefono' => '88881234', 'correo' => 'x@x.cr', 'vallas' => [$valla->id]])->assertCreated();

        Sanctum::actingAs($empresa);

        $r = $this->getJson('/api/solicitudes/ejecutivos')->assertOk();

        $this->assertSame(['Ana Perez', 'Beto Rojas'], collect($r->json())->pluck('nombre')->all());
        $this->assertSame(1, collect($r->json())->firstWhere('nombre', 'Ana Perez')['abiertas']);
        $this->assertSame(0, collect($r->json())->firstWhere('nombre', 'Beto Rojas')['abiertas']);

        // La ruta /ejecutivos no se confunde con una solicitud
        $this->getJson('/api/solicitudes/' . SolicitudPortal::first()->id)->assertOk();
    }

    public function test_solo_administradores_ven_los_ejecutivos(): void
    {
        $ana = $this->usuario('Ejecutivo', 'Ana Perez');
        $dueno = $this->usuario('Dueño', 'Dueno Uno');

        $this->getJson('/api/solicitudes/ejecutivos')->assertUnauthorized();

        Sanctum::actingAs($ana);
        $this->getJson('/api/solicitudes/ejecutivos')->assertForbidden();

        Sanctum::actingAs($dueno);
        $this->getJson('/api/solicitudes/ejecutivos')->assertForbidden();
    }

    public function test_el_detalle_trae_instalacion_y_pagos(): void
    {
        Mail::fake();

        $empresa = $this->usuario('Administrador Empresa', 'Admin Empresa');
        $provincia = Provincia::create(['nombre' => 'San José']);
        $valla = Valla::create(['provincia_id' => $provincia->id, 'codigo' => 'SJ-001', 'referencia' => 'r',
            'latitud' => 9.9, 'longitud' => -84, 'precio_normal' => 1000, 'precio_instalacion' => 150, 'estado' => 'Disponible']);

        $this->postJson('/api/portal/solicitudes', ['nombre' => 'X', 'telefono' => '88881234', 'correo' => 'x@x.cr', 'vallas' => [$valla->id]])->assertCreated();

        Sanctum::actingAs($empresa);

        $id = SolicitudPortal::first()->id;

        $r = $this->getJson("/api/solicitudes/{$id}")->assertOk();

        $this->assertEquals(150, $r->json('vallas.0.precio_instalacion'));
        $this->assertSame([], $r->json('pagos'));
        $this->assertArrayNotHasKey('token', $r->json());
    }
}
