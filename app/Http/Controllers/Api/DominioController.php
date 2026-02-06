<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Dominio;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class DominioController extends Controller
{
    private function logDomainAction(string $level, string $action, array $data, string $message): void
    {
        $logPath = storage_path('logs/personal-logs/clientes.log');
        $logDir = dirname($logPath);

        if (!file_exists($logDir)) {
            mkdir($logDir, 0755, true);
        }

        $timestamp = now()->format('Y-m-d H:i:s');
        $dataStr = json_encode($data, JSON_UNESCAPED_UNICODE);
        $logMessage = "[{$timestamp}] {$level} [{$action}] Domínio: {$dataStr} | Message: {$message}\n";

        file_put_contents($logPath, $logMessage, FILE_APPEND);
    }

    public function index(Request $request): JsonResponse
    {
        try {
            $query = Dominio::query();

            if ($request->has('cliente_id')) {
                $query->where('cliente_id', $request->cliente_id);
            }

            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            if ($request->has('search')) {
                $query->where('nome', 'like', "%{$request->search}%");
            }

            $dominios = $query->with(['cliente', 'assinatura.plano'])
                ->orderBy('nome')
                ->paginate($request->get('per_page', 15));

            $this->logDomainAction('INFO', 'LIST', [
                'count' => $dominios->total(),
                'cliente_id' => $request->cliente_id ?? 'all'
            ], 'Domínios listados com sucesso');

            return response()->json($dominios);
        } catch (\Exception $e) {
            $this->logDomainAction('ERROR', 'LIST', [], 'Erro ao listar domínios: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erro ao listar domínios',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'cliente_id' => 'required|exists:clientes,id',
                'nome' => 'required|string|max:255|unique:dominios,nome',
                'status' => 'nullable|in:ativo,inativo,cancelado',
            ]);

            $dominio = Dominio::create($validated);

            $this->logDomainAction('INFO', 'CREATE', [
                'id' => $dominio->id,
                'nome' => $dominio->nome,
                'cliente_id' => $dominio->cliente_id
            ], 'Domínio criado com sucesso');

            return response()->json([
                'message' => 'Domínio criado com sucesso',
                'data' => $dominio->load(['cliente', 'assinatura.plano']),
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            $this->logDomainAction('ERROR', 'CREATE', [
                'nome' => $request->nome ?? 'N/A'
            ], 'Validação falhou: ' . json_encode($e->errors()));
            throw $e;
        } catch (\Exception $e) {
            $this->logDomainAction('ERROR', 'CREATE', [
                'nome' => $request->nome ?? 'N/A'
            ], 'Erro ao criar domínio: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erro ao criar domínio',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show(Dominio $dominio): JsonResponse
    {
        try {
            $this->logDomainAction('INFO', 'SHOW', [
                'id' => $dominio->id,
                'nome' => $dominio->nome
            ], 'Domínio visualizado com sucesso');

            return response()->json([
                'data' => $dominio->load([
                    'cliente',
                    'assinatura.plano',
                    'demandas',
                    'vaults',
                ]),
            ]);
        } catch (\Exception $e) {
            $this->logDomainAction('ERROR', 'SHOW', [
                'id' => $dominio->id ?? 'N/A'
            ], 'Erro ao visualizar domínio: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erro ao visualizar domínio',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, Dominio $dominio): JsonResponse
    {
        try {
            $validated = $request->validate([
                'cliente_id' => 'sometimes|required|exists:clientes,id',
                'nome' => ['sometimes', 'required', 'string', 'max:255', Rule::unique('dominios')->ignore($dominio->id)],
                'status' => 'nullable|in:ativo,inativo,cancelado',
            ]);

            $dominio->update($validated);

            $this->logDomainAction('INFO', 'UPDATE', [
                'id' => $dominio->id,
                'nome' => $dominio->nome,
                'cliente_id' => $dominio->cliente_id
            ], 'Domínio atualizado com sucesso');

            return response()->json([
                'message' => 'Domínio atualizado com sucesso',
                'data' => $dominio->fresh()->load(['cliente', 'assinatura.plano']),
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            $this->logDomainAction('ERROR', 'UPDATE', [
                'id' => $dominio->id
            ], 'Validação falhou: ' . json_encode($e->errors()));
            throw $e;
        } catch (\Exception $e) {
            $this->logDomainAction('ERROR', 'UPDATE', [
                'id' => $dominio->id
            ], 'Erro ao atualizar domínio: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erro ao atualizar domínio',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy(Dominio $dominio): JsonResponse
    {
        try {
            // Verificar se há assinatura ativa antes de excluir
            $dominio->load('assinatura');

            if ($dominio->assinatura) {
                $this->logDomainAction('WARNING', 'DELETE_BLOCKED', [
                    'id' => $dominio->id,
                    'nome' => $dominio->nome,
                    'assinatura_id' => $dominio->assinatura->id
                ], 'Tentativa de excluir domínio com assinatura ativa bloqueada');

                return response()->json([
                    'message' => 'Não é possível excluir domínio com assinatura ativa. Cancele a assinatura primeiro.',
                ], 422);
            }

            $dominioData = [
                'id' => $dominio->id,
                'nome' => $dominio->nome,
                'cliente_id' => $dominio->cliente_id
            ];

            $dominio->delete();

            $this->logDomainAction('INFO', 'DELETE', $dominioData, 'Domínio excluído com sucesso');

            return response()->json([
                'message' => 'Domínio excluído com sucesso',
            ]);
        } catch (\Exception $e) {
            $this->logDomainAction('ERROR', 'DELETE', [
                'id' => $dominio->id ?? 'N/A'
            ], 'Erro ao excluir domínio: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erro ao excluir domínio',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
