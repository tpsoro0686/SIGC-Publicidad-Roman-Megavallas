<?php

namespace Tests\Feature;

use App\Models\Provincia;
use App\Models\Valla;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class PagosPortalTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Mail::fake();

        config([
            'pagos.habilitados' => true,
            'pagos.pasarela' => 'simulado',
            'pagos.porcentaje_adelanto' => 30,
            'pagos.moneda' => 'USD',
            'pagos.url_retorno' => 'http://portal.test/index.html',
        ]);
    }

    private function solicitud(int $vallas = 2): array
    {
        $provincia = Provincia::firstOrCreate(['nombre' => 'San José']);

        $ids = [];

        for ($i = 1; $i <= $vallas; $i++) {
            $ids[] = Valla::create([
                'provincia_id' => $provincia->id, 'codigo' => "SJ-00{$i}", 'referencia' => "Ref {$i}",
                'latitud' => 9.93, 'longitud' => -84.08, 'tamano' => '12x4', 'vehiculos_diarios' => 50000,
                'precio_normal' => 1500, 'precio_minimo' => 900, 'precio_instalacion' => 200, 'estado' => 'Disponible',
            ])->id;
        }

        $respuesta = $this->postJson('/api/portal/solicitudes', [
            'nombre' => 'Laura Mora', 'telefono' => '88881234', 'correo' => 'laura@cafetico.cr', 'vallas' => $ids,
        ])->assertCreated();

        return [$respuesta->json('data.token'), $respuesta->json('data.codigo')];
    }

    public function test_la_solicitud_devuelve_un_token_secreto(): void
    {
        [$token, $codigo] = $this->solicitud();

        $this->assertSame(40, strlen($token));
        $this->assertStringStartsWith('SOL-', $codigo);
    }

    public function test_con_pagos_apagados_el_portal_lo_sabe_y_no_se_puede_cobrar(): void
    {
        config(['pagos.habilitados' => false]);

        [$token] = $this->solicitud();

        $this->getJson('/api/portal/configuracion')->assertOk()->assertJsonPath('pagos_habilitados', false);
        $this->getJson("/api/portal/solicitudes/{$token}/pago")->assertNotFound();
        $this->postJson("/api/portal/solicitudes/{$token}/pago", ['tipo' => 'Adelanto'])->assertNotFound();
    }

    public function test_opciones_calculan_adelanto_y_completo(): void
    {
        [$token] = $this->solicitud();

        $this->getJson('/api/portal/configuracion')->assertJsonPath('pagos_habilitados', true);

        $r = $this->getJson("/api/portal/solicitudes/{$token}/pago")->assertOk();

        $this->assertEquals(3000, $r->json('mensual'));
        $this->assertEquals(400, $r->json('instalacion'));
        $this->assertEquals(3400, $r->json('total'));
        $this->assertEquals(1020, $r->json('opciones.adelanto'));
        $this->assertEquals(3400, $r->json('opciones.completo'));
        $this->assertSame([], $r->json('pagos'));
    }

    public function test_token_invalido_da_404(): void
    {
        $this->getJson('/api/portal/solicitudes/no-existe/pago')->assertNotFound();
    }

    public function test_flujo_adelanto_y_luego_saldo(): void
    {
        [$token] = $this->solicitud();

        $inicio = $this->postJson("/api/portal/solicitudes/{$token}/pago", ['tipo' => 'Adelanto'])->assertCreated();

        $this->assertStringContainsString('pago=simulado', $inicio->json('url_pago'));
        $this->assertStringContainsString("token={$token}", $inicio->json('url_pago'));
        $this->assertEquals(1020, $inicio->json('monto'));

        $ref = $inicio->json('referencia');

        $this->postJson('/api/portal/pagos/aviso/simulado', ['referencia' => $ref, 'estado' => 'Pagado'])
            ->assertOk()->assertJsonPath('estado', 'Pagado');

        // Un aviso repetido no rompe nada
        $this->postJson('/api/portal/pagos/aviso/simulado', ['referencia' => $ref, 'estado' => 'Pagado'])
            ->assertOk()->assertJsonPath('estado', 'Pagado');

        $r = $this->getJson("/api/portal/solicitudes/{$token}/pago")->assertOk();

        $this->assertEquals(1020, $r->json('pagado'));
        $this->assertEquals(2380, $r->json('saldo'));
        $this->assertNull($r->json('opciones.adelanto'));
        $this->assertEquals(2380, $r->json('opciones.completo'));

        // Ya pagó un adelanto: otro adelanto no se permite
        $this->postJson("/api/portal/solicitudes/{$token}/pago", ['tipo' => 'Adelanto'])->assertStatus(422);

        $saldo = $this->postJson("/api/portal/solicitudes/{$token}/pago", ['tipo' => 'Completo'])->assertCreated();
        $this->assertEquals(2380, $saldo->json('monto'));

        $this->postJson('/api/portal/pagos/aviso/simulado', ['referencia' => $saldo->json('referencia'), 'estado' => 'Pagado'])->assertOk();

        $final = $this->getJson("/api/portal/solicitudes/{$token}/pago")->assertOk();
        $this->assertEquals(0, $final->json('saldo'));
        $this->assertNull($final->json('opciones.completo'));
    }

    public function test_un_cobro_nuevo_cancela_el_pendiente_anterior(): void
    {
        [$token] = $this->solicitud();

        $primero = $this->postJson("/api/portal/solicitudes/{$token}/pago", ['tipo' => 'Adelanto'])->json('referencia');
        $this->postJson("/api/portal/solicitudes/{$token}/pago", ['tipo' => 'Completo'])->assertCreated();

        $pagos = collect($this->getJson("/api/portal/solicitudes/{$token}/pago")->json('pagos'))->keyBy('referencia');

        $this->assertSame('Cancelado', $pagos[$primero]['estado']);
        $this->assertCount(1, $pagos->where('estado', 'Pendiente'));

        // Un pago cancelado ya no se puede marcar como pagado
        $this->postJson('/api/portal/pagos/aviso/simulado', ['referencia' => $primero, 'estado' => 'Pagado'])->assertOk();
        $this->assertSame('Cancelado', collect($this->getJson("/api/portal/solicitudes/{$token}/pago")->json('pagos'))->keyBy('referencia')[$primero]['estado']);
    }

    public function test_avisos_invalidos_se_rechazan(): void
    {
        $this->postJson('/api/portal/pagos/aviso/simulado', ['referencia' => 'PAG-99999', 'estado' => 'Pagado'])->assertNotFound();
        $this->postJson('/api/portal/pagos/aviso/simulado', ['referencia' => 'PAG-00001', 'estado' => 'Regalado'])->assertStatus(422);
        $this->postJson('/api/portal/pagos/aviso/inexistente', ['referencia' => 'X', 'estado' => 'Pagado'])->assertNotFound();
    }

    public function test_tipo_de_pago_invalido(): void
    {
        [$token] = $this->solicitud();

        $this->postJson("/api/portal/solicitudes/{$token}/pago", ['tipo' => 'Gratis'])->assertStatus(422);
    }

    public function test_la_pasarela_simulada_no_funciona_en_produccion(): void
    {
        [$token] = $this->solicitud();

        $this->app['env'] = 'production';

        $this->postJson("/api/portal/solicitudes/{$token}/pago", ['tipo' => 'Adelanto'])->assertStatus(502);

        $this->assertSame('Fallido', collect($this->getJson("/api/portal/solicitudes/{$token}/pago")->json('pagos'))->first()['estado']);
    }
}
