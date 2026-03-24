<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('pagamentos', function (Blueprint $table) {
            $table->foreignId('dominio_id')->nullable()->after('assinatura_id')->constrained('dominios')->onDelete('set null');
            $table->string('referencia')->nullable()->after('referencia_mes');
        });
    }

    public function down(): void
    {
        Schema::table('pagamentos', function (Blueprint $table) {
            $table->dropForeign(['dominio_id']);
            $table->dropColumn('dominio_id');
            $table->dropColumn('referencia');
        });
    }
};
