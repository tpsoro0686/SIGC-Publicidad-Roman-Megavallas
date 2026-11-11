<?php

namespace Tests\Feature;

use App\Models\Cliente;
use App\Models\Configuracion;
use App\Models\Provincia;
use App\Models\Reserva;
use App\Models\Rol;
use App\Models\Usuario;
use App\Models\Valla;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ReservaDiasConfiguracionTest extends TestCase
{
    use RefreshDatabase;

    private Valla $valla;

    protected function setUp(): void
    {
        parent::setUp();

        $rol = Rol::create(['nombre' => 'Ejecutivo', 'descripcion' => 'Ejecutivo']);

        Sanctum::actingAs(Usuario::create([
            'rol_id' => $rol->id, 'nombre' => 'Eje Uno', 'correo' => 'eje@sigc.test',
            'password' => 'secreto123', 'estado' => 'Activo',
        ]));

        $provincia = Provincia::create(['nombre' => 'San José']);

        $this->valla = Valla::create([
            'provincia_id' => $provincia->id, 'codigo' => 'SJ-001', 'referencia' => 'Ref',
            'latitud' => 9.93, 'longitud' => -84.08, 'estado' => 'Disponible',
        ]);
    }

    public function test_los_dias_de_reserva_salen_de_la_configuracion_y_se_guarda_el_contacto(): void
    {
        Configuracion::actual()->update(['dias_reserva' => 5]);

        $this->getJson('/api/reservas/parametros')->assertOk()->assertJson(['dias_reserva' => 5]);

        $this->postJson('/api/reservas', [
            'valla_id' => $this->valla->id,
            'cliente_nombre' => 'María Fernández',
            'cliente_telefono' => '88881234',
            'cliente_correo' => 'maria@correo.cr',
            'dias' => 30,
        ])->assertCreated();

        $reserva = Reserva::first();

        $this->assertSame(now()->addDays(5)->toDateString(), $reserva->fecha_vencimiento->toDateString());

        $cliente = Cliente::first();

        $this->assertSame('88881234', $cliente->telefono);
        $this->assertSame('maria@correo.cr', $cliente->correo);
    }

    public function test_el_contacto_del_cliente_es_obligatorio(): void
    {
        $this->postJson('/api/reservas', [
            'valla_id' => $this->valla->id,
            'cliente_nombre' => 'María Fernández',
        ])->assertStatus(422)->assertJsonValidationErrors(['cliente_telefono', 'cliente_correo']);
    }
}
