<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Plano>
 */
class PlanoFactory extends Factory
{
    public function definition(): array
    {
        return [
            'nome' => fake()->word(),
            'descricao' => fake()->sentence(),
            'preco' => fake()->randomFloat(2, 50, 500),
            'limite_horas_tecnicas' => fake()->numberBetween(0, 10),
            'valor_hora' => 50.00,
            'status' => 'ativo',
        ];
    }
}
