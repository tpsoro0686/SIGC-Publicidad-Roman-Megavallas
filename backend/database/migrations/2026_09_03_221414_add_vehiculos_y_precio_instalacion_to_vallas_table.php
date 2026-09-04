<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('vallas', function (Blueprint $table) {

            $table->unsignedInteger('vehiculos_diarios')->nullable()->after('tamano');

            $table->decimal('precio_instalacion', 10, 2)->nullable()->after('precio_minimo');

        });
    }

    public function down(): void
    {
        Schema::table('vallas', function (Blueprint $table) {

            $table->dropColumn(['vehiculos_diarios', 'precio_instalacion']);

        });
    }
};
