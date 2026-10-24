<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('usuarios', function (Blueprint $table) {
            $table->unsignedSmallInteger('turno_portal')->nullable()
                  ->comment('Orden de turno (1, 2, 3...) para recibir solicitudes del portal');
        });

        Schema::table('solicitudes_portal', function (Blueprint $table) {
            $table->foreignId('usuario_turno_id')->nullable()->constrained('usuarios')->nullOnDelete()
                  ->comment('Ejecutivo al que le toco por turno (no cambia si luego se reasigna)');
        });
    }

    public function down(): void
    {
        Schema::table('solicitudes_portal', function (Blueprint $table) {
            $table->dropConstrainedForeignId('usuario_turno_id');
        });

        Schema::table('usuarios', function (Blueprint $table) {
            $table->dropColumn('turno_portal');
        });
    }
};
