<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

return new class extends Migration {
    public function up(): void
    {
        DB::table('users')->insertOrIgnore([
            'name' => 'Gabriel Pinheiro',
            'email' => 'gabrielmpinheiro2@gmail.com',
            'password' => Hash::make('Balaio@12345'),
            'role' => 'admin',
            'status' => 'ativo',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        DB::table('users')->where('email', 'gabrielmpinheiro2@gmail.com')->delete();
    }
};
