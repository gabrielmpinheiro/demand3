<?php

namespace App\Http\Controllers\Api\Cliente;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Cliente;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class ClienteAuthController extends Controller
{
    /**
     * Login do cliente
     */
    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $logPath = base_path('logs/personal-logs');
        if (!file_exists($logPath)) {
            mkdir($logPath, 0777, true);
        }
        $logFile = $logPath . '/cliente-login.log';
        $timestamp = now()->toDateTimeString();
        $email = $validated['email'];

        $log = "[$timestamp] Tentativa de login cliente: $email\n";

        $user = User::where('email', $validated['email'])->first();

        if (!$user) {
            $log .= "[$timestamp] ERRO: Usuário não encontrado.\n";
            file_put_contents($logFile, $log, FILE_APPEND);

            throw ValidationException::withMessages([
                'email' => ['As credenciais fornecidas estão incorretas.'],
            ]);
        }

        // Apenas clientes podem fazer login aqui
        if ($user->role !== 'cliente') {
            $log .= "[$timestamp] ERRO: Usuário não é cliente (role: {$user->role}).\n";
            file_put_contents($logFile, $log, FILE_APPEND);

            throw ValidationException::withMessages([
                'email' => ['As credenciais fornecidas estão incorretas.'],
            ]);
        }

        if (!Hash::check($validated['password'], $user->password)) {
            $log .= "[$timestamp] ERRO: Senha incorreta.\n";
            file_put_contents($logFile, $log, FILE_APPEND);

            throw ValidationException::withMessages([
                'email' => ['As credenciais fornecidas estão incorretas.'],
            ]);
        }

        if ($user->status !== 'ativo') {
            $log .= "[$timestamp] ERRO: Usuário com status '{$user->status}'.\n";
            file_put_contents($logFile, $log, FILE_APPEND);

            throw ValidationException::withMessages([
                'email' => ['Esta conta está desativada.'],
            ]);
        }

        // Revoga tokens anteriores
        $user->tokens()->delete();

        // Cria novo token
        $token = $user->createToken('client-api-token')->plainTextToken;

        $log .= "[$timestamp] SUCESSO: Login cliente realizado.\n----------------------------------------\n";
        file_put_contents($logFile, $log, FILE_APPEND);

        return response()->json([
            'message' => 'Login realizado com sucesso',
            'data' => [
                'user' => $user->load('cliente'),
                'token' => $token,
            ],
        ]);
    }

    /**
     * Registro de novo cliente
     */
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'telefone' => 'nullable|string|max:20',
            'cpf' => 'nullable|string|max:14',
            'cnpj' => 'nullable|string|max:18',
        ]);

        try {
            // Cria o usuário com role cliente
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'role' => 'cliente',
                'status' => 'ativo',
            ]);

            // Cria o registro de cliente vinculado
            $cliente = Cliente::create([
                'user_id' => $user->id,
                'nome' => $validated['name'],
                'email' => $validated['email'],
                'telefone' => $validated['telefone'] ?? null,
                'cpf' => $validated['cpf'] ?? null,
                'cnpj' => $validated['cnpj'] ?? null,
            ]);

            $token = $user->createToken('client-api-token')->plainTextToken;

            $this->log('INFO', 'Novo cliente registrado', ['user_id' => $user->id, 'cliente_id' => $cliente->id]);

            return response()->json([
                'message' => 'Conta criada com sucesso',
                'data' => [
                    'user' => $user->load('cliente'),
                    'token' => $token,
                ],
            ], 201);
        } catch (\Exception $e) {
            $this->log('ERROR', 'Erro ao registrar cliente', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Erro ao criar conta: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Logout do cliente
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logout realizado com sucesso',
        ]);
    }

    /**
     * Retorna o usuário/cliente autenticado
     */
    public function user(Request $request): JsonResponse
    {
        return response()->json([
            'data' => $request->user()->load('cliente'),
        ]);
    }

    /**
     * Atualiza perfil do cliente
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'telefone' => 'nullable|string|max:20',
            'endereco' => 'nullable|string|max:255',
            'cidade' => 'nullable|string|max:255',
            'estado' => 'nullable|string|max:2',
            'cep' => 'nullable|string|max:9',
            'cpf' => 'nullable|string|max:14',
            'cnpj' => 'nullable|string|max:18',
        ]);

        try {
            $user = $request->user();
            $cliente = $user->cliente;

            if (isset($validated['name'])) {
                $user->name = $validated['name'];
                $user->save();
                $validated['nome'] = $validated['name'];
                unset($validated['name']);
            }

            if ($cliente) {
                $cliente->update($validated);
            }

            $this->log('INFO', 'Perfil atualizado', ['user_id' => $user->id]);

            return response()->json([
                'message' => 'Perfil atualizado com sucesso',
                'data' => $user->fresh()->load('cliente'),
            ]);
        } catch (\Exception $e) {
            $this->log('ERROR', 'Erro ao atualizar perfil', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Erro ao atualizar perfil'], 500);
        }
    }

    /**
     * Atualiza senha do cliente
     */
    public function updatePassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'current_password' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = $request->user();

        if (!Hash::check($validated['current_password'], $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['A senha atual está incorreta.'],
            ]);
        }

        $user->password = Hash::make($validated['password']);
        $user->save();

        return response()->json([
            'message' => 'Senha atualizada com sucesso',
        ]);
    }

    private function log(string $type, string $message, array $data = []): void
    {
        $logPath = base_path('logs/personal-logs/cliente-auth.log');
        $logDir = dirname($logPath);
        if (!is_dir($logDir)) {
            mkdir($logDir, 0755, true);
        }
        $timestamp = now()->format('Y-m-d H:i:s');
        $logEntry = "[{$timestamp}] [{$type}] {$message} " . json_encode($data) . PHP_EOL;
        file_put_contents($logPath, $logEntry, FILE_APPEND);
    }
}
