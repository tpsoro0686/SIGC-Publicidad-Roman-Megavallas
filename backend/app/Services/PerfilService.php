<?php

namespace App\Services;

use App\Models\Bitacora;
use App\Models\Contrato;
use App\Models\Reserva;
use App\Models\Usuario;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class PerfilService
{
    public function actualizarNombre(Usuario $usuario, string $nombre): Usuario
    {
        $usuario->update(['nombre' => $nombre]);

        $this->registrarBitacora($usuario, 'Actualizacion de nombre propio');

        return $usuario->load('rol');
    }

    public function cambiarPassword(Usuario $usuario, string $actual, string $nueva): void
    {
        if (! Hash::check($actual, $usuario->password)) {

            throw ValidationException::withMessages([
                'password_actual' => ['La contraseña actual no es correcta.'],
            ]);

        }

        $usuario->update(['password' => Hash::make($nueva)]);

        $this->registrarBitacora($usuario, 'Cambio de contraseña propia');
    }

    public function estadisticas(Usuario $usuario): array
    {
        $inicioMes = now()->startOfMonth();

        $vallasCreadas = Bitacora::where('usuario_id', $usuario->id)
            ->where('modulo', 'Vallas')
            ->where('accion', 'Creacion de valla')
            ->where('created_at', '>=', $inicioMes)
            ->count();

        $reservasCreadas = Reserva::where('usuario_id', $usuario->id)
            ->where('fecha_reserva', '>=', $inicioMes->toDateString())
            ->count();

        $contratosCreados = Contrato::where('usuario_id', $usuario->id)
            ->where('fecha_inicio', '>=', $inicioMes->toDateString())
            ->count();

        $montoVendido = Contrato::where('usuario_id', $usuario->id)
            ->where('fecha_inicio', '>=', $inicioMes->toDateString())
            ->sum('monto_usd');

        return [
            'vallas_creadas' => $vallasCreadas,
            'reservas_creadas' => $reservasCreadas,
            'contratos_creados' => $contratosCreados,
            'monto_vendido' => (float) $montoVendido,
        ];
    }

    public function actividad(Usuario $usuario, int $limite = 30)
    {
        return Bitacora::where('usuario_id', $usuario->id)
            ->latest('created_at')
            ->limit($limite)
            ->get();
    }

    public function exportarActividadCsv(Usuario $usuario): string
    {
        $registros = Bitacora::where('usuario_id', $usuario->id)
            ->latest('created_at')
            ->get();

        $lineas = ["Fecha,Modulo,Accion,Descripcion"];

        foreach ($registros as $registro) {

            $lineas[] = implode(',', [
                $registro->created_at,
                $registro->modulo,
                $registro->accion,
                '"' . str_replace('"', '""', $registro->descripcion) . '"',
            ]);

        }

        return implode("\n", $lineas);
    }

    public function sesiones(Usuario $usuario, string $tokenActualId)
    {
        return $usuario->tokens->map(fn ($token) => [
            'id' => $token->id,
            'nombre' => $token->name,
            'creado' => $token->created_at?->format('Y-m-d H:i'),
            'ultimo_uso' => $token->last_used_at?->format('Y-m-d H:i') ?? 'Nunca',
            'es_actual' => (string) $token->id === $tokenActualId,
        ]);
    }

    public function revocarSesion(Usuario $usuario, int $tokenId): void
    {
        $usuario->tokens()->where('id', $tokenId)->delete();
    }

    private function registrarBitacora(Usuario $usuario, string $accion): void
    {
        Bitacora::create([
            'usuario_id' => $usuario->id,
            'modulo' => 'Perfil',
            'accion' => $accion,
            'descripcion' => "{$usuario->nombre} ({$usuario->correo})",
        ]);
    }
}
