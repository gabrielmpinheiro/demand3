<?php

namespace Tests\Feature;

use App\Models\Cliente;
use App\Models\Dominio;
use App\Models\Vault;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Crypt;
use Tests\TestCase;

class VaultTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected string $token;
    protected Cliente $cliente;
    protected Dominio $dominio;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create([
            'role' => 'admin',
            'status' => 'ativo',
        ]);

        $this->token = $this->admin->createToken('test-token')->plainTextToken;

        $this->cliente = Cliente::factory()->create();
        $this->dominio = Dominio::factory()->create(['cliente_id' => $this->cliente->id]);
    }

    public function test_pode_criar_credencial(): void
    {
        $data = [
            'cliente_id' => $this->cliente->id,
            'dominio_id' => $this->dominio->id,
            'servico' => 'WordPress Admin',
            'login' => 'admin',
            'senha' => 'minhaSenhaSecreta123',
            'url' => 'https://exemplo.com/wp-admin',
        ];

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
        ])->postJson('/api/vault', $data);

        $response->assertStatus(201)
            ->assertJsonPath('data.servico', 'WordPress Admin')
            ->assertJsonPath('data.login', 'admin');

        // Verifica que a senha NÃO está visível no response
        $response->assertJsonMissing(['senha' => 'minhaSenhaSecreta123']);
    }

    public function test_senha_e_criptografada(): void
    {
        $vault = Vault::create([
            'cliente_id' => $this->cliente->id,
            'servico' => 'FTP',
            'login' => 'ftp_user',
            'senha' => 'senhaSecreta',
        ]);

        // Verifica que a senha no banco não é plain text
        $this->assertNotEquals('senhaSecreta', $vault->getRawOriginal('senha'));

        // Verifica que a senha pode ser descriptografada
        $this->assertEquals('senhaSecreta', $vault->senha_decrypted);
    }

    public function test_pode_revelar_senha(): void
    {
        $vault = Vault::create([
            'cliente_id' => $this->cliente->id,
            'servico' => 'SSH',
            'login' => 'root',
            'senha' => 'minhasenhaSSH',
        ]);

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
        ])->getJson("/api/vault/{$vault->id}/revelar-senha");

        $response->assertStatus(200)
            ->assertJsonPath('data.senha', 'minhasenhaSSH');
    }

    public function test_pode_atualizar_credencial_sem_mudar_senha(): void
    {
        $vault = Vault::create([
            'cliente_id' => $this->cliente->id,
            'servico' => 'Hosting',
            'login' => 'hostuser',
            'senha' => 'senhainicial',
        ]);

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$this->token}",
        ])->putJson("/api/vault/{$vault->id}", [
                    'servico' => 'Hosting Atualizado',
                ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.servico', 'Hosting Atualizado');

        // Verifica que a senha não mudou
        $vault->refresh();
        $this->assertEquals('senhainicial', $vault->senha_decrypted);
    }
}
