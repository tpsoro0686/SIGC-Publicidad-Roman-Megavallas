<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('solicitudes_portal', function (Blueprint $table) {
            $table->id();
            $table->string('codigo', 20)->nullable()->unique();
            $table->string('nombre', 120);
            $table->string('empresa', 150)->nullable();
            $table->string('telefono', 30);
            $table->string('correo', 150);
            $table->text('mensaje')->nullable();
            $table->date('fecha_inicio_deseada')->nullable();
            $table->unsignedSmallInteger('plazo_meses_deseado')->nullable();
            $table->foreignId('usuario_id')->nullable()->constrained('usuarios')->nullOnDelete()
                  ->comment('Ejecutivo asignado por turnos');
            $table->enum('estado', ['Nueva', 'En seguimiento', 'Cerrada'])->default('Nueva');
            $table->timestamp('atendida_en')->nullable();
            $table->timestamps();
        });

        Schema::create('solicitud_portal_vallas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('solicitud_portal_id')->constrained('solicitudes_portal')->cascadeOnDelete();
            $table->foreignId('valla_id')->constrained('vallas');
            $table->decimal('precio_mostrado', 10, 2)->nullable()->comment('Precio normal que vio el cliente al solicitar');
            $table->unique(['solicitud_portal_id', 'valla_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('solicitud_portal_vallas');
        Schema::dropIfExists('solicitudes_portal');
    }
};
