<?php

namespace Tests\Feature;

use App\Models\Provincia;
use App\Models\Rol;
use App\Models\Usuario;
use App\Models\Valla;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Tests\TestCase;

class ImportarVallasTest extends TestCase
{
    use RefreshDatabase;

    private const ENC = ['Código', 'Provincia', 'Referencia', 'Latitud', 'Longitud', 'Tamaño (m)', 'Vehículos diarios',
        'Precio normal (mes)', 'Precio mínimo', 'Instalación', 'Estado sugerido', 'Disponible desde', 'Cliente / nota'];

    private function excel(array $filas): string
    {
        $libro = new Spreadsheet();
        $hoja = $libro->getActiveSheet();
        $hoja->setTitle('Vallas');
        $hoja->fromArray(array_merge([self::ENC], $filas), null, 'A1');

        $ruta = tempnam(sys_get_temp_dir(), 'vallas') . '.xlsx';
        (new Xlsx($libro))->save($ruta);

        return $ruta;
    }

    protected function setUp(): void
    {
        parent::setUp();

        foreach (['San Jose', 'Limon'] as $n) {
            Provincia::firstOrCreate(['nombre' => $n]);
        }
    }

    public function test_importa_todo_con_estados_y_fechas(): void
    {
        $ruta = $this->excel([
            ['SJ-001', 'San Jose', 'Rotonda de Plaza América', 9.911528, -84.099278, '8x5', 91250, null, null, null, 'Alquilada', '2027-02-03', ''],
            ['SJ-002', 'San José', 'Otra', 9.9, -84.1, '9x6', 1000, 1500, 900, 200, 'Disponible', '', ''],
            ['L-001', 'Limón', 'Guápiles', 10.2, -83.79, '10x5', null, null, null, null, 'Reservada', '', 'RESERVADA BNCR'],
        ]);

        $this->artisan('vallas:importar', ['archivo' => $ruta])->assertSuccessful();

        $this->assertSame(3, Valla::count());

        $a = Valla::where('codigo', 'SJ-001')->first();
        $this->assertSame('Alquilada', $a->estado);
        $this->assertSame('2027-02-03', $a->ocupada_hasta->toDateString());
        $this->assertNull($a->precio_normal);

        $b = Valla::where('codigo', 'SJ-002')->first();
        $this->assertEquals(1500, $b->precio_normal);
        $this->assertNull($b->ocupada_hasta);

        $this->assertSame('RESERVADA BNCR', Valla::where('codigo', 'L-001')->first()->ocupada_nota);
    }

    public function test_si_una_fila_falla_no_se_guarda_ninguna(): void
    {
        $ruta = $this->excel([
            ['SJ-001', 'San Jose', 'Buena', 9.9, -84.1, '8x5', 1, null, null, null, 'Disponible', '', ''],
            ['SJ-002', 'San Jose', 'Sin coordenadas', null, null, '8x5', 1, null, null, null, 'Disponible', '', ''],
            ['SJ-003', 'Narnia', 'Provincia mala', 9.9, -84.1, '8x5', 1, null, null, null, 'Disponible', '', ''],
            ['SJ-001', 'San Jose', 'Repetido', 9.9, -84.1, '8x5', 1, null, null, null, 'Disponible', '', ''],
        ]);

        $this->artisan('vallas:importar', ['archivo' => $ruta])
            ->expectsOutputToContain('Fila 3')
            ->expectsOutputToContain('Fila 4')
            ->expectsOutputToContain('Fila 5')
            ->assertFailed();

        $this->assertSame(0, Valla::count());
    }

    public function test_simular_no_guarda(): void
    {
        $ruta = $this->excel([['SJ-001', 'San Jose', 'Buena', 9.9, -84.1, '8x5', 1, null, null, null, 'Disponible', '', '']]);

        $this->artisan('vallas:importar', ['archivo' => $ruta, '--simular' => true])->assertSuccessful();

        $this->assertSame(0, Valla::count());
    }

