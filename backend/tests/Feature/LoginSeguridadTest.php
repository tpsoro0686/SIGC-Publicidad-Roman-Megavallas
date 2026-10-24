<?php

namespace Tests\Feature;

use App\Models\Rol;
use App\Models\Usuario;
use Database\Seeders\RolSeeder;
use Database\Seeders\UsuarioSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Tests\TestCase;

class LoginSeguridadTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        RateLimiter::clear('login');
    }

    public function test_despues_de_5_intentos_fallidos_el_login_se_bloquea_un_minuto(): void
    {
        $datos = ['correo' => 'nadie@sigc.test', 'password' => 'incorrecta'];

        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/auth/login', $datos)->assertStatus(422);
        }

        $this->postJson('/api/auth/login', $datos)
            ->assertStatus(429)
            ->assertJsonPath('message', 'Demasiados intentos de inicio de sesión. Espera un minuto e inténtalo de nuevo.');
    }

    public function test_otro_correo_no_queda_bloqueado_por_los_intentos_de_uno(): void
    {
        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/auth/login', ['correo' => 'uno@sigc.test', 'password' => 'x']);
        }

        $this->postJson('/api/auth/login', ['correo' => 'dos@sigc.test', 'password' => 'x'])->assertStatus(422);
    }

    public function test_el_login_correcto_sigue_funcionando(): void
    {
        $rol = Rol::create(['nombre' => 'Administrador Sistema', 'descripcion' => 'x']);

        Usuario::create(['rol_id' => $rol->id, 'nombre' => 'Admin', 'correo' => 'a@sigc.test', 'password' => Hash::make('secreto123'), 'estado' => 'Activo']);

        $this->postJson('/api/auth/login', ['correo' => 'a@sigc.test', 'password' => 'secreto123'])
            ->assertOk()->assertJsonStructure(['usuario', 'token']);
    }

    public function test_el_seeder_crea_el_admin_con_el_rol_actual_y_sin_clave_1234(): void
    {
        $this->seed(RolSeeder::class);
        $this->seed(UsuarioSeeder::class);

        $admin = Usuario::where('correo', 'admin@publicidadroman.com')->firstOrFail();

        $this->assertSame('Administrador Sistema', $admin->rol->nombre);

        // Si el .env define SEED_ADMIN_PASSWORD, esa es la clave; si no, se genera una al azar (nunca 1234)
        $configurada = env('SEED_ADMIN_PASSWORD');

        $this->postJson('/api/auth/login', [
            'correo' => 'admin@publicidadroman.com',
            'password' => $configurada ?: '1234',
        ])->assertStatus($configurada ? 200 : 422);
    }
}
