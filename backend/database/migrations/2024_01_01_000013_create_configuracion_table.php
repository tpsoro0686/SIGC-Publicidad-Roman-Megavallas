<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('configuracion', function (Blueprint $table) {
            $table->id();
            $table->decimal('tipo_cambio', 8, 2)->comment('USD -> CRC');
            $table->string('empresa', 150)->nullable();
            $table->string('logo', 255)->nullable();
            $table->decimal('comision_ejecutivo_pct', 5, 2)->default(0)->comment('Comision fija, igual para todos los ejecutivos');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('configuracion');
    }
};
