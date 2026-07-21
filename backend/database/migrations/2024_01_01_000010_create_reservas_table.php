<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reservas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('valla_id')->constrained('vallas');
            $table->foreignId('cliente_id')->constrained('clientes');
            $table->foreignId('usuario_id')->constrained('usuarios')->comment('Ejecutivo que gestiona la reserva');
            $table->date('fecha_reserva');
            $table->date('fecha_vencimiento');
            $table->enum('estado', ['Activa', 'Convertida', 'Vencida', 'Cancelada'])->default('Activa');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reservas');
    }
};
