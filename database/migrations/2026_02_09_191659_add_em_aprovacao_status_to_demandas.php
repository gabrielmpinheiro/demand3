<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (DB::getDriverName() === 'sqlite') {
            return;
        }

        // Using raw SQL to modify ENUM column because Doctrine DBAL has limitations with ENUMs
        DB::statement("ALTER TABLE demandas MODIFY COLUMN status ENUM('pendente', 'em_andamento', 'em_aprovacao', 'concluido', 'cancelado') DEFAULT 'pendente'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Reverting to previous ENUM definition
        DB::statement("ALTER TABLE demandas MODIFY COLUMN status ENUM('pendente', 'em_andamento', 'concluido', 'cancelado') DEFAULT 'pendente'");
    }
};
