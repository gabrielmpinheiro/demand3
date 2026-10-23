<?php

namespace App\Http\Controllers\Api\Cliente;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\EmailNotificacaoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class ClienteUserController extends Controller
{
    /**
     * Lista todos os sub-usuários vinculados ao mesmo Cliente do usuário logado.
     * O critério é: users com role='cliente' cujo cliente.id == cliente do autenticado.
     */
    public function index(Request $request): JsonResponse
    {
        $cliente = $request->user()->cliente;

        if (!$cliente) {
            return response()->json(['message' => 'Cliente não encontrado para este usuário.'], 404);
        }

        // Busca todos os Users vinculados ao mesmo Cliente (via clientes.user_id)
        $users = User::where('role', 'cliente')
            ->whereHas('cliente', function ($q) use ($cliente) {
                $q->where('id', $cliente->id);
            })
            ->get(['id', 'name', 'email', 'status', 'created_at']);

        return response()->json([
            'data' => $users,
        ]);
    }

    /**
     * Cria um sub-usuário vinculado ao mesmo Cliente do usuário logado.
     *
     * IMPORTANTE: Sub-usuários SEMPRE recebem role='cliente'.
     * Clientes jamais podem criar usuários com qualquer outro role.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $currentUser = $request->user();
        $cliente = $currentUser->cliente;

        if (!$cliente) {
            return response()->json(['message' => 'Cliente não encontrado para este usuário.'], 404);
        }

        // Garante que o usuário autenticado é, de fato, o "dono" do cliente
        // (i.e., é o user_id principal do registro de cliente)
        if ($cliente->user_id !== $currentUser->id) {
            return response()->json([
                'message' => 'Apenas o titular da conta pode criar sub-usuários.',
            ], 403);
        }

        try {
            $user = DB::transaction(function () use ($validated, $cliente) {
                // Cria o User — role SEMPRE 'cliente', sem exceção
                $user = User::create([
                    'name'     => $validated['name'],
                    'email'    => $validated['email'],
                    'password' => Hash::make($validated['password']),
                    'role'     => 'cliente',   // ← imutável, nunca aceita input externo
                    'status'   => 'ativo',
                ]);

                // Aponta o novo User para o MESMO registro de Cliente existente
                // A relação User → Cliente é 1:1 via clientes.user_id,
                // então criamos um registro "espelho" do cliente para o sub-usuário.
                // Esse registro compartilha o mesmo ID funcional do cliente pai.
                \App\Models\Cliente::create([
                    'user_id' => $user->id,
                    'nome'    => $cliente->nome,   // herda dados do cliente pai
                    'email'   => $cliente->email,
                    // Campos não duplicados; o acesso real aos dados
                    // (domínios, assinaturas) é feito via cliente pai.
                ]);

                return $user;
            });

            $this->log('INFO', 'Sub-usuário criado', [
                'user_id'          => $user->id,
                'owner_cliente_id' => $cliente->id,
            ]);

            // Envia e-mail ao novo sub-usuário com as credenciais de acesso
            try {
                (new EmailNotificacaoService())->novoSubUsuario($user, $validated['password']);
            } catch (\Exception $emailEx) {
                $this->log('WARNING', 'Falha ao enviar e-mail ao sub-usuário', [
                    'user_id' => $user->id,
                    'error'   => $emailEx->getMessage(),
                ]);
            }

            return response()->json([
                'message' => 'Usuário criado com sucesso',
                'data'    => $user->only(['id', 'name', 'email', 'status', 'created_at']),
            ], 201);
        } catch (\Exception $e) {
            $this->log('ERROR', 'Erro ao criar sub-usuário', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Erro ao criar usuário'], 500);
        }
    }

    /**
     * Remove um sub-usuário.
     * O titular não pode remover a si mesmo e só pode remover users do próprio cliente.
     */
    public function destroy(Request $request, User $user): JsonResponse
    {
        $currentUser = $request->user();
        $cliente     = $currentUser->cliente;

        if (!$cliente) {
            return response()->json(['message' => 'Cliente não encontrado.'], 404);
        }

        // Garante que somente o titular da conta executa esta ação
        if ($cliente->user_id !== $currentUser->id) {
            return response()->json([
                'message' => 'Apenas o titular da conta pode remover sub-usuários.',
            ], 403);
        }

        // Não pode remover a si mesmo
        if ($user->id === $currentUser->id) {
            return response()->json([
                'message' => 'Você não pode remover sua própria conta.',
            ], 422);
        }

        // O user alvo deve ter role='cliente' — nunca admins ou outros roles
        if ($user->role !== 'cliente') {
            return response()->json(['message' => 'Acesso negado.'], 403);
        }

        // Verifica se o user alvo está realmente vinculado ao mesmo cliente
        $clienteAlvo = $user->cliente;
        if (!$clienteAlvo || $clienteAlvo->email !== $cliente->email) {
            return response()->json([
                'message' => 'Este usuário não pertence à sua conta.',
            ], 403);
        }

        try {
            DB::transaction(function () use ($user, $clienteAlvo) {
                $user->tokens()->delete();
                if ($clienteAlvo) {
                    $clienteAlvo->delete(); // soft-delete do cliente espelho
                }
                $user->delete();
            });

            $this->log('INFO', 'Sub-usuário removido', ['user_id' => $user->id]);

            return response()->json(['message' => 'Usuário removido com sucesso']);
        } catch (\Exception $e) {
            $this->log('ERROR', 'Erro ao remover sub-usuário', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Erro ao remover usuário'], 500);
        }
    }

    private function log(string $type, string $message, array $data = []): void
    {
        $logPath = storage_path('logs/personal-logs/cliente-users.log');
        $logDir  = dirname($logPath);
        if (!is_dir($logDir)) {
            mkdir($logDir, 0755, true);
        }
        $timestamp = now()->format('Y-m-d H:i:s');
        $logEntry  = "[{$timestamp}] [{$type}] {$message} " . json_encode($data) . PHP_EOL;
        file_put_contents($logPath, $logEntry, FILE_APPEND);
    }
}
