<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Vault;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VaultController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Vault::query();

        if ($request->has('cliente_id')) {
            $query->where('cliente_id', $request->cliente_id);
        }

        if ($request->has('dominio_id')) {
            $query->where('dominio_id', $request->dominio_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('servico', 'like', "%{$search}%")
                    ->orWhere('login', 'like', "%{$search}%")
                    ->orWhere('url', 'like', "%{$search}%");
            });
        }

        $vaults = $query->with(['cliente', 'dominio'])
            ->orderBy('servico')
            ->paginate($request->get('per_page', 15));

        return response()->json($vaults);
    }

    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'cliente_id' => 'required|exists:clientes,id',
                'dominio_id' => 'nullable|exists:dominios,id',
                'servico' => 'required|string|max:255',
                'login' => 'required|string|max:255',
                'senha' => 'required|string|max:255',
                'url' => 'nullable|url|max:255',
                'notas' => 'nullable|string',
                'status' => 'nullable|in:ativo,inativo,cancelado',
            ]);

            $vault = Vault::create($validated);

            $this->log('INFO', 'Credencial criada com sucesso', ['id' => $vault->id, 'servico' => $vault->servico]);

            return response()->json([
                'message' => 'Credencial criada com sucesso',
                'data' => $vault->load(['cliente', 'dominio']),
            ], 201);
        } catch (\Exception $e) {
            $this->log('ERROR', 'Erro ao criar credencial', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Erro ao criar credencial: ' . $e->getMessage()], 500);
        }
    }

    public function show(Vault $vault): JsonResponse
    {
        return response()->json([
            'data' => $vault->load(['cliente', 'dominio']),
        ]);
    }

    public function update(Request $request, Vault $vault): JsonResponse
    {
        try {
            $validated = $request->validate([
                'cliente_id' => 'sometimes|required|exists:clientes,id',
                'dominio_id' => 'nullable|exists:dominios,id',
                'servico' => 'sometimes|required|string|max:255',
                'login' => 'sometimes|required|string|max:255',
                'senha' => 'nullable|string|max:255',
                'url' => 'nullable|url|max:255',
                'notas' => 'nullable|string',
                'status' => 'nullable|in:ativo,inativo,cancelado',
            ]);

            // Remove senha vazia para não sobrescrever
            if (empty($validated['senha'])) {
                unset($validated['senha']);
            }

            $vault->update($validated);

            $this->log('INFO', 'Credencial atualizada com sucesso', ['id' => $vault->id, 'servico' => $vault->servico]);

            return response()->json([
                'message' => 'Credencial atualizada com sucesso',
                'data' => $vault->fresh()->load(['cliente', 'dominio']),
            ]);
        } catch (\Exception $e) {
            $this->log('ERROR', 'Erro ao atualizar credencial', ['id' => $vault->id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Erro ao atualizar credencial'], 500);
        }
    }

    public function destroy(Vault $vault): JsonResponse
    {
        try {
            $vault->delete();

            $this->log('INFO', 'Credencial excluída com sucesso', ['id' => $vault->id, 'servico' => $vault->servico]);

            return response()->json([
                'message' => 'Credencial excluída com sucesso',
            ]);
        } catch (\Exception $e) {
            $this->log('ERROR', 'Erro ao excluir credencial', ['id' => $vault->id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Erro ao excluir credencial'], 500);
        }
    }

    /**
     * Revela a senha descriptografada (apenas para admins)
     */
    public function revelarSenha(Vault $vault): JsonResponse
    {
        // Aqui você pode adicionar verificação de permissão
        // if (!auth()->user()->isAdmin()) { ... }

        return response()->json([
            'data' => [
                'id' => $vault->id,
                'servico' => $vault->servico,
                'login' => $vault->login,
                'senha' => $vault->revelarSenha(),
                'url' => $vault->url,
            ],
        ]);
    }

    /**
     * Registra logs personalizados para o módulo vault
     */
    private function log(string $type, string $message, array $data = []): void
    {
        $logPath = base_path('logs/personal-logs/vault.log');
        $logDir = dirname($logPath);

        if (!is_dir($logDir)) {
            mkdir($logDir, 0755, true);
        }

        $timestamp = now()->format('Y-m-d H:i:s');
        $logEntry = "[{$timestamp}] [{$type}] {$message} " . json_encode($data) . PHP_EOL;

        file_put_contents($logPath, $logEntry, FILE_APPEND);
    }
}

