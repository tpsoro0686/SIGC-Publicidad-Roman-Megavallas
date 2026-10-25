<?php

namespace Tests\Feature;

use App\Models\Reserva;
use App\Models\Rol;
use App\Models\Provincia;
use App\Models\Usuario;
use App\Models\Valla;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ApartadoSolicitudTest extends TestCase
{
    use RefreshDatabase;

    private Provincia $provincia;

    protected function setUp(): void
    {
        parent::setUp();
        Mail::fake();
        $this->provincia = Provincia::create(['nombre' => 'San José']);
    }

    private function usuario(string $rol, string $nombre): Usuario
    {
        $r = Rol::firstOrCreate(['nombre' => $rol], ['descripcion' => $rol]);

        return Usuario::create([
            'rol_id' => $r->id, 'nombre' => $nombre,
            'correo' => strtolower(str_replace(' ', '', $nombre)) . '@sigc.test',
            'password' => 'secreto123', 'estado' => 'Activo',
        ]);
    }

    private function valla(string $codigo, string $estado = 'Disponible'): Valla
    {
        return Valla::create([
            'provincia_id' => $this->provincia->id, 'codigo' => $codigo, 'referencia' => "Ref {$codigo}",
            'latitud' => 9.9, 'longitud' => -84.0, 'tamano' => '12x4', 'vehiculos_diarios' => 1000,
            'precio_normal' => 1500, 'precio_minimo' => 900, 'precio_instalacion' => 200, 'estado' => $estado,
        ]);
    }

    private function enviar(array $vallaIds, string $correo = 'laura@cafetico.cr')
    {
        return $this->postJson('/api/portal/solicitudes', [
            'nombre' => 'Laura Mora', 'telefono' => '88881234', 'correo' => $correo, 'vallas' => $vallaIds,
        ]);
    }

    public function test_al_solicitar_las_vallas_quedan_reservadas_con_reserva_activa(): void
    {
        $eje = $this->usuario('Ejecutivo', 'Eje Uno');
        $a = $this->valla('SJ-001');
        $b = $this->valla('SJ-002');

        $r = $this->enviar([$a->id, $b->id])->assertCreated();

        $this->assertSame('Reservada', $a->fresh()->estado);
        $this->assertSame('Reservada', $b->fresh()->estado);
        $this->assertSame(2, Reserva::where('estado', 'Activa')->where('usuario_id', $eje->id)->count());
        $this->assertEqualsCanonicalizing(['SJ-001', 'SJ-002'], $r->json('data.apartadas'));
        $this->assertSame([], $r->json('data.en_espera'));
        $this->assertSame(now()->addDays(3)->toDateString(), Reserva::first()->fecha_vencimiento->toDateString());
    }

    public function test_otro_visitante_o_el_sistema_ya_no_pueden_tomarlas(): void
    {
        $eje = $this->usuario('Ejecutivo', 'Eje Uno');
        $a = $this->valla('SJ-001');

        $this->enviar([$a->id])->assertCreated();

        // Otro visitante del portal: queda en espera, no se duplica la reserva
        $r = $this->enviar([$a->id], 'otro@x.cr')->assertCreated();
        $this->assertSame(['SJ-001'], $r->json('data.en_espera'));
        $this->assertSame([], $r->json('data.apartadas'));
        $this->assertSame(1, Reserva::count());

        // Un usuario del SIGC: no puede reservarla
        Sanctum::actingAs($eje);
        $this->postJson('/api/reservas', ['valla_id' => $a->id, 'cliente_nombre' => 'Otro'])->assertStatus(422);
    }

    public function test_cerrar_la_solicitud_libera_las_vallas(): void
    {
        $eje = $this->usuario('Ejecutivo', 'Eje Uno');
        $a = $this->valla('SJ-001');

        $this->enviar([$a->id])->assertCreated();
        $id = \App\Models\SolicitudPortal::first()->id;

        Sanctum::actingAs($eje);
        $this->patchJson("/api/solicitudes/{$id}/estado", ['estado' => 'Cerrada'])->assertOk();

        $this->assertSame('Disponible', $a->fresh()->estado);
        $this->assertSame('Cancelada', Reserva::first()->estado);
    }

    public function test_si_la_reserva_se_convirtio_en_contrato_cerrar_no_la_libera(): void
    {
        $eje = $this->usuario('Ejecutivo', 'Eje Uno');
        $a = $this->valla('SJ-001');

        $this->enviar([$a->id])->assertCreated();
        Reserva::first()->update(['estado' => 'Convertida']);
        $a->update(['estado' => 'Alquilada']);
        $id = \App\Models\SolicitudPortal::first()->id;

        Sanctum::actingAs($eje);
        $this->patchJson("/api/solicitudes/{$id}/estado", ['estado' => 'Cerrada'])->assertOk();

        $this->assertSame('Alquilada', $a->fresh()->estado);
    }

    public function test_reasignar_pasa_las_reservas_al_nuevo_ejecutivo(): void
    {
        $uno = $this->usuario('Ejecutivo', 'Eje Uno');
        $dos = $this->usuario('Ejecutivo', 'Eje Dos');
        $admin = $this->usuario('Administrador Empresa', 'Admin Emp');
        $a = $this->valla('SJ-001');

        $this->enviar([$a->id])->assertCreated();
        $solicitud = \App\Models\SolicitudPortal::first();
        $nuevo = $solicitud->usuario_id === $uno->id ? $dos : $uno;

        Sanctum::actingAs($admin);
        $this->patchJson("/api/solicitudes/{$solicitud->id}/reasignar", ['usuario_id' => $nuevo->id])->assertOk();

        $this->assertSame($nuevo->id, Reserva::first()->usuario_id);
    }

    public function test_mezcla_de_libres_y_ocupadas_aparta_solo_las_libres(): void
    {
        $this->usuario('Ejecutivo', 'Eje Uno');
        $libre = $this->valla('SJ-001');
        $ocupada = $this->valla('SJ-002', 'Alquilada');

        $r = $this->enviar([$libre->id, $ocupada->id])->assertCreated();

        $this->assertSame(['SJ-001'], $r->json('data.apartadas'));
        $this->assertSame(['SJ-002'], $r->json('data.en_espera'));
        $this->assertSame('Alquilada', $ocupada->fresh()->estado);
    }

    public function test_tope_de_vallas_apartadas_por_correo(): void
    {
        config(['portal.max_apartadas_por_correo' => 2]);
        $this->usuario('Ejecutivo', 'Eje Uno');
        $ids = collect(range(1, 3))->map(fn ($n) => $this->valla("SJ-00{$n}")->id)->all();

        $this->enviar($ids)->assertStatus(422)->assertJsonValidationErrors('vallas');

        // Nada quedó a medias
        $this->assertSame(0, Reserva::count());
        $this->assertSame(3, Valla::where('estado', 'Disponible')->count());
        $this->assertSame(0, \App\Models\SolicitudPortal::count());
    }

    public function test_la_reserva_vencida_libera_la_valla_y_el_cliente_se_reutiliza(): void
    {
        $this->usuario('Ejecutivo', 'Eje Uno');
        $a = $this->valla('SJ-001');
        $b = $this->valla('SJ-002');

        $this->enviar([$a->id])->assertCreated();
        $this->enviar([$b->id])->assertCreated();

        $this->assertSame(1, \App\Models\Cliente::where('correo', 'laura@cafetico.cr')->count());

        Reserva::query()->update(['fecha_vencimiento' => now()->subDay()->toDateString()]);
        $this->artisan('reservas:vencer')->assertSuccessful();

        $this->assertSame('Disponible', $a->fresh()->estado);
    }

    public function test_sin_ejecutivos_activos_un_administrador_queda_como_responsable(): void
    {
        $admin = $this->usuario('Administrador Empresa', 'Admin Emp');
        $a = $this->valla('SJ-001');

        $this->enviar([$a->id])->assertCreated();

        $this->assertSame('Reservada', $a->fresh()->estado);
        $this->assertSame($admin->id, Reserva::first()->usuario_id);
    }
}
