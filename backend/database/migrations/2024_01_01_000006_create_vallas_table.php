<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vallas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('estructura_id')->constrained('estructuras');
            $table->string('codigo', 30)->unique()->comment('Permanente e inmutable, nunca se reutiliza');
            $table->string('tamano', 50)->nullable();
            $table->enum('estado', ['Disponible', 'Reservada', 'Alquilada', 'Mantenimiento', 'Inactiva'])
                  ->default('Disponible');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vallas');
    }
};
