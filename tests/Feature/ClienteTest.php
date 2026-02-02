<?php

namespace Tests\Feature;

use App\Models\Cliente;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ClienteTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected string $token;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create([
            'role' => 'admin',
            'status' => 'ativo',
        ]);

        $this->token = $this->admin->createToken('test-token')->plainTextToken;
    }

    public function test_pode_listar_clientes(): void
    {
        Cliente::factory()->count(3)->create();

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
        ])->getJson('/api/clientes');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'nome', 'email', 'status'],
                ],
            ]);
    }

    public function test_pode_criar_cliente(): void
    {
        $data = [
            'nome' => 'Teste Cliente',
            'email' => 'teste@cliente.com',
            'telefone' => '11999999999',
            'cnpj' => '12.345.678/0001-90',
        ];

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
        ])->postJson('/api/clientes', $data);

        $response->assertStatus(201)
            ->assertJsonPath('data.nome', 'Teste Cliente')
            ->assertJsonPath('data.email', 'teste@cliente.com');

        $this->assertDatabaseHas('clientes', [
            'email' => 'teste@cliente.com',
        ]);
    }

    public function test_pode_visualizar_cliente(): void
    {
        $cliente = Cliente::factory()->create();

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
        ])->getJson("/api/clientes/{$cliente->id}");

        $response->assertStatus(200)
            ->assertJsonPath('data.id', $cliente->id);
    }

    public function test_pode_atualizar_cliente(): void
    {
        $cliente = Cliente::factory()->create();

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
        ])->putJson("/api/clientes/{$cliente->id}", [
                    'nome' => 'Nome Atualizado',
                ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.nome', 'Nome Atualizado');
    }

    public function test_pode_excluir_cliente(): void
    {
        $cliente = Cliente::factory()->create();

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
        ])->deleteJson("/api/clientes/{$cliente->id}");

        $response->assertStatus(200);

        $this->assertSoftDeleted('clientes', ['id' => $cliente->id]);
    }

    public function test_validacao_email_unico(): void
    {
        Cliente::factory()->create(['email' => 'existente@teste.com']);

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
        ])->postJson('/api/clientes', [
                    'nome' => 'Novo Cliente',
                    'email' => 'existente@teste.com',
                ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }
}
