<?php

namespace Tests\Feature;

use App\Mail\SolicitudAsignadaMail;
use App\Mail\SolicitudPortalMail;
use App\Models\Cliente;
use App\Models\Contrato;
use App\Models\FotoValla;
use App\Models\Provincia;
use App\Models\Reserva;
use App\Models\Rol;
use App\Models\SolicitudPortal;
use App\Models\Usuario;
use App\Models\Valla;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PortalTest extends TestCase
{
    use RefreshDatabase;

    private Provincia $provincia;

    protected function setUp(): void
    {
        parent::setUp();

        $this->provincia = Provincia::create(['nombre' => 'San José']);
    }

    private function usuario(string $rol, string $nombre, string $estado = 'Activo', ?int $turno = null): Usuario
    {
        $rolModelo = Rol::firstOrCreate(['nombre' => $rol], ['descripcion' => $rol]);

        return Usuario::create([
            'rol_id' => $rolModelo->id,
            'nombre' => $nombre,
            'correo' => strtolower(str_replace(' ', '', $nombre)) . '@sigc.test',
            'password' => 'secreto123',
            'estado' => $estado,
            'turno_portal' => $turno,
        ]);
    }

    private function valla(string $codigo, string $estado = 'Disponible'): Valla
    {
        return Valla::create([
            'provincia_id' => $this->provincia->id,
            'codigo' => $codigo,
            'referencia' => "Referencia {$codigo}",
            'latitud' => 9.9333333,
            'longitud' => -84.0833333,
            'tamano' => '12x4',
            'vehiculos_diarios' => 50000,
            'precio_normal' => 1500,
            'precio_minimo' => 900,
            'precio_instalacion' => 200,
            'estado' => $estado,
        ]);
    }

    private function datosSolicitud(array $vallaIds, array $extra = []): array
    {
        return array_merge([
            'nombre' => 'Laura Mora',
            'empresa' => 'Café Tico',
            'telefono' => '88881234',
            'correo' => 'laura@cafetico.cr',
            'mensaje' => 'Queremos campaña de 3 meses',
            'plazo_meses_deseado' => 3,
            'vallas' => $vallaIds,
        ], $extra);
    }

    public function test_catalogo_oculta_mantenimiento_e_inactivas_y_no_filtra_datos_internos(): void
    {
        $this->valla('SJ-001', 'Disponible');
        $this->valla('SJ-002', 'Mantenimiento');
        $this->valla('SJ-003', 'Inactiva');

        $respuesta = $this->getJson('/api/portal/vallas')->assertOk();

        $respuesta->assertJsonCount(1);
        $respuesta->assertJsonPath('0.codigo', 'SJ-001');
        $this->assertEquals(1500, $respuesta->json('0.precio_normal'));
        $this->assertEquals(200, $respuesta->json('0.precio_instalacion'));
        $respuesta->assertJsonMissingPath('0.precio_minimo');
        $respuesta->assertJsonMissingPath('0.estado');
        $respuesta->assertJsonMissingPath('0.contrato_activo');
        $respuesta->assertJsonMissingPath('0.reserva_activa');
        $this->assertStringNotContainsString('900', $respuesta->getContent());
    }

    public function test_disponibilidad_segun_estado(): void
    {
        $ejecutivo = $this->usuario('Ejecutivo', 'Eje Uno');
        $cliente = Cliente::create(['nombre' => 'Cliente Secreto S.A.', 'cedula' => '3-101-123456']);

        $libre = $this->valla('SJ-001', 'Disponible');

        $reservada = $this->valla('SJ-002', 'Reservada');
        Reserva::create([
            'valla_id' => $reservada->id, 'cliente_id' => $cliente->id, 'usuario_id' => $ejecutivo->id,
            'fecha_reserva' => now()->toDateString(), 'fecha_vencimiento' => now()->addDays(10)->toDateString(),
            'estado' => 'Activa',
        ]);

        $alquilada = $this->valla('SJ-003', 'Alquilada');
        Contrato::create([
            'codigo' => 'CT-1', 'valla_id' => $alquilada->id, 'cliente_id' => $cliente->id, 'usuario_id' => $ejecutivo->id,
            'monto_usd' => 1000, 'plazo_meses' => 6,
            'fecha_inicio' => now()->subMonths(2)->toDateString(), 'fecha_fin' => now()->addMonths(4)->toDateString(),
            'estado' => 'Activo',
        ]);

        $vencida = $this->valla('SJ-004', 'Alquilada');
        Contrato::create([
            'codigo' => 'CT-2', 'valla_id' => $vencida->id, 'cliente_id' => $cliente->id, 'usuario_id' => $ejecutivo->id,
            'monto_usd' => 1000, 'plazo_meses' => 6,
            'fecha_inicio' => now()->subMonths(8)->toDateString(), 'fecha_fin' => now()->subDays(3)->toDateString(),
            'estado' => 'Activo',
        ]);

        $respuesta = $this->getJson('/api/portal/vallas')->assertOk();
        $datos = collect($respuesta->json())->keyBy('codigo');

        $this->assertSame('Disponible', $datos['SJ-001']['disponibilidad']);
        $this->assertNull($datos['SJ-001']['disponible_desde']);

        $this->assertSame('Proximamente', $datos['SJ-002']['disponibilidad']);
        $this->assertSame(now()->addDays(10)->toDateString(), $datos['SJ-002']['disponible_desde']);
        $this->assertTrue($datos['SJ-002']['fecha_tentativa']);

        $this->assertSame('Proximamente', $datos['SJ-003']['disponibilidad']);
        $this->assertSame(now()->addMonths(4)->toDateString(), $datos['SJ-003']['disponible_desde']);
        $this->assertFalse($datos['SJ-003']['fecha_tentativa']);

        // Contrato ya vencido que el sistema aun no libero: fecha "por confirmar"
        $this->assertSame('Proximamente', $datos['SJ-004']['disponibilidad']);
        $this->assertNull($datos['SJ-004']['disponible_desde']);

        // Ni el nombre del cliente ni datos de contratos salen en la respuesta publica
        $this->assertStringNotContainsString('Cliente Secreto', $respuesta->getContent());
        $this->assertStringNotContainsString('CT-1', $respuesta->getContent());
    }

    public function test_detalle_incluye_fotos_y_oculta_vallas_no_publicas(): void
    {
        $valla = $this->valla('SJ-001');
        FotoValla::create(['valla_id' => $valla->id, 'ruta_archivo' => 'vallas/a.jpg']);
        FotoValla::create(['valla_id' => $valla->id, 'ruta_archivo' => 'vallas/b.jpg']);
        $oculta = $this->valla('SJ-002', 'Mantenimiento');

        $this->getJson("/api/portal/vallas/{$valla->id}")
            ->assertOk()
            ->assertJsonCount(2, 'fotos');

        $this->getJson("/api/portal/vallas/{$oculta->id}")->assertNotFound();
    }

    public function test_provincias_publicas_solo_con_vallas_visibles(): void
    {
        Provincia::create(['nombre' => 'Limón']);
        $this->valla('SJ-001');

        $this->getJson('/api/portal/provincias')
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.nombre', 'San José');
    }

    public function test_solicitud_se_reparte_por_turnos_y_avisa_por_correo(): void
    {
        Mail::fake();

        $ana = $this->usuario('Ejecutivo', 'Ana Perez');
        $beto = $this->usuario('Ejecutivo', 'Beto Rojas');
        $this->usuario('Ejecutivo', 'Carla Inactiva', 'Inactivo');
        $this->usuario('Administrador Sistema', 'Admin Uno');
        $valla = $this->valla('SJ-001');

        $asignados = [];

        foreach (range(1, 4) as $i) {
            $this->postJson('/api/portal/solicitudes', $this->datosSolicitud([$valla->id]))
                ->assertCreated()
                ->assertJsonPath('data.codigo', 'SOL-' . str_pad((string) $i, 4, '0', STR_PAD_LEFT));

            $asignados[] = SolicitudPortal::find($i)->usuario_id;
        }

        // Turnos: Ana, Beto, Ana, Beto (la inactiva y los no ejecutivos se saltan)
        $this->assertSame([$ana->id, $beto->id, $ana->id, $beto->id], $asignados);

        Mail::assertSent(SolicitudPortalMail::class, 4);
        Mail::assertSent(SolicitudPortalMail::class, fn ($mail) => $mail->hasTo($ana->correo) && ! $mail->hasTo($beto->correo));
        Mail::assertSent(SolicitudPortalMail::class, fn ($mail) => $mail->hasTo($beto->correo) && ! $mail->hasTo($ana->correo));
    }

    public function test_guarda_precio_mostrado_y_datos_de_la_solicitud(): void
    {
        Mail::fake();
        $this->usuario('Ejecutivo', 'Ana Perez');
        $valla = $this->valla('SJ-001');

        $this->postJson('/api/portal/solicitudes', $this->datosSolicitud([$valla->id], [
            'fecha_inicio_deseada' => now()->addMonth()->toDateString(),
        ]))->assertCreated();

        // Si el precio cambia despues, la solicitud conserva el que vio el cliente
        $valla->update(['precio_normal' => 2000]);

        $solicitud = SolicitudPortal::with('vallas')->first();

        $this->assertSame('Laura Mora', $solicitud->nombre);
        $this->assertSame('Nueva', $solicitud->estado);
        $this->assertEquals(1500, $solicitud->vallas->first()->pivot->precio_mostrado);
        $this->assertSame(now()->addMonth()->toDateString(), $solicitud->fecha_inicio_deseada->toDateString());
    }

    public function test_sin_ejecutivos_activos_queda_sin_asignar_y_avisa_a_administradores(): void
    {
        Mail::fake();

        $admin = $this->usuario('Administrador Sistema', 'Admin Uno');
        $adminEmpresa = $this->usuario('Administrador Empresa', 'Admin Empresa');
        $this->usuario('Ejecutivo', 'Ana Inactiva', 'Inactivo');
        $valla = $this->valla('SJ-001');

        $this->postJson('/api/portal/solicitudes', $this->datosSolicitud([$valla->id]))->assertCreated();

        $this->assertNull(SolicitudPortal::first()->usuario_id);

        Mail::assertSent(SolicitudPortalMail::class, fn ($mail) => $mail->sinEjecutivo
            && $mail->hasTo($admin->correo) && $mail->hasTo($adminEmpresa->correo));
    }

    public function test_si_falla_el_correo_la_solicitud_igual_se_guarda(): void
    {
        $this->usuario('Ejecutivo', 'Ana Perez');
        $valla = $this->valla('SJ-001');

        config(['mail.default' => 'smtp', 'mail.mailers.smtp.host' => '127.0.0.1', 'mail.mailers.smtp.port' => 1]);

        $this->postJson('/api/portal/solicitudes', $this->datosSolicitud([$valla->id]))->assertCreated();

        $this->assertSame(1, SolicitudPortal::count());
    }

    public function test_validaciones(): void
    {
        $oculta = $this->valla('SJ-001', 'Mantenimiento');
        $ok = $this->valla('SJ-002');

        $this->postJson('/api/portal/solicitudes', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['nombre', 'telefono', 'correo', 'vallas']);

        $this->postJson('/api/portal/solicitudes', $this->datosSolicitud([$oculta->id]))
            ->assertStatus(422)->assertJsonValidationErrors(['vallas.0']);

        $this->postJson('/api/portal/solicitudes', $this->datosSolicitud([$ok->id], ['correo' => 'no-es-correo']))
            ->assertStatus(422)->assertJsonValidationErrors(['correo']);

        $this->postJson('/api/portal/solicitudes', $this->datosSolicitud([$ok->id], ['fecha_inicio_deseada' => '2020-01-01']))
            ->assertStatus(422)->assertJsonValidationErrors(['fecha_inicio_deseada']);

        $this->assertSame(0, SolicitudPortal::count());
    }

    public function test_campo_trampa_de_bots_no_guarda_nada(): void
    {
        Mail::fake();
        $this->usuario('Ejecutivo', 'Ana Perez');
        $valla = $this->valla('SJ-001');

        $this->postJson('/api/portal/solicitudes', $this->datosSolicitud([$valla->id], ['sitio_web' => 'http://spam.com']))
            ->assertCreated();

        $this->assertSame(0, SolicitudPortal::count());
        Mail::assertNothingSent();
    }

    public function test_limite_de_solicitudes_por_ip(): void
    {
        Mail::fake();
        $this->usuario('Ejecutivo', 'Ana Perez');
        $valla = $this->valla('SJ-001');

        foreach (range(1, 5) as $i) {
            $this->postJson('/api/portal/solicitudes', $this->datosSolicitud([$valla->id]))->assertCreated();
        }

        $this->postJson('/api/portal/solicitudes', $this->datosSolicitud([$valla->id]))->assertStatus(429);
    }

    public function test_el_correo_se_renderiza(): void
    {
        $this->usuario('Ejecutivo', 'Ana Perez');
        $valla = $this->valla('SJ-001');
        Mail::fake();
        $this->postJson('/api/portal/solicitudes', $this->datosSolicitud([$valla->id]))->assertCreated();

        $html = (new SolicitudPortalMail(SolicitudPortal::with('vallas')->first()))->render();

        $this->assertStringContainsString('SOL-0001', $html);
        $this->assertStringContainsString('Laura Mora', $html);
        $this->assertStringContainsString('SJ-001', $html);
        $this->assertStringContainsString('1,500.00', $html);
    }

    public function test_bandeja_ejecutivo_ve_solo_las_suyas_y_puede_cambiar_estado(): void
    {
        Mail::fake();

        $ana = $this->usuario('Ejecutivo', 'Ana Perez');
        $beto = $this->usuario('Ejecutivo', 'Beto Rojas');
        $valla = $this->valla('SJ-001');

        $this->postJson('/api/portal/solicitudes', $this->datosSolicitud([$valla->id]))->assertCreated(); // Ana
        $this->postJson('/api/portal/solicitudes', $this->datosSolicitud([$valla->id]))->assertCreated(); // Beto

        $propia = SolicitudPortal::where('usuario_id', $ana->id)->first();
        $ajena = SolicitudPortal::where('usuario_id', $beto->id)->first();

        Sanctum::actingAs($ana);

        $this->getJson('/api/solicitudes')->assertOk()->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.codigo', $propia->codigo);
        $this->getJson('/api/solicitudes/resumen')->assertOk()->assertJsonPath('nuevas', 1);
        $this->getJson("/api/solicitudes/{$ajena->id}")->assertForbidden();
        $this->patchJson("/api/solicitudes/{$ajena->id}/estado", ['estado' => 'Cerrada'])->assertForbidden();

        $this->patchJson("/api/solicitudes/{$propia->id}/estado", ['estado' => 'En seguimiento'])
            ->assertOk()->assertJsonPath('estado', 'En seguimiento');
        $this->assertNotNull($propia->fresh()->atendida_en);

        $this->patchJson("/api/solicitudes/{$propia->id}/estado", ['estado' => 'Cualquiera'])->assertStatus(422);
    }

    public function test_administrador_ve_todas_y_reasigna_el_ejecutivo_no(): void
    {
        Mail::fake();

        $ana = $this->usuario('Ejecutivo', 'Ana Perez');
        $beto = $this->usuario('Ejecutivo', 'Beto Rojas');
        $inactivo = $this->usuario('Ejecutivo', 'Dani Inactivo', 'Inactivo');
        $admin = $this->usuario('Administrador Empresa', 'Admin Empresa');
        $valla = $this->valla('SJ-001');

        $this->postJson('/api/portal/solicitudes', $this->datosSolicitud([$valla->id]))->assertCreated(); // Ana
        $this->postJson('/api/portal/solicitudes', $this->datosSolicitud([$valla->id]))->assertCreated(); // Beto
        $solicitud = SolicitudPortal::where('usuario_id', $ana->id)->first();

        Sanctum::actingAs($ana);
        $this->patchJson("/api/solicitudes/{$solicitud->id}/reasignar", ['usuario_id' => $beto->id])->assertForbidden();

        Sanctum::actingAs($admin);
        $this->getJson('/api/solicitudes')->assertOk()->assertJsonCount(2, 'data');

        $this->patchJson("/api/solicitudes/{$solicitud->id}/reasignar", ['usuario_id' => $inactivo->id])
            ->assertStatus(422);

        Mail::fake();
        $this->patchJson("/api/solicitudes/{$solicitud->id}/reasignar", ['usuario_id' => $beto->id])
            ->assertOk()->assertJsonPath('ejecutivo.nombre', 'Beto Rojas');

        $this->assertSame($beto->id, $solicitud->fresh()->usuario_id);
        Mail::assertSent(SolicitudPortalMail::class, fn ($mail) => $mail->hasTo($beto->correo));
    }

    public function test_el_orden_de_turnos_lo_define_el_campo_turno(): void
    {
        Mail::fake();
        $this->withoutMiddleware(\Illuminate\Routing\Middleware\ThrottleRequests::class);

        // Orden definido: Beto (1), Ana (2), Carla (3); Dani sin turno va al final; Eva inactiva se salta
        $ana = $this->usuario('Ejecutivo', 'Ana Perez', 'Activo', 2);
        $beto = $this->usuario('Ejecutivo', 'Beto Rojas', 'Activo', 1);
        $carla = $this->usuario('Ejecutivo', 'Carla Soto', 'Activo', 3);
        $dani = $this->usuario('Ejecutivo', 'Dani Sin Turno');
        $this->usuario('Ejecutivo', 'Eva Inactiva', 'Inactivo', 2);
        $valla = $this->valla('SJ-001');

        $asignados = [];

        foreach (range(1, 6) as $i) {
            $this->postJson('/api/portal/solicitudes', $this->datosSolicitud([$valla->id]))->assertCreated();
            $asignados[] = SolicitudPortal::find($i)->usuario_id;
        }

        $this->assertSame(
            [$beto->id, $ana->id, $carla->id, $dani->id, $beto->id, $ana->id],
            $asignados,
        );
    }

    public function test_si_cambia_el_orden_la_rotacion_continua_sin_romperse(): void
    {
        Mail::fake();

        $ana = $this->usuario('Ejecutivo', 'Ana Perez', 'Activo', 1);
        $beto = $this->usuario('Ejecutivo', 'Beto Rojas', 'Activo', 2);
        $carla = $this->usuario('Ejecutivo', 'Carla Soto', 'Activo', 3);
        $valla = $this->valla('SJ-001');

        $this->postJson('/api/portal/solicitudes', $this->datosSolicitud([$valla->id]))->assertCreated(); // Ana
        $this->postJson('/api/portal/solicitudes', $this->datosSolicitud([$valla->id]))->assertCreated(); // Beto

        // Beto (el ultimo en recibir) se inactiva: sigue Carla
        $beto->update(['estado' => 'Inactivo']);
        $this->postJson('/api/portal/solicitudes', $this->datosSolicitud([$valla->id]))->assertCreated();
        $this->assertSame($carla->id, SolicitudPortal::find(3)->usuario_id);

        // Despues de Carla vuelve a empezar por Ana
        $this->postJson('/api/portal/solicitudes', $this->datosSolicitud([$valla->id]))->assertCreated();
        $this->assertSame($ana->id, SolicitudPortal::find(4)->usuario_id);
    }

    public function test_reasignar_a_mano_no_altera_la_rotacion(): void
    {
        Mail::fake();

        $ana = $this->usuario('Ejecutivo', 'Ana Perez', 'Activo', 1);
        $beto = $this->usuario('Ejecutivo', 'Beto Rojas', 'Activo', 2);
        $carla = $this->usuario('Ejecutivo', 'Carla Soto', 'Activo', 3);
        $admin = $this->usuario('Administrador Empresa', 'Admin Empresa');
        $valla = $this->valla('SJ-001');

        $this->postJson('/api/portal/solicitudes', $this->datosSolicitud([$valla->id]))->assertCreated(); // turno: Ana

        Sanctum::actingAs($admin);
        $this->patchJson('/api/solicitudes/1/reasignar', ['usuario_id' => $carla->id])->assertOk();

        // La siguiente le toca a Beto (el que sigue de Ana), no a quien recibio la reasignacion
        $this->postJson('/api/portal/solicitudes', $this->datosSolicitud([$valla->id]))->assertCreated();
        $this->assertSame($beto->id, SolicitudPortal::find(2)->usuario_id);
    }

    public function test_el_administrador_de_empresa_recibe_correo_aparte_con_el_resumen(): void
    {
        Mail::fake();

        $ana = $this->usuario('Ejecutivo', 'Ana Perez');
        $adminEmpresa = $this->usuario('Administrador Empresa', 'Admin Empresa');
        $otroAdmin = $this->usuario('Administrador Empresa', 'Admin Dos');
        $this->usuario('Administrador Empresa', 'Admin Inactivo', 'Inactivo');
        $adminSistema = $this->usuario('Administrador Sistema', 'Admin Sistema');
        $valla = $this->valla('SJ-001');

        $this->postJson('/api/portal/solicitudes', $this->datosSolicitud([$valla->id]))->assertCreated();

        // Correo del ejecutivo (solo para el)
        Mail::assertSent(SolicitudPortalMail::class, 1);
        Mail::assertSent(SolicitudPortalMail::class, fn ($mail) => $mail->hasTo($ana->correo) && ! $mail->hasTo($adminEmpresa->correo));

        // Correo aparte para los Administradores de Empresa activos
        Mail::assertSent(SolicitudAsignadaMail::class, 1);
        Mail::assertSent(SolicitudAsignadaMail::class, fn ($mail) => $mail->hasTo($adminEmpresa->correo)
            && $mail->hasTo($otroAdmin->correo)
            && ! $mail->hasTo($adminSistema->correo)
            && ! $mail->hasTo($ana->correo)
            && $mail->reasignadaDe === null);

        $html = (new SolicitudAsignadaMail(SolicitudPortal::with('vallas', 'ejecutivo')->first()))->render();

        $this->assertStringContainsString('Ana Perez', $html);
        $this->assertStringContainsString('Laura Mora', $html);
        $this->assertStringContainsString('Café Tico', $html);
        $this->assertStringContainsString('SJ-001', $html);
        $this->assertStringContainsString('1,500.00', $html);
        $this->assertStringContainsString('Queremos campaña de 3 meses', $html);

        $this->assertSame(
            'Solicitud SOL-0001 asignada a Ana Perez',
            (new SolicitudAsignadaMail(SolicitudPortal::with('ejecutivo')->first()))->envelope()->subject,
        );
    }

    public function test_al_reasignar_el_administrador_recibe_aviso_de_reasignacion(): void
    {
        Mail::fake();

        $ana = $this->usuario('Ejecutivo', 'Ana Perez', 'Activo', 1);
        $beto = $this->usuario('Ejecutivo', 'Beto Rojas', 'Activo', 2);
        $admin = $this->usuario('Administrador Empresa', 'Admin Empresa');
        $valla = $this->valla('SJ-001');

        $this->postJson('/api/portal/solicitudes', $this->datosSolicitud([$valla->id]))->assertCreated(); // Ana

        Mail::fake();
        Sanctum::actingAs($admin);
        $this->patchJson('/api/solicitudes/1/reasignar', ['usuario_id' => $beto->id])->assertOk();

        Mail::assertSent(SolicitudAsignadaMail::class, fn ($mail) => $mail->hasTo($admin->correo) && $mail->reasignadaDe === 'Ana Perez');
        Mail::assertSent(SolicitudPortalMail::class, fn ($mail) => $mail->hasTo($beto->correo));
    }

    public function test_sin_ejecutivos_no_se_envia_el_correo_de_asignacion(): void
    {
        Mail::fake();

        $this->usuario('Administrador Empresa', 'Admin Empresa');
        $valla = $this->valla('SJ-001');

        $this->postJson('/api/portal/solicitudes', $this->datosSolicitud([$valla->id]))->assertCreated();

        Mail::assertNotSent(SolicitudAsignadaMail::class);
        Mail::assertSent(SolicitudPortalMail::class, 1);
    }

    public function test_usuarios_guardan_y_devuelven_el_turno(): void
    {
        $admin = $this->usuario('Administrador Sistema', 'Admin Sistema');
        $rol = Rol::firstOrCreate(['nombre' => 'Ejecutivo'], ['descripcion' => 'Ejecutivo']);

        Sanctum::actingAs($admin);

        $this->postJson('/api/usuarios', [
            'nombre' => 'Nuevo Ejecutivo', 'correo' => 'nuevo@sigc.test', 'password' => 'secreto123',
            'rol_id' => $rol->id, 'turno_portal' => 2,
        ])->assertCreated()->assertJsonPath('turno_portal', 2);

        $usuario = Usuario::where('correo', 'nuevo@sigc.test')->first();

        $this->putJson("/api/usuarios/{$usuario->id}", ['turno_portal' => 5])
            ->assertOk()->assertJsonPath('turno_portal', 5);

        $this->putJson("/api/usuarios/{$usuario->id}", ['turno_portal' => null])
            ->assertOk()->assertJsonPath('turno_portal', null);

        $this->putJson("/api/usuarios/{$usuario->id}", ['turno_portal' => 0])->assertStatus(422);
    }

    public function test_bandeja_exige_login_y_rol(): void
    {
        $this->getJson('/api/solicitudes')->assertUnauthorized();

        Sanctum::actingAs($this->usuario('Contable', 'Conta Uno'));
        $this->getJson('/api/solicitudes')->assertForbidden();
    }
}
