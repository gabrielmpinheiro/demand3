<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('clientes', function (Blueprint $table) {
            $table->boolean('is_parceiro')->default(false)->after('status');
            $table->date('parceria_inicio')->nullable()->after('is_parceiro');
            $table->date('parceria_fim')->nullable()->after('parceria_inicio');
            $table->decimal('valor_hora_avulsa', 10, 2)->nullable()->after('parceria_fim');
            $table->decimal('valor_hora_subsidiada', 10, 2)->nullable()->after('valor_hora_avulsa');
        });
    }

    public function down(): void
    {
        Schema::table('clientes', function (Blueprint $table) {
            $table->dropColumn([
                'is_parceiro',
                'parceria_inicio',
                'parceria_fim',
                'valor_hora_avulsa',
                'valor_hora_subsidiada',
            ]);
        });
    }
};
