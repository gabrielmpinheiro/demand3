<?php

namespace Tests\Feature;

use App\Models\Cliente;
use App\Models\Dominio;
use App\Models\Plano;
use App\Models\Assinatura;
use App\Models\Demanda;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DemandaTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected string $token;
    protected Cliente $cliente;
    protected Dominio $dominio;
    protected Plano $plano;
    protected Assinatura $assinatura;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create([
            'role' => 'admin',
            'status' => 'ativo',
        ]);

        $this->token = $this->admin->createToken('test-token')->plainTextToken;

        // Setup básico
        $this->cliente = Cliente::factory()->create();
        $this->dominio = Dominio::factory()->create(['cliente_id' => $this->cliente->id]);
        $this->plano = Plano::factory()->create([
            'nome' => 'Growth',
            'limite_horas_tecnicas' => 6,
            'valor_hora' => 50.00,
        ]);
        $this->assinatura = Assinatura::factory()->create([
            'cliente_id' => $this->cliente->id,
            'dominio_id' => $this->dominio->id,
            'plano_id' => $this->plano->id,
            'horas_disponiveis' => 6,
            'status' => 'ativo',
        ]);
    }

    public function test_pode_criar_demanda(): void
    {
        $data = [
            'dominio_id' => $this->dominio->id,
            'titulo' => 'Corrigir bug na página inicial',
            'descricao' => 'O botão de contato não está funcionando',
            'quantidade_horas_tecnicas' => 2,
        ];

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
        ])->postJson('/api/demandas', $data);

        $response->assertStatus(201)
            ->assertJsonPath('data.titulo', 'Corrigir bug na página inicial');

        // Verifica se as horas foram descontadas
        $this->assinatura->refresh();
        $this->assertEquals(4, $this->assinatura->horas_disponiveis);
    }

    public function test_demanda_com_horas_excedentes(): void
    {
        // Configura assinatura com poucas horas
        $this->assinatura->update(['horas_disponiveis' => 1]);

        $data = [
            'dominio_id' => $this->dominio->id,
            'titulo' => 'Demanda grande',
            'quantidade_horas_tecnicas' => 3,
        ];

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
        ])->postJson('/api/demandas', $data);

        $response->assertStatus(201);

        // 3h - 1h disponível = 2h excedente * R$50 = R$100
        $response->assertJsonPath('data.valor_excedente', '100.00');

        // Assinatura deve ter 0 horas
        $this->assinatura->refresh();
        $this->assertEquals(0, $this->assinatura->horas_disponiveis);
    }

    public function test_demanda_sem_plano_ativo(): void
    {
        // Remove a assinatura ativa
        $this->assinatura->update(['status' => 'cancelado']);

        $data = [
            'dominio_id' => $this->dominio->id,
            'titulo' => 'Demanda sem plano',
            'quantidade_horas_tecnicas' => 2,
        ];

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
        ])->postJson('/api/demandas', $data);

        $response->assertStatus(201);

        // 2h * R$100 (sem plano) = R$200
        $response->assertJsonPath('data.valor', '200.00');
    }

    public function test_pode_aprovar_demanda(): void
    {
        $demanda = Demanda::factory()->create([
            'dominio_id' => $this->dominio->id,
            'status' => 'pendente',
        ]);

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
        ])->postJson("/api/demandas/{$demanda->id}/aprovar");

        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'em_andamento');
    }

    public function test_pode_concluir_demanda(): void
    {
        $demanda = Demanda::factory()->create([
            'dominio_id' => $this->dominio->id,
            'status' => 'em_andamento',
        ]);

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
        ])->postJson("/api/demandas/{$demanda->id}/concluir");

        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'concluido');
    }

    public function test_pode_cancelar_demanda(): void
    {
        $demanda = Demanda::factory()->create([
            'dominio_id' => $this->dominio->id,
            'assinatura_id' => $this->assinatura->id,
            'status' => 'pendente',
            'quantidade_horas_tecnicas' => 2,
            'valor' => 0,
        ]);

        // Desconta as horas manualmente para simular
        $this->assinatura->update(['horas_disponiveis' => 4]);

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
        ])->postJson("/api/demandas/{$demanda->id}/cancelar");

        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'cancelado');

        // Verifica se as horas foram estornadas
        $this->assinatura->refresh();
        $this->assertEquals(6, $this->assinatura->horas_disponiveis);
    }
}
