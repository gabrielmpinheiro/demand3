<?php

namespace Tests\Feature;

use App\Models\Demanda;
use App\Models\Dominio;
use App\Models\Suporte;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class DemandaTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        $this->dominio = Dominio::factory()->create();
    }

    public function test_can_list_demandas()
    {
        Demanda::factory()->count(3)->create(['dominio_id' => $this->dominio->id]);

        $response = $this->actingAs($this->user)->getJson('/api/demandas');

        $response->assertStatus(200)
            ->assertJsonCount(3, 'data');
    }

    public function test_can_create_demanda()
    {
        $data = [
            'dominio_id' => $this->dominio->id,
            'titulo' => 'Nova Demanda',
            'quantidade_horas_tecnicas' => 2.5,
            'status' => 'pendente',
        ];

        $response = $this->actingAs($this->user)->postJson('/api/demandas', $data);

        $response->assertStatus(201)
            ->assertJsonFragment(['titulo' => 'Nova Demanda']);

        $this->assertDatabaseHas('demandas', ['titulo' => 'Nova Demanda']);
    }

    public function test_can_update_demanda_status_to_em_aprovacao()
    {
        $demanda = Demanda::factory()->create(['dominio_id' => $this->dominio->id]);

        $response = $this->actingAs($this->user)->putJson("/api/demandas/{$demanda->id}", [
            'status' => 'em_aprovacao'
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('demandas', ['id' => $demanda->id, 'status' => 'em_aprovacao']);
    }

    public function test_completing_all_support_demands_updates_support_status()
    {
        $suporte = Suporte::factory()->create(['status' => 'em_andamento']);

        // Create two demands linked to this support
        $demanda1 = Demanda::factory()->create([
            'dominio_id' => $this->dominio->id,
            'suporte_id' => $suporte->id,
            'status' => 'concluido'
        ]);

        $demanda2 = Demanda::factory()->create([
            'dominio_id' => $this->dominio->id,
            'suporte_id' => $suporte->id,
            'status' => 'em_andamento'
        ]);

        // Verify support is still in progress
        $this->assertEquals('em_andamento', $suporte->fresh()->status);

        // Update the second demand to 'concluido'
        $response = $this->actingAs($this->user)->putJson("/api/demandas/{$demanda2->id}", [
            'status' => 'concluido'
        ]);

        $response->assertStatus(200);

        // Verify support status is now 'concluido'
        $this->assertEquals('concluido', $suporte->fresh()->status);
    }
}
