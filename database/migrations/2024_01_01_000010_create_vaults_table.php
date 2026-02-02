<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('vaults', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cliente_id')->constrained('clientes')->onDelete('cascade');
            $table->foreignId('dominio_id')->nullable()->constrained('dominios')->onDelete('set null');
            $table->string('servico');
            $table->string('login');
            $table->text('senha'); // encrypted
            $table->string('url')->nullable();
            $table->text('notas')->nullable();
            $table->enum('status', ['ativo', 'inativo', 'cancelado'])->default('ativo');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vaults');
    }
};