    public function test_no_reimporta_codigos_que_ya_existen(): void
    {
        $ruta = $this->excel([['SJ-001', 'San Jose', 'Buena', 9.9, -84.1, '8x5', 1, null, null, null, 'Disponible', '', '']]);

        $this->artisan('vallas:importar', ['archivo' => $ruta])->assertSuccessful();
        $this->artisan('vallas:importar', ['archivo' => $ruta])->assertFailed();

        $this->assertSame(1, Valla::count());
    }

    public function test_portal_muestra_la_fecha_de_una_valla_cargada_ocupada(): void
    {
        $ruta = $this->excel([
            ['SJ-001', 'San Jose', 'Ocupada', 9.9, -84.1, '8x5', 1, 1500, null, null, 'Alquilada', now()->addMonths(3)->toDateString(), ''],
        ]);
        $this->artisan('vallas:importar', ['archivo' => $ruta])->assertSuccessful();

        $r = $this->getJson('/api/portal/vallas')->assertOk();

        $this->assertSame('Proximamente', $r->json('0.disponibilidad'));
        $this->assertSame(now()->addMonths(3)->toDateString(), $r->json('0.disponible_desde'));
    }

    public function test_se_libera_sola_al_pasar_la_fecha_y_se_puede_liberar_a_mano(): void
    {
        $ruta = $this->excel([
            ['SJ-001', 'San Jose', 'Vencida', 9.9, -84.1, '8x5', 1, null, null, null, 'Alquilada', now()->subDay()->toDateString(), ''],
            ['SJ-002', 'San Jose', 'Futura', 9.9, -84.1, '8x5', 1, null, null, null, 'Alquilada', now()->addMonth()->toDateString(), ''],
        ]);
        $this->artisan('vallas:importar', ['archivo' => $ruta])->assertSuccessful();

        $this->artisan('vallas:liberar-ocupadas-vencidas')->assertSuccessful();

        $this->assertSame('Disponible', Valla::where('codigo', 'SJ-001')->first()->estado);
        $this->assertNull(Valla::where('codigo', 'SJ-001')->first()->ocupada_hasta);
        $this->assertSame('Alquilada', Valla::where('codigo', 'SJ-002')->first()->estado);

        // A mano: una valla "Alquilada" sin contrato real sí se puede pasar a Disponible
        $rol = Rol::firstOrCreate(['nombre' => 'Administrador Sistema'], ['descripcion' => 'x']);
        $admin = Usuario::create(['rol_id' => $rol->id, 'nombre' => 'A', 'correo' => 'a@x.cr', 'password' => 'secreto123', 'estado' => 'Activo']);
        Sanctum::actingAs($admin);

        $id = Valla::where('codigo', 'SJ-002')->first()->id;
        $this->patchJson("/api/vallas/{$id}/estado", ['estado' => 'Disponible'])->assertOk();

        $this->assertSame('Disponible', Valla::find($id)->estado);
        $this->assertNull(Valla::find($id)->ocupada_hasta);
    }

    public function test_el_mapa_devuelve_todas_las_vallas_sin_paginar(): void
    {
        $filas = [];
        for ($n = 1; $n <= 45; $n++) {
            $filas[] = [sprintf('SJ-%03d', $n), 'San Jose', "Valla {$n}", 9.9, -84.1, '8x5', 1, null, null, null, 'Disponible', '', ''];
        }
        $this->artisan('vallas:importar', ['archivo' => $this->excel($filas)])->assertSuccessful();

        $rol = Rol::firstOrCreate(['nombre' => 'Ejecutivo'], ['descripcion' => 'x']);
        Sanctum::actingAs(Usuario::create(['rol_id' => $rol->id, 'nombre' => 'E', 'correo' => 'e@x.cr', 'password' => 'secreto123', 'estado' => 'Activo']));

        $this->getJson('/api/vallas/mapa')->assertOk()->assertJsonCount(45)->assertJsonStructure([['id', 'codigo', 'referencia', 'latitud', 'longitud', 'estado']]);
    }
}
