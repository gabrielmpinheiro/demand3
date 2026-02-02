<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('demandas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dominio_id')->constrained('dominios')->onDelete('cascade');
            $table->foreignId('assinatura_id')->nullable()->constrained('assinaturas')->onDelete('set null');
            $table->string('titulo');
            $table->text('descricao')->nullable();
            $table->enum('status', ['pendente', 'em_andamento', 'concluido', 'cancelado'])->default('pendente');
            $table->decimal('quantidade_horas_tecnicas', 8, 2)->default(0);
            $table->decimal('valor', 10, 2)->default(0);
            $table->decimal('valor_excedente', 10, 2)->default(0);
            $table->boolean('cobrado')->default(false);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('demandas');
    }
};
