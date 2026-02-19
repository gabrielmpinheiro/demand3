<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        // Adicionar user_id à tabela clientes
        Schema::table('clientes', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->after('id')->constrained('users')->onDelete('set null');
        });

        // Alterar enum role em users para incluir 'cliente'
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'user', 'cliente') DEFAULT 'user'");

        // Alterar enum status em pagamentos para incluir 'pendente_conferencia'
        DB::statement("ALTER TABLE pagamentos MODIFY COLUMN status ENUM('aberto', 'pago', 'cancelado', 'pendente_conferencia') DEFAULT 'aberto'");
    }

    public function down(): void
    {
        Schema::table('clientes', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropColumn('user_id');
        });

        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'user') DEFAULT 'user'");
        DB::statement("ALTER TABLE pagamentos MODIFY COLUMN status ENUM('aberto', 'pago', 'cancelado') DEFAULT 'aberto'");
    }
};
