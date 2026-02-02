<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('assinaturas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cliente_id')->constrained('clientes')->onDelete('cascade');
            $table->foreignId('dominio_id')->constrained('dominios')->onDelete('cascade');
            $table->foreignId('plano_id')->constrained('planos')->onDelete('cascade');
            $table->decimal('horas_disponiveis', 8, 2)->default(0);
            $table->enum('status', ['ativo', 'inativo', 'cancelado'])->default('ativo');
            $table->date('data_inicio')->nullable();
            $table->date('data_fim')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['dominio_id', 'deleted_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assinaturas');
    }
};
