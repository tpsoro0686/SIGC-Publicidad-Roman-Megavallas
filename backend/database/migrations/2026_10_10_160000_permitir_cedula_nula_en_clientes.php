<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('clientes', function (Blueprint $table) {
            $table->string('cedula', 30)->nullable()->change();
        });

        // Los clientes creados al reservar tenían una cédula inventada (TEMP-...). Ahora van en blanco.
        DB::table('clientes')->where('cedula', 'like', 'TEMP-%')->update(['cedula' => null]);
    }

    public function down(): void
    {
        DB::table('clientes')->whereNull('cedula')->update(['cedula' => DB::raw("CONCAT('TEMP-', id)")]);

        Schema::table('clientes', function (Blueprint $table) {
            $table->string('cedula', 30)->nullable(false)->change();
        });
    }
};
