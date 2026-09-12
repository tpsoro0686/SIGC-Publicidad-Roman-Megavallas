<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reportes', function (Blueprint $table) {
            $table->id();
            $table->enum('tipo', ['Contratos', 'Reservas', 'Vallas', 'Clientes', 'Financiero']);
            $table->enum('formato', ['PDF', 'Excel', 'Ambos']);
            $table->json('filtros')->nullable();
            $table->string('archivo_pdf')->nullable();
            $table->string('archivo_excel')->nullable();
            $table->foreignId('usuario_id')->constrained('usuarios');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reportes');
    }
};
