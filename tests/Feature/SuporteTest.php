<?php

namespace Tests\Feature;

use App\Models\Cliente;
use App\Models\Demanda;
use App\Models\Dominio;
use App\Models\Suporte;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class SuporteTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        $this->cliente = Cliente::factory()->create();
        // Create necessary relations for Demanda
        $this->dominio = Dominio::factory()->create(['cliente_id' => $this->cliente->id]);
    }

    public function test_can_list_suportes()
    {
        Suporte::factory()->count(3)->create(['cliente_id' => $this->cliente->id]);

        $response = $this->actingAs($this->user)->getJson('/api/suportes');

        $response->assertStatus(200)
            ->assertJsonCount(3, 'data');
    }

    public function test_can_create_suporte()
    {
        $data = [
            'cliente_id' => $this->cliente->id,
            'mensagem' => 'Teste de suporte',
            'status' => 'aberto',
        ];

        $response = $this->actingAs($this->user)->postJson('/api/suportes', $data);

        $response->assertStatus(201)
            ->assertJsonFragment(['mensagem' => 'Teste de suporte']);

        $this->assertDatabaseHas('suportes', ['mensagem' => 'Teste de suporte']);
    }

    public function test_can_update_suporte()
    {
        $suporte = Suporte::factory()->create(['cliente_id' => $this->cliente->id]);

        $data = [
            'mensagem' => 'Mensagem atualizada',
            'status' => 'em_andamento',
        ];

        $response = $this->actingAs($this->user)->putJson("/api/suportes/{$suporte->id}", $data);

        $response->assertStatus(200);

        $this->assertDatabaseHas('suportes', ['id' => $suporte->id, 'mensagem' => 'Mensagem atualizada']);
    }

    public function test_can_delete_suporte_without_demands()
    {
        $suporte = Suporte::factory()->create(['cliente_id' => $this->cliente->id]);

        $response = $this->actingAs($this->user)->deleteJson("/api/suportes/{$suporte->id}");

        $response->assertStatus(200);
        $this->assertSoftDeleted('suportes', ['id' => $suporte->id]);
    }

    public function test_cannot_delete_suporte_with_pending_demands()
    {
        $suporte = Suporte::factory()->create(['cliente_id' => $this->cliente->id]);

        // Create a pending demand linked to this support
        Demanda::factory()->create([
            'dominio_id' => $this->dominio->id,
            'suporte_id' => $suporte->id,
            'status' => 'pendente'
        ]);

        $response = $this->actingAs($this->user)->deleteJson("/api/suportes/{$suporte->id}");

        $response->assertStatus(422)
            ->assertJsonFragment(['message' => 'Não é possível excluir o suporte pois existem demandas pendentes vinculadas.']);

        $this->assertDatabaseHas('suportes', ['id' => $suporte->id]);
    }

    public function test_can_delete_suporte_with_completed_demands()
    {
        $suporte = Suporte::factory()->create(['cliente_id' => $this->cliente->id]);

        // Create a completed demand linked to this support
        Demanda::factory()->create([
            'dominio_id' => $this->dominio->id,
            'suporte_id' => $suporte->id,
            'status' => 'concluido'
        ]);

        $response = $this->actingAs($this->user)->deleteJson("/api/suportes/{$suporte->id}");

        $response->assertStatus(200);
        $this->assertSoftDeleted('suportes', ['id' => $suporte->id]);
    }
}
