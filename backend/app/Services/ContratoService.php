<?php

namespace App\Services;

use App\Models\Cliente;
use App\Models\Configuracion;
use App\Models\Contrato;
use App\Models\Reserva;
use App\Models\Usuario;
use App\Models\Valla;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ContratoService
{


        public function listar(?string $estado, Usuario $usuarioActual)
    {
        return Contrato::with('valla', 'cliente', 'usuario')
            ->when($estado, fn ($query) => $query->where('estado', $estado))
            ->when($usuarioActual->rol->nombre === 'Ejecutivo', fn ($query) => $query->where('usuario_id', $usuarioActual->id))
            ->latest('fecha_inicio')
            ->get();
    }

    public function crear(array $datos, Usuario $usuario): Contrato
    {
        return DB::transaction(function () use ($datos, $usuario) {

            $reserva = null;

            $datosCliente = $datos['cliente'] ?? [];

            if (!empty($datos['reserva_id'])) {

                $reserva = Reserva::with('valla', 'cliente')->findOrFail($datos['reserva_id']);

                $vallaId = $reserva->valla_id;

                $cliente = $this->completarCliente($reserva->cliente, $reserva->cliente->nombre, $datosCliente);

            } else {

                $vallaId = $datos['valla_id'];

                $clienteExistente = !empty($datos['cliente_id']) ? Cliente::findOrFail($datos['cliente_id']) : null;

                $cliente = $this->completarCliente($clienteExistente, $clienteExistente?->nombre ?? $datos['cliente_nombre'], $datosCliente);

            }

            $valla = Valla::findOrFail($vallaId);

            $fechaInicio = $datos['fecha_inicio'];

            $fechaFin = now()->parse($fechaInicio)->addMonths($datos['plazo_meses'])->toDateString();

            $contrato = Contrato::create([
                'reserva_id' => $reserva?->id,
                'valla_id' => $valla->id,
                'cliente_id' => $cliente->id,
                'usuario_id' => $usuario->id,
                'codigo' => $this->generarCodigo($valla, $fechaInicio),
                'monto_usd' => $datos['monto_usd'],
                'plazo_meses' => $datos['plazo_meses'],
                'fecha_inicio' => $fechaInicio,
                'fecha_fin' => $fechaFin,
                'estado' => 'Activo',
            ]);

            $valla->update(['estado' => 'Alquilada']);

            if ($reserva && $reserva->estado === 'Activa') {

                $reserva->update(['estado' => 'Convertida']);

            }

            return $contrato->load('valla', 'cliente', 'usuario');

        });
    }

    public function finalizarAntes(Contrato $contrato): Contrato
    {
        if ($contrato->estado !== 'Activo') {

            throw ValidationException::withMessages([
                'estado' => ['Solo se pueden finalizar contratos activos.'],
            ]);

        }

        $contrato->update(['estado' => 'Finalizado']);

        $contrato->valla->update(['estado' => 'Disponible']);

        return $contrato->load('valla', 'cliente', 'usuario');
    }

    public function renovar(Contrato $contrato, array $datos): Contrato
    {
        $fechaFin = now()->parse($datos['fecha_inicio'])->addMonths($datos['plazo_meses'])->toDateString();

        $contrato->update([
            'plazo_meses' => $datos['plazo_meses'],
            'fecha_inicio' => $datos['fecha_inicio'],
            'fecha_fin' => $fechaFin,
            'monto_usd' => $datos['monto_usd'] ?? $contrato->monto_usd,
            'estado' => 'Activo',
        ]);

        $contrato->valla->update(['estado' => 'Alquilada']);

        return $contrato->load('valla', 'cliente', 'usuario');
    }

        public function verificarPropiedad(Contrato $contrato, Usuario $usuarioActual): void
    {
        if ($usuarioActual->rol->nombre === 'Ejecutivo' && $contrato->usuario_id !== $usuarioActual->id) {

            throw ValidationException::withMessages([
                'contrato' => ['No tenés permiso sobre este contrato.'],
            ]);

        }

    }

    public function eliminar(Contrato $contrato): void
    {
        if (!$contrato->puedeEliminarse()) {

            throw ValidationException::withMessages([
                'estado' => ['Solo se puede eliminar un contrato cuyo plazo ya finalizó.'],
            ]);

        }

        $contrato->delete();

    }

    public function vencerContratosExpirados(): int
    {
        $contratos = Contrato::where('estado', 'Activo')
            ->whereDate('fecha_fin', '<', now()->toDateString())
            ->get();

        foreach ($contratos as $contrato) {

            $contrato->update(['estado' => 'Finalizado']);

            if ($contrato->valla->estado === 'Alquilada') {

                $contrato->valla->update(['estado' => 'Disponible']);

            }

        }

        return $contratos->count();
    }

        public function resumen(Usuario $usuarioActual): array
    {
        $base = Contrato::query()
            ->when($usuarioActual->rol->nombre === 'Ejecutivo', fn ($query) => $query->where('usuario_id', $usuarioActual->id));

        return [
            'activos' => (clone $base)->where('estado', 'Activo')->count(),
            'finalizados' => (clone $base)->where('estado', 'Finalizado')->count(),
            'por_vencer' => (clone $base)->where('estado', 'Activo')
                ->whereBetween('fecha_fin', [now()->toDateString(), now()->addDays(Configuracion::actual()->dias_aviso_vencimiento)->toDateString()])
                ->count(),
            'monto_activo' => (float) (clone $base)->where('estado', 'Activo')->sum('monto_usd'),
        ];
    }

    /**
     * Todo contrato debe llevar los datos completos del cliente.
     * Toma lo enviado en el formulario y, si falta algo, lo que el cliente ya tenga guardado.
     * Si el cliente aún no existe, lo crea (o reutiliza el que ya tenga esa cédula).
     */
    private function completarCliente(?Cliente $cliente, string $nombre, array $enviados): Cliente
    {
        $etiquetas = [
            'cedula' => 'Falta la cédula del cliente.',
            'telefono' => 'Falta el teléfono del cliente.',
            'correo' => 'Falta el correo del cliente.',
            'direccion' => 'Falta la dirección del cliente.',
        ];

        $final = [];

        $errores = [];

        foreach ($etiquetas as $campo => $mensaje) {

            $valor = trim((string) ($enviados[$campo] ?? ''));

            $final[$campo] = $valor !== '' ? $valor : trim((string) ($cliente?->{$campo} ?? ''));

            if ($final[$campo] === '') {

                $errores["cliente.{$campo}"] = [$mensaje];

            }

        }

        if (!empty($errores)) {

            throw ValidationException::withMessages($errores);

        }

        $conMismaCedula = Cliente::where('cedula', $final['cedula'])
            ->when($cliente, fn ($query) => $query->where('id', '!=', $cliente->id))
            ->first();

        if ($conMismaCedula && $cliente) {

            throw ValidationException::withMessages([
                'cliente.cedula' => ["Ya existe otro cliente registrado con esa cédula ({$conMismaCedula->nombre})."],
            ]);

        }

        // Cliente nuevo cuya cédula ya existe: se reutiliza el registro, sin duplicarlo
        $cliente = $cliente ?? $conMismaCedula;

        if ($cliente) {

            $cliente->update($final);

            return $cliente;

        }

        return Cliente::create(array_merge($final, [
            'nombre' => $nombre,
            'estado' => 'Activo',
        ]));
    }

       private function generarCodigo(Valla $valla, string $fechaInicio): string
    {
        $fecha = now()->parse($fechaInicio);

        return "CT-{$valla->codigo}-{$fecha->format('m')}-{$fecha->format('y')}";
    }
}
