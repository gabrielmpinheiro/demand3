<?php

namespace Tests\Feature;

use App\Models\Assinatura;
use App\Models\Cliente;
use App\Models\Dominio;
use App\Models\Pagamento;
use App\Models\Plano;
use App\Models\Suporte;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class NotificacaoTriggerTest extends TestCase
{
    use RefreshDatabase;

    protected $admin;
    protected $client;
    protected $plano;
    protected $dominio;

    protected function setUp(): void
    {
        parent::setUp();
        // Create an admin user to receive notifications
        $this->admin = User::factory()->create([
            'role' => 'admin',
            'status' => 'ativo'
        ]);

        $this->client = Cliente::factory()->create();
        $this->plano = Plano::factory()->create();
        $this->dominio = Dominio::factory()->create(['cliente_id' => $this->client->id]);
    }

    public function test_creates_notification_on_new_support()
    {
        $data = [
            'cliente_id' => $this->client->id,
            'mensagem' => 'Problem with server',
            'status' => 'aberto',
        ];

        // Act as admin (or any user who can create support)
        // SuporteController::store calls Notificacao::notificarAdmins
        $this->actingAs($this->admin)->postJson('/api/suportes', $data);

        $this->assertDatabaseHas('notificacoes', [
            'user_id' => $this->admin->id,
            'cliente_id' => $this->client->id,
            'titulo' => 'Novo Suporte',
            'tipo' => 'info'
        ]);
    }

    public function test_creates_notification_on_support_conclusion()
    {
        $suporte = Suporte::factory()->create(['cliente_id' => $this->client->id, 'status' => 'aberto']);

        $data = [
            'status' => 'concluido',
        ];

        // SuporteController::update
        $this->actingAs($this->admin)->putJson("/api/suportes/{$suporte->id}", $data);

        $this->assertDatabaseHas('notificacoes', [
            'user_id' => $this->admin->id,
            'cliente_id' => $this->client->id,
            'titulo' => 'Suporte Concluído',
            'tipo' => 'info'
        ]);
    }

    public function test_creates_notification_on_new_client()
    {
        $data = [
            'nome' => 'New Client',
            'email' => 'newclient@example.com',
        ];

        // ClienteController::store
        $this->actingAs($this->admin)->postJson('/api/clientes', $data);

        $client = Cliente::where('email', 'newclient@example.com')->first();

        $this->assertDatabaseHas('notificacoes', [
            'user_id' => $this->admin->id,
            'cliente_id' => $client->id,
            'titulo' => 'Novo Cliente',
            'tipo' => 'info'
        ]);
    }

    public function test_creates_notification_on_new_subscription()
    {
        $plano = Plano::factory()->create();
        $dominio = Dominio::factory()->create(['cliente_id' => $this->client->id]);

        $data = [
            'cliente_id' => $this->client->id,
            'dominio_id' => $dominio->id,
            'plano_id' => $plano->id,
            'status' => 'ativo',
            'data_inicio' => now()->format('Y-m-d'),
        ];

        // AssinaturaController::store
        $this->actingAs($this->admin)->postJson('/api/assinaturas', $data);

        $this->assertDatabaseHas('notificacoes', [
            'user_id' => $this->admin->id,
            'cliente_id' => $this->client->id,
            'titulo' => 'Nova Assinatura',
            'tipo' => 'info'
        ]);
    }

    public function test_creates_notification_on_payment_confirmation_via_update()
    {
        $assinatura = Assinatura::factory()->create([
            'cliente_id' => $this->client->id,
            'dominio_id' => $this->dominio->id,
            'plano_id' => $this->plano->id
        ]);

        // Debug: check if payment exists before
        $this->assertEquals(0, Pagamento::count(), 'Pagamentos exists before creation!');

        $pagamento = Pagamento::create([
            'cliente_id' => $this->client->id,
            'assinatura_id' => $assinatura->id,
            'status' => 'aberto',
            'valor' => 100.00,
            'referencia_mes' => '2090-01',
            'descricao' => 'Test Payment'
        ]);

        $this->assertEquals(1, Pagamento::count(), 'More than 1 payment created!');

        $data = [
            'status' => 'pago',
            'data_pagamento' => now()->format('Y-m-d')
        ];

        // PagamentoController::update
        $this->actingAs($this->admin)->putJson("/api/pagamentos/{$pagamento->id}", $data);

        $this->assertDatabaseHas('notificacoes', [
            'user_id' => $this->admin->id,
            'cliente_id' => $this->client->id,
            'titulo' => 'Pagamento Confirmado',
            'tipo' => 'pagamento'
        ]);
    }

    public function test_creates_notification_on_payment_confirmation_via_marcar_pago()
    {
        $assinatura = Assinatura::factory()->create([
            'cliente_id' => $this->client->id,
            'dominio_id' => $this->dominio->id,
            'plano_id' => $this->plano->id
        ]);

        $pagamento = Pagamento::create([
            'cliente_id' => $this->client->id,
            'assinatura_id' => $assinatura->id,
            'status' => 'aberto',
            'valor' => 100.00,
            'referencia_mes' => '2090-02',
            'descricao' => 'Test Payment 2'
        ]);

        // PagamentoController::marcarPago
        $this->actingAs($this->admin)->postJson("/api/pagamentos/{$pagamento->id}/marcar-pago");

        $this->assertDatabaseHas('notificacoes', [
            'user_id' => $this->admin->id,
            'cliente_id' => $this->client->id,
            'titulo' => 'Pagamento Confirmado',
            'tipo' => 'pagamento'
        ]);
    }
}
