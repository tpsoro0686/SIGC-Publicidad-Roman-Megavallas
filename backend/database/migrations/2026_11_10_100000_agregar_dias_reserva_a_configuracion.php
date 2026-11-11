<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('configuracion', function (Blueprint $table) {
            // Días que una valla queda reservada antes de volver sola a Disponible
            $table->unsignedSmallInteger('dias_reserva')->default(3)->after('dias_aviso_vencimiento');
        });
    }

    public function down(): void
    {
        Schema::table('configuracion', function (Blueprint $table) {
            $table->dropColumn('dias_reserva');
        });
    }
};
