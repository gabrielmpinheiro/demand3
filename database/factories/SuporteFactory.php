<?php

namespace Database\Factories;

use App\Models\Cliente;
use App\Models\Suporte;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Suporte>
 */
class SuporteFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'cliente_id' => Cliente::factory(),
            'mensagem' => $this->faker->paragraph(),
            'status' => $this->faker->randomElement(['aberto', 'em_andamento', 'concluido', 'cancelado']),
        ];
    }
}
