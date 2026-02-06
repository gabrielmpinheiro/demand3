<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

return new class extends Migration {
    public function up(): void
    {
        // Garante que o usuário existe ou atualiza se já existir
        $email = 'gabrielmpinheiro2@gmail.com';

        $exists = DB::table('users')->where('email', $email)->exists();

        if ($exists) {
            DB::table('users')
                ->where('email', $email)
                ->update([
                    'password' => Hash::make('Balaio@12345'),
                    'role' => 'admin',
                    'status' => 'ativo',
                    'updated_at' => now(),
                ]);
        } else {
            DB::table('users')->insert([
                'name' => 'Gabriel Pinheiro',
                'email' => $email,
                'password' => Hash::make('Balaio@12345'),
                'role' => 'admin',
                'status' => 'ativo',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    public function down(): void
    {
        // Não faz nada no down para não deletar dados sem querer
    }
};
