<?php

namespace Tests\Feature;

use App\Models\Cliente;
use App\Models\Provincia;
use App\Models\Reserva;
use App\Models\Rol;
use App\Models\Usuario;
use App\Models\Valla;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ContratosReglasTest extends TestCase
{
    use RefreshDatabase;

    private Usuario $ejecutivo;

    private Provincia $provincia;

    protected function setUp(): void
    {
        parent::setUp();

        $rol = Rol::create(['nombre' => 'Ejecutivo', 'descripcion' => 'Ejecutivo']);

        $this->ejecutivo = Usuario::create([
            'rol_id' => $rol->id, 'nombre' => 'Eje Uno', 'correo' => 'eje@sigc.test',
            'password' => 'secreto123', 'estado' => 'Activo',
        ]);

        $this->provincia = Provincia::create(['nombre' => 'San José']);

        Sanctum::actingAs($this->ejecutivo);
    }

    private function valla(string $codigo, string $estado = 'Disponible'): Valla
    {
        return Valla::create([
            'provincia_id' => $this->provincia->id, 'codigo' => $codigo, 'referencia' => 'Ref',
            'latitud' => 9.93, 'longitud' => -84.08, 'estado' => $estado,
        ]);
    }

    private function cliente(string $nombre, string $cedula): Cliente
    {
        return Cliente::create(['nombre' => $nombre, 'cedula' => $cedula]);
    }

    private function cuerpo(Valla $valla, Cliente $cliente, array $extra = []): array
    {
        return array_merge([
            'valla_id' => $valla->id,
            'cliente_id' => $cliente->id,
            'monto_usd' => 1000,
            'plazo_meses' => 3,
            'fecha_inicio' => now()->toDateString(),
            'cliente' => ['cedula' => $cliente->cedula, 'telefono' => '88881234', 'correo' => 'c@x.cr', 'direccion' => 'San José'],
        ], $extra);
    }

    public function test_no_se_puede_contratar_una_valla_ocupada(): void
    {
        $cliente = $this->cliente('Uno', '1');

        foreach (['Alquilada', 'Reservada', 'Mantenimiento', 'Inactiva'] as $i => $estado) {

            $valla = $this->valla("V-{$i}", $estado);

            $this->postJson('/api/contratos', $this->cuerpo($valla, $cliente))
                ->assertStatus(422)
                ->assertJsonValidationErrors('valla_id');

            $this->assertSame($estado, $valla->fresh()->estado);

        }

        $this->assertDatabaseCount('contratos', 0);
    }

    public function test_contratar_una_valla_disponible_la_deja_alquilada(): void
    {
        $valla = $this->valla('V-1');

        $this->postJson('/api/contratos', $this->cuerpo($valla, $this->cliente('Uno', '1')))->assertCreated();

        $this->assertSame('Alquilada', $valla->fresh()->estado);
    }

    public function test_convertir_una_reserva_activa_funciona_y_una_no_activa_no(): void
    {
        $cliente = $this->cliente('Uno', '1');

        $valla = $this->valla('V-1', 'Reservada');

        $reserva = Reserva::create([
            'valla_id' => $valla->id, 'cliente_id' => $cliente->id, 'usuario_id' => $this->ejecutivo->id,
            'fecha_reserva' => now()->toDateString(), 'fecha_vencimiento' => now()->addDays(3)->toDateString(), 'estado' => 'Activa',
        ]);

        $cuerpo = ['reserva_id' => $reserva->id, 'monto_usd' => 900, 'plazo_meses' => 2, 'fecha_inicio' => now()->toDateString(),
            'cliente' => ['cedula' => '1', 'telefono' => '88881234', 'correo' => 'c@x.cr', 'direccion' => 'SJ']];

        $this->postJson('/api/contratos', $cuerpo)->assertCreated();

        $this->assertSame('Convertida', $reserva->fresh()->estado);
        $this->assertSame('Alquilada', $valla->fresh()->estado);

        // La misma reserva ya no sirve para otro contrato
        $this->postJson('/api/contratos', $cuerpo)->assertStatus(422)->assertJsonValidationErrors('reserva_id');
    }

    public function test_dos_contratos_de_la_misma_valla_el_mismo_mes_no_dan_error_500(): void
    {
        $valla = $this->valla('V-1');

        $primero = $this->postJson('/api/contratos', $this->cuerpo($valla, $this->cliente('Uno', '1')))->assertCreated();

        $this->patchJson('/api/contratos/' . $primero->json('id') . '/finalizar')->assertOk();

        $segundo = $this->postJson('/api/contratos', $this->cuerpo($valla->fresh(), $this->cliente('Dos', '2')))->assertCreated();

        $this->assertNotSame($primero->json('codigo'), $segundo->json('codigo'));
        $this->assertStringEndsWith('-2', $segundo->json('codigo'));
    }

    public function test_no_se_renueva_un_contrato_finalizado_si_la_valla_ya_la_tiene_otro(): void
    {
        $valla = $this->valla('V-1');

        $primero = $this->postJson('/api/contratos', $this->cuerpo($valla, $this->cliente('Uno', '1')))->assertCreated();

        $this->patchJson('/api/contratos/' . $primero->json('id') . '/finalizar')->assertOk();

        $this->postJson('/api/contratos', $this->cuerpo($valla->fresh(), $this->cliente('Dos', '2')))->assertCreated();

        $this->patchJson('/api/contratos/' . $primero->json('id') . '/renovar', [
            'plazo_meses' => 2, 'fecha_inicio' => now()->toDateString(),
        ])->assertStatus(422)->assertJsonValidationErrors('estado');
    }

    public function test_renovar_un_contrato_finalizado_con_la_valla_libre_si_funciona(): void
    {
        $valla = $this->valla('V-1');

        $contrato = $this->postJson('/api/contratos', $this->cuerpo($valla, $this->cliente('Uno', '1')))->assertCreated();

        $this->patchJson('/api/contratos/' . $contrato->json('id') . '/finalizar')->assertOk();

        $this->patchJson('/api/contratos/' . $contrato->json('id') . '/renovar', [
            'plazo_meses' => 2, 'fecha_inicio' => now()->toDateString(),
        ])->assertOk();

        $this->assertSame('Alquilada', $valla->fresh()->estado);
    }

    public function test_renovar_un_contrato_activo_sigue_funcionando(): void
    {
        $valla = $this->valla('V-1');

        $contrato = $this->postJson('/api/contratos', $this->cuerpo($valla, $this->cliente('Uno', '1')))->assertCreated();

        $this->patchJson('/api/contratos/' . $contrato->json('id') . '/renovar', [
            'plazo_meses' => 6, 'fecha_inicio' => now()->toDateString(),
        ])->assertOk()->assertJsonPath('plazo_meses', 6);
    }
}
