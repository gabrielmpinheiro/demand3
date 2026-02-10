<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Assinatura;
use App\Models\Pagamento;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AssinaturaController extends Controller
{
    private function logSubscriptionAction(string $level, string $action, array $data, string $message): void
    {
        $logPath = storage_path('logs/personal-logs/assinaturas.log');
        $logDir = dirname($logPath);

        if (!file_exists($logDir)) {
            mkdir($logDir, 0755, true);
        }

        $timestamp = now()->format('Y-m-d H:i:s');
        $dataStr = json_encode($data, JSON_UNESCAPED_UNICODE);
        $logMessage = "[{$timestamp}] {$level} [{$action}] Assinatura: {$dataStr} | Message: {$message}\n";

        file_put_contents($logPath, $logMessage, FILE_APPEND);
    }

    public function index(Request $request): JsonResponse
    {
        try {
            $query = Assinatura::query();

            if ($request->has('cliente_id')) {
                $query->where('cliente_id', $request->cliente_id);
            }

            if ($request->has('dominio_id')) {
                $query->where('dominio_id', $request->dominio_id);
            }

            if ($request->has('plano_id')) {
                $query->where('plano_id', $request->plano_id);
            }

            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            if ($request->has('search')) {
                $search = $request->search;
                $query->whereHas('cliente', function ($q) use ($search) {
                    $q->where('nome', 'like', "%{$search}%");
                })->orWhereHas('dominio', function ($q) use ($search) {
                    $q->where('nome', 'like', "%{$search}%");
                });
            }

            $assinaturas = $query->with(['cliente', 'dominio', 'plano'])
                ->withCount([
                    'pagamentos as pagamentos_em_atraso_count' => function ($q) {
                        $q->where('status', 'aberto')
                            ->whereDate('data_vencimento', '<', now());
                    }
                ])
                ->orderBy('created_at', 'desc')
                ->paginate($request->get('per_page', 15));

            $this->logSubscriptionAction('INFO', 'LIST', ['count' => $assinaturas->total()], 'Assinaturas listadas com sucesso');

            return response()->json($assinaturas);
        } catch (\Exception $e) {
            $this->logSubscriptionAction('ERROR', 'LIST', [], 'Erro ao listar assinaturas: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erro ao listar assinaturas',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'cliente_id' => 'required|exists:clientes,id',
                'dominio_id' => 'required|exists:dominios,id|unique:assinaturas,dominio_id,NULL,id,deleted_at,NULL',
                'plano_id' => 'required|exists:planos,id',
                'status' => 'nullable|in:ativo,inativo,cancelado',
                'data_inicio' => 'nullable|date',
                'data_fim' => 'nullable|date|after:data_inicio',
            ]);

            // Define horas disponíveis baseado no plano
            $plano = \App\Models\Plano::find($validated['plano_id']);
            $validated['horas_disponiveis'] = $plano->limite_horas_tecnicas;
            $validated['data_inicio'] = $validated['data_inicio'] ?? now();

            $assinatura = Assinatura::create($validated);

            $this->logSubscriptionAction('INFO', 'CREATE', [
                'id' => $assinatura->id,
                'cliente_id' => $assinatura->cliente_id,
                'dominio_id' => $assinatura->dominio_id,
                'plano_id' => $assinatura->plano_id
            ], 'Assinatura criada com sucesso');

            \App\Models\Notificacao::notificarAdmins(
                'Nova Assinatura',
                "Uma nova assinatura do plano {$assinatura->plano->nome} foi criada para o cliente {$assinatura->cliente->nome}",
                null,
                $assinatura->cliente_id,
                'info'
            );

            return response()->json([
                'message' => 'Assinatura criada com sucesso',
                'data' => $assinatura->load(['cliente', 'dominio', 'plano']),
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            $this->logSubscriptionAction('ERROR', 'CREATE', [
                'cliente_id' => $request->cliente_id ?? 'N/A',
                'dominio_id' => $request->dominio_id ?? 'N/A'
            ], 'Validação falhou: ' . json_encode($e->errors()));
            throw $e;
        } catch (\Exception $e) {
            $this->logSubscriptionAction('ERROR', 'CREATE', [
                'cliente_id' => $request->cliente_id ?? 'N/A'
            ], 'Erro ao criar assinatura: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erro ao criar assinatura',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show(Assinatura $assinatura): JsonResponse
    {
        try {
            $this->logSubscriptionAction('INFO', 'SHOW', [
                'id' => $assinatura->id
            ], 'Assinatura visualizada com sucesso');

            return response()->json([
                'data' => $assinatura->load([
                    'cliente',
                    'dominio',
                    'plano',
                    'demandas',
                    'pagamentos',
                ]),
            ]);
        } catch (\Exception $e) {
            $this->logSubscriptionAction('ERROR', 'SHOW', [
                'id' => $assinatura->id ?? 'N/A'
            ], 'Erro ao visualizar assinatura: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erro ao visualizar assinatura',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, Assinatura $assinatura): JsonResponse
    {
        try {
            $validated = $request->validate([
                'cliente_id' => 'sometimes|required|exists:clientes,id',
                'dominio_id' => 'sometimes|required|exists:dominios,id',
                'plano_id' => 'sometimes|required|exists:planos,id',
                'horas_disponiveis' => 'nullable|numeric|min:0',
                'status' => 'nullable|in:ativo,inativo,cancelado',
                'data_inicio' => 'nullable|date',
                'data_fim' => 'nullable|date',
            ]);

            // Se mudar o plano, reseta as horas
            if (isset($validated['plano_id']) && $validated['plano_id'] != $assinatura->plano_id) {
                $plano = \App\Models\Plano::find($validated['plano_id']);
                $validated['horas_disponiveis'] = $plano->limite_horas_tecnicas;
            }

            $assinatura->update($validated);

            $this->logSubscriptionAction('INFO', 'UPDATE', [
                'id' => $assinatura->id,
                'cliente_id' => $assinatura->cliente_id,
                'plano_id' => $assinatura->plano_id
            ], 'Assinatura atualizada com sucesso');

            return response()->json([
                'message' => 'Assinatura atualizada com sucesso',
                'data' => $assinatura->fresh()->load(['cliente', 'dominio', 'plano']),
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            $this->logSubscriptionAction('ERROR', 'UPDATE', [
                'id' => $assinatura->id
            ], 'Validação falhou: ' . json_encode($e->errors()));
            throw $e;
        } catch (\Exception $e) {
            $this->logSubscriptionAction('ERROR', 'UPDATE', [
                'id' => $assinatura->id
            ], 'Erro ao atualizar assinatura: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erro ao atualizar assinatura',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy(Assinatura $assinatura): JsonResponse
    {
        try {
            // Verificar se há pagamentos em atraso
            $pagamentosEmAtraso = $assinatura->pagamentos()
                ->where('status', 'aberto')
                ->whereDate('data_vencimento', '<', now())
                ->count();

            if ($pagamentosEmAtraso > 0) {
                $this->logSubscriptionAction('WARNING', 'DELETE_BLOCKED', [
                    'id' => $assinatura->id,
                    'pagamentos_em_atraso' => $pagamentosEmAtraso
                ], 'Tentativa de excluir assinatura com pagamentos em atraso bloqueada');

                return response()->json([
                    'message' => "Não é possível excluir assinatura com {$pagamentosEmAtraso} pagamento(s) em atraso. Regularize os pagamentos primeiro.",
                ], 422);
            }

            $assinaturaData = [
                'id' => $assinatura->id,
                'cliente_id' => $assinatura->cliente_id,
                'dominio_id' => $assinatura->dominio_id,
                'plano_id' => $assinatura->plano_id
            ];

            $assinatura->delete();

            $this->logSubscriptionAction('INFO', 'DELETE', $assinaturaData, 'Assinatura excluída com sucesso');

            return response()->json([
                'message' => 'Assinatura excluída com sucesso',
            ]);
        } catch (\Exception $e) {
            $this->logSubscriptionAction('ERROR', 'DELETE', [
                'id' => $assinatura->id ?? 'N/A'
            ], 'Erro ao excluir assinatura: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erro ao excluir assinatura',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reseta as horas da assinatura para o limite do plano
     */
    public function resetarHoras(Assinatura $assinatura): JsonResponse
    {
        try {
            $assinatura->resetarHoras();

            $this->logSubscriptionAction('INFO', 'RESET_HOURS', [
                'id' => $assinatura->id,
                'horas_disponiveis' => $assinatura->horas_disponiveis
            ], 'Horas resetadas com sucesso');

            return response()->json([
                'message' => 'Horas resetadas com sucesso',
                'data' => $assinatura->fresh()->load(['cliente', 'dominio', 'plano']),
            ]);
        } catch (\Exception $e) {
            $this->logSubscriptionAction('ERROR', 'RESET_HOURS', [
                'id' => $assinatura->id
            ], 'Erro ao resetar horas: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erro ao resetar horas',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
