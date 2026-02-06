<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Login do usuário
     */
    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $logPath = storage_path('logs/personal-logs');
        if (!file_exists($logPath)) {
            mkdir($logPath, 0777, true);
        }
        $logFile = $logPath . '/login-logs.log';
        $timestamp = now()->toDateTimeString();
        $email = $validated['email'];

        $log = "[$timestamp] Tentativa de login para: $email\n";

        $user = User::where('email', $validated['email'])->first();

        if (!$user) {
            $log .= "[$timestamp] ERRO: Usuário não encontrado no banco de dados.\n";
            file_put_contents($logFile, $log, FILE_APPEND);

            throw ValidationException::withMessages([
                'email' => ['As credenciais fornecidas estão incorretas.'],
            ]);
        }

        $log .= "[$timestamp] Usuário encontrado (ID: {$user->id}, Role: {$user->role}, Status: {$user->status}).\n";
        $log .= "[$timestamp] Hash da senha no banco: {$user->password}\n";

        if (!Hash::check($validated['password'], $user->password)) {
            $log .= "[$timestamp] ERRO: Senha incorreta.\n";
            file_put_contents($logFile, $log, FILE_APPEND);

            throw ValidationException::withMessages([
                'email' => ['As credenciais fornecidas estão incorretas.'],
            ]);
        }

        $log .= "[$timestamp] Senha correta.\n";

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
        $token = $user->createToken('api-token')->plainTextToken;

        $log .= "[$timestamp] SUCESSO: Login realizado, token gerado.\n----------------------------------------\n";
        file_put_contents($logFile, $log, FILE_APPEND);

        return response()->json([
            'message' => 'Login realizado com sucesso',
            'data' => [
                'user' => $user,
                'token' => $token,
            ],
        ]);
    }

    /**
     * Logout do usuário
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logout realizado com sucesso',
        ]);
    }

    /**
     * Retorna o usuário autenticado
     */
    public function user(Request $request): JsonResponse
    {
        return response()->json([
            'data' => $request->user(),
        ]);
    }

    /**
     * Registro de novo usuário (apenas admins podem criar)
     */
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'nullable|in:admin,user',
        ]);

        $validated['password'] = Hash::make($validated['password']);

        $user = User::create($validated);

        return response()->json([
            'message' => 'Usuário criado com sucesso',
            'data' => $user,
        ], 201);
    }

    /**
     * Atualiza senha do usuário
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
}
