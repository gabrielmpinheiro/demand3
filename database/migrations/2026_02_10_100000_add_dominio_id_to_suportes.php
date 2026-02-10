<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('suportes', function (Blueprint $table) {
            $table->foreignId('dominio_id')->nullable()->after('cliente_id')->constrained('dominios')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('suportes', function (Blueprint $table) {
            $table->dropForeign(['dominio_id']);
            $table->dropColumn('dominio_id');
        });
    }
};
