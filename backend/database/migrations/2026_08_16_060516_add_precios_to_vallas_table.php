<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('vallas', function (Blueprint $table) {
            $table->decimal('precio_normal', 10, 2)->nullable()->after('tamano');
            $table->decimal('precio_minimo', 10, 2)->nullable()->after('precio_normal');
        });
    }

    public function down(): void
    {
        Schema::table('vallas', function (Blueprint $table) {
            $table->dropColumn(['precio_normal', 'precio_minimo']);
        });
    }
};