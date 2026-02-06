<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    private function logUserAction(string $level, string $action, array $data, string $message): void
    {
        $logPath = storage_path('logs/personal-logs/usuarios.log');
        $logDir = dirname($logPath);

        if (!file_exists($logDir)) {
            mkdir($logDir, 0755, true);
        }

        $timestamp = now()->format('Y-m-d H:i:s');
        $dataStr = json_encode($data, JSON_UNESCAPED_UNICODE);
        $logMessage = "[{$timestamp}] {$level} [{$action}] User: {$dataStr} | Message: {$message}\n";

        file_put_contents($logPath, $logMessage, FILE_APPEND);
    }

    public function index(Request $request): JsonResponse
    {
        try {
            $query = User::query();

            // Filtro por status
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            // Filtro por role
            if ($request->has('role')) {
                $query->where('role', $request->role);
            }

            // Busca por nome ou email
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            }

            $users = $query->orderBy('name')
                ->paginate($request->get('per_page', 15));

            $this->logUserAction('INFO', 'LIST', ['count' => $users->total()], 'Usuários listados com sucesso');

            return response()->json($users);
        } catch (\Exception $e) {
            $this->logUserAction('ERROR', 'LIST', [], 'Erro ao listar usuários: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erro ao listar usuários',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email',
                'password' => 'required|string|min:8',
                'role' => 'nullable|in:admin,user',
                'status' => 'nullable|in:ativo,inativo,cancelado',
            ]);

            $validated['password'] = Hash::make($validated['password']);
            $validated['role'] = $validated['role'] ?? 'user';
            $validated['status'] = $validated['status'] ?? 'ativo';

            $user = User::create($validated);

            $this->logUserAction('INFO', 'CREATE', [
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role
            ], 'Usuário criado com sucesso');

            return response()->json([
                'message' => 'Usuário criado com sucesso',
                'data' => $user,
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            $this->logUserAction('ERROR', 'CREATE', [
                'email' => $request->email ?? 'N/A'
            ], 'Validação falhou: ' . json_encode($e->errors()));

            throw $e;
        } catch (\Exception $e) {
            $this->logUserAction('ERROR', 'CREATE', [
                'email' => $request->email ?? 'N/A'
            ], 'Erro ao criar usuário: ' . $e->getMessage());

            return response()->json([
                'message' => 'Erro ao criar usuário',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show(User $user): JsonResponse
    {
        try {
            $this->logUserAction('INFO', 'SHOW', [
                'id' => $user->id,
                'name' => $user->name
            ], 'Usuário visualizado com sucesso');

            return response()->json([
                'data' => $user,
            ]);
        } catch (\Exception $e) {
            $this->logUserAction('ERROR', 'SHOW', [
                'id' => $user->id ?? 'N/A'
            ], 'Erro ao visualizar usuário: ' . $e->getMessage());

            return response()->json([
                'message' => 'Erro ao visualizar usuário',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, User $user): JsonResponse
    {
        try {
            $validated = $request->validate([
                'name' => 'sometimes|required|string|max:255',
                'email' => ['sometimes', 'required', 'email', Rule::unique('users')->ignore($user->id)],
                'password' => 'sometimes|nullable|string|min:8',
                'role' => 'sometimes|in:admin,user',
                'status' => 'sometimes|in:ativo,inativo,cancelado',
            ]);

            // Se a senha foi fornecida, fazer hash
            if (isset($validated['password']) && !empty($validated['password'])) {
                $validated['password'] = Hash::make($validated['password']);
            } else {
                // Remove password se estiver vazio para não atualizar
                unset($validated['password']);
            }

            $user->update($validated);

            $this->logUserAction('INFO', 'UPDATE', [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email
            ], 'Usuário atualizado com sucesso');

            return response()->json([
                'message' => 'Usuário atualizado com sucesso',
                'data' => $user->fresh(),
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            $this->logUserAction('ERROR', 'UPDATE', [
                'id' => $user->id,
                'email' => $request->email ?? 'N/A'
            ], 'Validação falhou: ' . json_encode($e->errors()));

            throw $e;
        } catch (\Exception $e) {
            $this->logUserAction('ERROR', 'UPDATE', [
                'id' => $user->id
            ], 'Erro ao atualizar usuário: ' . $e->getMessage());

            return response()->json([
                'message' => 'Erro ao atualizar usuário',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy(User $user): JsonResponse
    {
        try {
            $userData = [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email
            ];

            $user->delete();

            $this->logUserAction('INFO', 'DELETE', $userData, 'Usuário excluído com sucesso');

            return response()->json([
                'message' => 'Usuário excluído com sucesso',
            ]);
        } catch (\Exception $e) {
            $this->logUserAction('ERROR', 'DELETE', [
                'id' => $user->id ?? 'N/A'
            ], 'Erro ao excluir usuário: ' . $e->getMessage());

            return response()->json([
                'message' => 'Erro ao excluir usuário',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
