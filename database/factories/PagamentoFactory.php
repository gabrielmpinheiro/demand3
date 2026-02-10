<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Cliente;
use App\Models\Assinatura;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Pagamento>
 */
class PagamentoFactory extends Factory
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
            'assinatura_id' => Assinatura::factory(),
            'valor' => $this->faker->randomFloat(2, 50, 1000),
            'valor_horas_avulsas' => 0,
            'status' => 'aberto',
            'data_vencimento' => $this->faker->dateTimeBetween('now', '+1 month'),
            'referencia_mes' => now()->format('Y-m'),
            'descricao' => $this->faker->sentence(),
        ];
    }
}
