<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('solicitud_portal_vallas', function (Blueprint $table) {
            $table->foreignId('reserva_id')->nullable()->after('precio_mostrado')
                  ->constrained('reservas')->nullOnDelete()
                  ->comment('Reserva que aparta la valla mientras se atiende la solicitud (null = quedó en espera)');
        });
    }

    public function down(): void
    {
        Schema::table('solicitud_portal_vallas', function (Blueprint $table) {
            $table->dropConstrainedForeignId('reserva_id');
        });
    }
};
