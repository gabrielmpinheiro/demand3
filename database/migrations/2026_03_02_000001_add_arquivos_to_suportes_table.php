<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('suportes', function (Blueprint $table) {
            $table->json('arquivos')->nullable()->after('mensagem');
        });
    }

    public function down(): void
    {
        Schema::table('suportes', function (Blueprint $table) {
            $table->dropColumn('arquivos');
        });
    }
};
