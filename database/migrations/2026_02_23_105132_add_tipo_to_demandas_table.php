<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('demandas', function (Blueprint $table) {
            $table->enum('tipo', ['hora_tecnica', 'plano'])->default('hora_tecnica')->after('descricao');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('demandas', function (Blueprint $table) {
            $table->dropColumn('tipo');
        });
    }
};
