<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        // Codigo secreto de cada solicitud: el cliente lo usa para ver/pagar su pedido
        // sin iniciar sesion (el codigo SOL-0001 es facil de adivinar, este no).
        Schema::table('solicitudes_portal', function (Blueprint $table) {
            $table->string('token', 64)->nullable()->unique()->after('codigo');
        });

        DB::table('solicitudes_portal')->whereNull('token')->pluck('id')->each(function ($id) {
            DB::table('solicitudes_portal')->where('id', $id)->update(['token' => Str::random(40)]);
        });

        Schema::create('pagos_portal', function (Blueprint $table) {
            $table->id();
            $table->foreignId('solicitud_portal_id')->constrained('solicitudes_portal')->cascadeOnDelete();
            $table->string('referencia', 20)->nullable()->unique();
            $table->enum('tipo', ['Adelanto', 'Completo']);
            $table->decimal('monto', 12, 2);
            $table->string('moneda', 3)->default('USD');
            $table->enum('estado', ['Pendiente', 'Pagado', 'Fallido', 'Cancelado', 'Reembolsado'])->default('Pendiente');
            $table->string('pasarela', 30);
            $table->string('pasarela_referencia', 120)->nullable();
            $table->timestamp('pagado_en')->nullable();
            $table->json('datos')->nullable();
            $table->timestamps();

            $table->index(['solicitud_portal_id', 'estado']);
            $table->index(['pasarela', 'pasarela_referencia']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pagos_portal');

        Schema::table('solicitudes_portal', function (Blueprint $table) {
            $table->dropUnique(['token']);
            $table->dropColumn('token');
        });
    }
};
