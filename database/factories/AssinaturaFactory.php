<?php

namespace Database\Factories;

use App\Models\Cliente;
use App\Models\Dominio;
use App\Models\Plano;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Assinatura>
 */
class AssinaturaFactory extends Factory
{
    public function definition(): array
    {
        return [
            'cliente_id' => Cliente::factory(),
            'dominio_id' => Dominio::factory(),
            'plano_id' => Plano::factory(),
            'horas_disponiveis' => fake()->numberBetween(0, 10),
            'status' => 'ativo',
            'data_inicio' => now(),
        ];
    }
}
