<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fotos_vallas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('valla_id')->constrained('vallas')->cascadeOnDelete();
            $table->string('ruta_archivo', 255);
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fotos_vallas');
    }
};
