<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('suportes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cliente_id')->constrained('clientes')->onDelete('cascade');
            $table->foreignId('demanda_id')->constrained('demandas')->onDelete('cascade');
            $table->text('mensagem')->nullable();
            $table->enum('status', ['aberto', 'em_andamento', 'concluido', 'cancelado'])->default('aberto');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('suportes');
    }
};
