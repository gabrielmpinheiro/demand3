<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('dominios', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cliente_id')->constrained('clientes')->onDelete('cascade');
            $table->string('nome');
            $table->enum('status', ['ativo', 'inativo', 'cancelado'])->default('ativo');
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['nome', 'deleted_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dominios');
    }
};
