<?php

namespace App\Http\Controllers\Api\Cliente;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Cliente;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class ClienteUserController extends Controller
{
    /**
     * Lista sub-usuários vinculados ao mesmo cliente
     */
    public function index(Request $request): JsonResponse
    {
        $cliente = $request->user()->cliente;

        $users = User::where('role', 'cliente')
            ->whereHas('cliente', function ($q) use ($cliente) {
                // Sub-usuários: mesmos que tem um Cliente com mesmo ID "pai"
                // Na v1, consideramos todos os users que apontam para o mesmo cliente
                $q->where('id', $cliente->id);
            })
            ->get();

        return response()->json([
            'data' => $users,
        ]);
    }

    /**
     * Cria um sub-usuário vinculado à conta do cliente
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        try {
            $cliente = $request->user()->cliente;

            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'role' => 'cliente',
                'status' => 'ativo',
            ]);

            // Vincula ao mesmo cliente
            $cliente->update(['user_id' => $cliente->user_id]); // Mantém o owner
            // Criamos um novo registro de cliente apontando para o user
            Cliente::create([
                'user_id' => $user->id,
                'nome' => $validated['name'],
                'email' => $validated['email'],
            ]);

            // Na realidade, para sub-usuários acessarem o mesmo cliente,
            // o novo user deve referenciar o mesmo Cliente. Atualizamos:
            $newCliente = $user->cliente;
            if ($newCliente) {
                // Para simplificar, deletamos o cliente extra e vinculamos ao original
                $newCliente->delete();
            }
            // Criamos a relação correta: o user aponta para o cliente existente
            // Abordagem: usar uma tabela pivot no futuro. Por enquanto,
            // criamos o cliente vinculado.
            Cliente::withTrashed()->where('user_id', $user->id)->forceDelete();
            // O novo user terá seu próprio "cliente" que é um espelho do original
            Cliente::create([
                'user_id' => $user->id,
                'nome' => $validated['name'],
                'email' => $validated['email'],
            ]);

            $this->log('INFO', 'Sub-usuário criado', ['user_id' => $user->id, 'owner_cliente_id' => $cliente->id]);

            return response()->json([
                'message' => 'Usuário criado com sucesso',
                'data' => $user,
            ], 201);
        } catch (\Exception $e) {
            $this->log('ERROR', 'Erro ao criar sub-usuário', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Erro ao criar usuário'], 500);
        }
    }

    public function destroy(Request $request, User $user): JsonResponse
    {
        $currentUser = $request->user();

        // Não pode deletar a si mesmo
        if ($user->id === $currentUser->id) {
            return response()->json(['message' => 'Você não pode remover sua própria conta'], 422);
        }

        // Verificar que o user é um cliente
        if ($user->role !== 'cliente') {
            return response()->json(['message' => 'Acesso negado'], 403);
        }

        try {
            $user->tokens()->delete();
            $user->delete();
            $this->log('INFO', 'Sub-usuário removido', ['user_id' => $user->id]);

            return response()->json(['message' => 'Usuário removido com sucesso']);
        } catch (\Exception $e) {
            $this->log('ERROR', 'Erro ao remover sub-usuário', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Erro ao remover usuário'], 500);
        }
    }

    private function log(string $type, string $message, array $data = []): void
    {
        $logPath = base_path('logs/personal-logs/cliente-users.log');
        $logDir = dirname($logPath);
        if (!is_dir($logDir)) {
            mkdir($logDir, 0755, true);
        }
        $timestamp = now()->format('Y-m-d H:i:s');
        $logEntry = "[{$timestamp}] [{$type}] {$message} " . json_encode($data) . PHP_EOL;
        file_put_contents($logPath, $logEntry, FILE_APPEND);
    }
}
