<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('pagamentos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cliente_id')->constrained('clientes')->onDelete('cascade');
            $table->foreignId('assinatura_id')->nullable()->constrained('assinaturas')->onDelete('set null');
            $table->decimal('valor', 10, 2);
            $table->enum('status', ['aberto', 'pago', 'cancelado'])->default('aberto');
            $table->date('data_vencimento')->nullable();
            $table->date('data_pagamento')->nullable();
            $table->string('referencia_mes', 7)->nullable(); // formato: YYYY-MM
            $table->text('descricao')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pagamentos');
    }
};
