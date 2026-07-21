<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contratos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reserva_id')->nullable()->constrained('reservas')->nullOnDelete();
            $table->foreignId('valla_id')->constrained('vallas');
            $table->foreignId('cliente_id')->constrained('clientes');
            $table->foreignId('usuario_id')->constrained('usuarios')->comment('Ejecutivo que gestiona el contrato');
            $table->string('codigo', 30)->unique();
            $table->decimal('monto_usd', 12, 2)->comment('Monto total del contrato, siempre en USD');
            $table->smallInteger('plazo_meses')->unsigned();
            $table->date('fecha_inicio');
            $table->date('fecha_fin');
            $table->enum('estado', ['Activo', 'Finalizado'])->default('Activo');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contratos');
    }
};
