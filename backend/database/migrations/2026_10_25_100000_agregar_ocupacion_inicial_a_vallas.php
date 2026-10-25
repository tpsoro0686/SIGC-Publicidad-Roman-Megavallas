<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('vallas', function (Blueprint $table) {
            // Para vallas cargadas ya ocupadas, antes de existir su contrato/reserva en el sistema:
            // hasta cuándo están ocupadas y una nota (ej. "RESERVADA BNCR").
            $table->date('ocupada_hasta')->nullable()->after('estado');
            $table->string('ocupada_nota', 150)->nullable()->after('ocupada_hasta');
        });
    }

    public function down(): void
    {
        Schema::table('vallas', function (Blueprint $table) {
            $table->dropColumn(['ocupada_hasta', 'ocupada_nota']);
        });
    }
};
