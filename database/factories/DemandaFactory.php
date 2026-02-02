<?php

namespace Database\Factories;

use App\Models\Assinatura;
use App\Models\Dominio;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Demanda>
 */
class DemandaFactory extends Factory
{
    public function definition(): array
    {
        return [
            'dominio_id' => Dominio::factory(),
            // assinatura_id opcional
            'titulo' => fake()->sentence(),
            'descricao' => fake()->paragraph(),
            'status' => 'pendente',
            'quantidade_horas_tecnicas' => fake()->numberBetween(1, 10),
            'valor' => 0,
            'valor_excedente' => 0,
            'cobrado' => false,
        ];
    }
}
