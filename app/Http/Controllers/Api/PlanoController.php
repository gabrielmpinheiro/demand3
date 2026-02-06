<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Plano;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class PlanoController extends Controller
{
    private function logPlanAction(string $level, string $action, array $data, string $message): void
    {
        $logPath = storage_path('logs/personal-logs/Planos.log');
        $logDir = dirname($logPath);

        if (!file_exists($logDir)) {
            mkdir($logDir, 0755, true);
        }

        $timestamp = now()->format('Y-m-d H:i:s');
        $dataStr = json_encode($data, JSON_UNESCAPED_UNICODE);
        $logMessage = "[{$timestamp}] {$level} [{$action}] Plano: {$dataStr} | Message: {$message}\n";

        file_put_contents($logPath, $logMessage, FILE_APPEND);
    }

    public function index(Request $request): JsonResponse
    {
        try {
            $query = Plano::query();

            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            if ($request->has('search')) {
                $query->where('nome', 'like', "%{$request->search}%");
            }

            $planos = $query->withCount([
                'assinaturas' => function ($q) {
                    $q->where('status', 'ativo');
                }
            ])
                ->orderBy('preco')
                ->paginate($request->get('per_page', 15));

            $this->logPlanAction('INFO', 'LIST', ['count' => $planos->total()], 'Planos listados com sucesso');

            return response()->json($planos);
        } catch (\Exception $e) {
            $this->logPlanAction('ERROR', 'LIST', [], 'Erro ao listar planos: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erro ao listar planos',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'nome' => 'required|string|max:255',
                'descricao' => 'nullable|string',
                'preco' => 'required|numeric|min:0',
                'limite_horas_tecnicas' => 'required|integer|min:0',
                'valor_hora' => 'nullable|numeric|min:0',
                'status' => 'nullable|in:ativo,inativo,cancelado',
            ]);

            if (!isset($validated['valor_hora'])) {
                $validated['valor_hora'] = 50.00;
            }

            $plano = Plano::create($validated);

            $this->logPlanAction('INFO', 'CREATE', [
                'id' => $plano->id,
                'nome' => $plano->nome,
                'preco' => $plano->preco
            ], 'Plano criado com sucesso');

            return response()->json([
                'message' => 'Plano criado com sucesso',
                'data' => $plano,
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            $this->logPlanAction('ERROR', 'CREATE', [
                'nome' => $request->nome ?? 'N/A'
            ], 'Validação falhou: ' . json_encode($e->errors()));
            throw $e;
        } catch (\Exception $e) {
            $this->logPlanAction('ERROR', 'CREATE', [
                'nome' => $request->nome ?? 'N/A'
            ], 'Erro ao criar plano: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erro ao criar plano',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show(Plano $plano): JsonResponse
    {
        try {
            $this->logPlanAction('INFO', 'SHOW', [
                'id' => $plano->id,
                'nome' => $plano->nome
            ], 'Plano visualizado com sucesso');

            return response()->json([
                'data' => $plano->load('assinaturas.cliente'),
            ]);
        } catch (\Exception $e) {
            $this->logPlanAction('ERROR', 'SHOW', [
                'id' => $plano->id ?? 'N/A'
            ], 'Erro ao visualizar plano: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erro ao visualizar plano',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, Plano $plano): JsonResponse
    {
        try {
            $validated = $request->validate([
                'nome' => 'sometimes|required|string|max:255',
                'descricao' => 'nullable|string',
                'preco' => 'sometimes|required|numeric|min:0',
                'limite_horas_tecnicas' => 'sometimes|required|integer|min:0',
                'valor_hora' => 'nullable|numeric|min:0',
                'status' => 'nullable|in:ativo,inativo,cancelado',
            ]);

            $plano->update($validated);

            $this->logPlanAction('INFO', 'UPDATE', [
                'id' => $plano->id,
                'nome' => $plano->nome,
                'preco' => $plano->preco
            ], 'Plano atualizado com sucesso');

            return response()->json([
                'message' => 'Plano atualizado com sucesso',
                'data' => $plano->fresh(),
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            $this->logPlanAction('ERROR', 'UPDATE', [
                'id' => $plano->id
            ], 'Validação falhou: ' . json_encode($e->errors()));
            throw $e;
        } catch (\Exception $e) {
            $this->logPlanAction('ERROR', 'UPDATE', [
                'id' => $plano->id
            ], 'Erro ao atualizar plano: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erro ao atualizar plano',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy(Plano $plano): JsonResponse
    {
        try {
            // Verificar se há assinaturas ativas
            $assinaturasAtivas = $plano->assinaturas()->where('status', 'ativo')->count();

            if ($assinaturasAtivas > 0) {
                $this->logPlanAction('WARNING', 'DELETE_BLOCKED', [
                    'id' => $plano->id,
                    'nome' => $plano->nome,
                    'assinaturas_ativas' => $assinaturasAtivas
                ], 'Tentativa de excluir plano com assinaturas ativas bloqueada');

                return response()->json([
                    'message' => "Não é possível excluir plano com {$assinaturasAtivas} assinatura(s) ativa(s). Cancele as assinaturas primeiro.",
                ], 422);
            }

            $planoData = [
                'id' => $plano->id,
                'nome' => $plano->nome,
                'preco' => $plano->preco
            ];

            $plano->delete();

            $this->logPlanAction('INFO', 'DELETE', $planoData, 'Plano excluído com sucesso');

            return response()->json([
                'message' => 'Plano excluído com sucesso',
            ]);
        } catch (\Exception $e) {
            $this->logPlanAction('ERROR', 'DELETE', [
                'id' => $plano->id ?? 'N/A'
            ], 'Erro ao excluir plano: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erro ao excluir plano',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
