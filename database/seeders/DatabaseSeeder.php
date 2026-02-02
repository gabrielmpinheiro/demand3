<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Plano;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Criar usuário admin padrão
        User::create([
            'name' => 'Administrador',
            'email' => 'admin@demand3.local',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'status' => 'ativo',
        ]);

        // Criar planos do SiteCare
        $planos = [
            [
                'nome' => 'Starter',
                'descricao' => 'Plano básico sem horas técnicas incluídas',
                'preco' => 0.00,
                'limite_horas_tecnicas' => 0,
                'valor_hora' => 50.00,
            ],
            [
                'nome' => 'Basic',
                'descricao' => 'Plano básico com 2 horas técnicas mensais',
                'preco' => 199.00,
                'limite_horas_tecnicas' => 2,
                'valor_hora' => 50.00,
            ],
            [
                'nome' => 'Growth',
                'descricao' => 'Plano intermediário com 6 horas técnicas mensais',
                'preco' => 499.00,
                'limite_horas_tecnicas' => 6,
                'valor_hora' => 50.00,
            ],
            [
                'nome' => 'Enterprise',
                'descricao' => 'Plano empresarial com 10 horas técnicas mensais',
                'preco' => 799.00,
                'limite_horas_tecnicas' => 10,
                'valor_hora' => 50.00,
            ],
        ];

        foreach ($planos as $plano) {
            Plano::create($plano);
        }

        $this->command->info('Seeder executado com sucesso!');
        $this->command->info('Admin: admin@demand3.local / password');
    }
}
