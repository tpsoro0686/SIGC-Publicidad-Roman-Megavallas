<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('configuracion', function (Blueprint $table) {

            $table->string('correo', 150)->nullable()->after('empresa');
            $table->string('telefono', 30)->nullable()->after('correo');
            $table->string('direccion', 255)->nullable()->after('telefono');
            $table->enum('cedula_tipo', ['fisica', 'juridica'])->default('fisica')->after('direccion');
            $table->string('cedula_numero', 30)->nullable()->after('cedula_tipo');
            $table->string('sitio_web', 255)->nullable()->after('cedula_numero');

            $table->boolean('tipo_cambio_auto')->default(false)->after('tipo_cambio');
            $table->timestamp('tipo_cambio_actualizado_en')->nullable()->after('tipo_cambio_auto');

            $table->unsignedInteger('dias_aviso_vencimiento')->default(30)->after('comision_ejecutivo_pct');

            $table->boolean('notificaciones_activas')->default(false)->after('dias_aviso_vencimiento');
            $table->string('notificaciones_correo_remitente', 150)->nullable()->after('notificaciones_activas');
            $table->string('notificaciones_nombre_remitente', 150)->nullable()->after('notificaciones_correo_remitente');

            $table->timestamp('scheduler_ultima_corrida')->nullable()->after('notificaciones_nombre_remitente');

        });
    }

    public function down(): void
    {
        Schema::table('configuracion', function (Blueprint $table) {

            $table->dropColumn([
                'correo', 'telefono', 'direccion', 'cedula_tipo', 'cedula_numero', 'sitio_web',
                'tipo_cambio_auto', 'tipo_cambio_actualizado_en',
                'dias_aviso_vencimiento',
                'notificaciones_activas', 'notificaciones_correo_remitente', 'notificaciones_nombre_remitente',
                'scheduler_ultima_corrida',
            ]);

        });
    }
};
