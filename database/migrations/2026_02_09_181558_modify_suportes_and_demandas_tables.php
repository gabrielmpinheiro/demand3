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
        Schema::table('suportes', function (Blueprint $table) {
            $table->dropForeign(['demanda_id']);
            $table->dropColumn('demanda_id');
        });

        Schema::table('demandas', function (Blueprint $table) {
            $table->foreignId('suporte_id')->nullable()->after('assinatura_id')->constrained('suportes')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('demandas', function (Blueprint $table) {
            $table->dropForeign(['suporte_id']);
            $table->dropColumn('suporte_id');
        });

        Schema::table('suportes', function (Blueprint $table) {
            // Note: This restores the column but cannot restore the data relationship automatically
            // Also, assuming the original migration had 'demanda_id' as non-nullable, we might need 
            // to make it nullable here or handle data issues if we were to rollback with existing data.
            // For safety in rollback of this specific change, we make it nullable or we'd need a default.
            // checking original migration: $table->foreignId('demanda_id')->constrained('demandas')->onDelete('cascade');
            // It was not nullable. I will make it nullable here to avoid rollback errors if suportes exist without demandas.
            $table->foreignId('demanda_id')->nullable()->after('cliente_id')->constrained('demandas')->onDelete('cascade');
        });
    }
};
