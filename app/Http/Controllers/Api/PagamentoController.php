<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pagamento;
use App\Models\Demanda;
use App\Models\Assinatura;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Carbon\Carbon;

class PagamentoController extends Controller
{
    private function logPaymentAction(string $level, string $action, array $data, string $message): void
    {
        $logPath = storage_path('logs/personal-logs/pagamentos.log');
        $logDir = dirname($logPath);

        if (!file_exists($logDir)) {
            mkdir($logDir, 0755, true);
        }

        $timestamp = now()->format('Y-m-d H:i:s');
        $dataStr = json_encode($data, JSON_UNESCAPED_UNICODE);
        $logMessage = "[{$timestamp}] {$level} [{$action}] Pagamento: {$dataStr} | Message: {$message}\n";

        file_put_contents($logPath, $logMessage, FILE_APPEND);
    }

    public function index(Request $request): JsonResponse
    {
        try {
            $query = Pagamento::query();

            if ($request->has('cliente_id')) {
                $query->where('cliente_id', $request->cliente_id);
            }

            if ($request->has('assinatura_id')) {
                $query->where('assinatura_id', $request->assinatura_id);
            }

            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            if ($request->has('referencia_mes')) {
                $query->where('referencia_mes', $request->referencia_mes);
            }

            if ($request->has('search')) {
                $search = $request->search;
                $query->whereHas('cliente', function ($q) use ($search) {
                    $q->where('nome', 'like', "%{$search}%");
                });
            }

            $pagamentos = $query->with(['cliente', 'assinatura.plano', 'assinatura.dominio'])
                ->orderBy('data_vencimento', 'desc')
                ->paginate($request->get('per_page', 15));

            $this->logPaymentAction('INFO', 'LIST', ['count' => $pagamentos->total()], 'Pagamentos listados com sucesso');

            return response()->json($pagamentos);
        } catch (\Exception $e) {
            $this->logPaymentAction('ERROR', 'LIST', [], 'Erro ao listar pagamentos: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erro ao listar pagamentos',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'cliente_id' => 'required|exists:clientes,id',
                'assinatura_id' => 'nullable|exists:assinaturas,id',
                'valor' => 'required|numeric|min:0',
                'valor_horas_avulsas' => 'nullable|numeric|min:0',
                'status' => 'nullable|in:aberto,pago,cancelado',
                'data_vencimento' => 'nullable|date',
                'data_pagamento' => 'nullable|date',
                'forma_pagamento' => 'nullable|string|max:50',
                'referencia_mes' => 'nullable|string|max:7',
                'descricao' => 'nullable|string',
            ]);

            // Se o status for pago e tiver data de pagamento
            if (($validated['status'] ?? 'aberto') === 'pago' && empty($validated['data_pagamento'])) {
                $validated['data_pagamento'] = now();
            }

            $pagamento = Pagamento::create($validated);

            $this->logPaymentAction('INFO', 'CREATE', [
                'id' => $pagamento->id,
                'cliente_id' => $pagamento->cliente_id,
                'valor' => $pagamento->valor,
                'status' => $pagamento->status
            ], 'Pagamento criado com sucesso');

            return response()->json([
                'message' => 'Pagamento criado com sucesso',
                'data' => $pagamento->load(['cliente', 'assinatura.plano']),
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            $this->logPaymentAction('ERROR', 'CREATE', [
                'cliente_id' => $request->cliente_id ?? 'N/A'
            ], 'Validação falhou: ' . json_encode($e->errors()));
            throw $e;
        } catch (\Exception $e) {
            $this->logPaymentAction('ERROR', 'CREATE', [
                'cliente_id' => $request->cliente_id ?? 'N/A'
            ], 'Erro ao criar pagamento: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erro ao criar pagamento',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show(Pagamento $pagamento): JsonResponse
    {
        try {
            $this->logPaymentAction('INFO', 'SHOW', [
                'id' => $pagamento->id
            ], 'Pagamento visualizado com sucesso');

            return response()->json([
                'data' => $pagamento->load(['cliente', 'assinatura.plano', 'assinatura.dominio']),
            ]);
        } catch (\Exception $e) {
            $this->logPaymentAction('ERROR', 'SHOW', [
                'id' => $pagamento->id ?? 'N/A'
            ], 'Erro ao visualizar pagamento: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erro ao visualizar pagamento',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, Pagamento $pagamento): JsonResponse
    {
        try {
            $validated = $request->validate([
                'cliente_id' => 'sometimes|required|exists:clientes,id',
                'assinatura_id' => 'nullable|exists:assinaturas,id',
                'valor' => 'sometimes|required|numeric|min:0',
                'valor_horas_avulsas' => 'nullable|numeric|min:0',
                'status' => 'nullable|in:aberto,pago,cancelado',
                'data_vencimento' => 'nullable|date',
                'data_pagamento' => 'nullable|date',
                'forma_pagamento' => 'nullable|string|max:50',
                'referencia_mes' => 'nullable|string|max:7',
                'descricao' => 'nullable|string',
            ]);

            $statusAnterior = $pagamento->status;

            // Se mudou para pago, define a data de pagamento
            if (isset($validated['status']) && $validated['status'] === 'pago' && $statusAnterior !== 'pago') {
                $validated['data_pagamento'] = $validated['data_pagamento'] ?? now();

                // Resetar horas da assinatura se aplicável
                if ($pagamento->assinatura_id) {
                    $assinatura = Assinatura::find($pagamento->assinatura_id);
                    if ($assinatura && $assinatura->plano) {
                        $assinatura->horas_disponiveis = $assinatura->plano->limite_horas_tecnicas;
                        $assinatura->save();

                        $this->logPaymentAction('INFO', 'RESET_HOURS', [
                            'assinatura_id' => $assinatura->id,
                            'horas_disponiveis' => $assinatura->horas_disponiveis
                        ], 'Horas da assinatura resetadas após pagamento');
                    }
                }
            }

            $pagamento->update($validated);

            $this->logPaymentAction('INFO', 'UPDATE', [
                'id' => $pagamento->id,
                'status_anterior' => $statusAnterior,
                'status_novo' => $pagamento->status
            ], 'Pagamento atualizado com sucesso');

            if ($pagamento->status === 'pago' && $statusAnterior !== 'pago') {
                \App\Models\Notificacao::notificarAdmins(
                    'Pagamento Confirmado',
                    "O pagamento #{$pagamento->id} do cliente {$pagamento->cliente->nome} foi confirmado",
                    null,
                    $pagamento->cliente_id,
                    'pagamento'
                );
            }

            return response()->json([
                'message' => 'Pagamento atualizado com sucesso',
                'data' => $pagamento->fresh()->load(['cliente', 'assinatura.plano']),
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            $this->logPaymentAction('ERROR', 'UPDATE', [
                'id' => $pagamento->id
            ], 'Validação falhou: ' . json_encode($e->errors()));
            throw $e;
        } catch (\Exception $e) {
            $this->logPaymentAction('ERROR', 'UPDATE', [
                'id' => $pagamento->id
            ], 'Erro ao atualizar pagamento: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erro ao atualizar pagamento',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy(Pagamento $pagamento): JsonResponse
    {
        try {
            // Pagamentos não podem ser excluídos, apenas cancelados
            $this->logPaymentAction('WARNING', 'DELETE_BLOCKED', [
                'id' => $pagamento->id,
                'status' => $pagamento->status
            ], 'Tentativa de excluir pagamento bloqueada - use cancelamento');

            return response()->json([
                'message' => 'Pagamentos não podem ser excluídos. Use a opção de cancelar se o pagamento estiver em aberto.',
            ], 422);
        } catch (\Exception $e) {
            $this->logPaymentAction('ERROR', 'DELETE', [
                'id' => $pagamento->id ?? 'N/A'
            ], 'Erro ao processar exclusão: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erro ao processar solicitação',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cancela um pagamento (apenas se estiver em aberto)
     */
    public function cancelar(Pagamento $pagamento): JsonResponse
    {
        try {
            if ($pagamento->status !== 'aberto') {
                $this->logPaymentAction('WARNING', 'CANCEL_BLOCKED', [
                    'id' => $pagamento->id,
                    'status' => $pagamento->status
                ], 'Tentativa de cancelar pagamento não aberto bloqueada');

                return response()->json([
                    'message' => 'Apenas pagamentos em aberto podem ser cancelados.',
                ], 422);
            }

            $pagamento->status = 'cancelado';
            $pagamento->save();

            $this->logPaymentAction('INFO', 'CANCEL', [
                'id' => $pagamento->id
            ], 'Pagamento cancelado com sucesso');

            return response()->json([
                'message' => 'Pagamento cancelado com sucesso',
                'data' => $pagamento->fresh()->load(['cliente', 'assinatura.plano']),
            ]);
        } catch (\Exception $e) {
            $this->logPaymentAction('ERROR', 'CANCEL', [
                'id' => $pagamento->id
            ], 'Erro ao cancelar pagamento: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erro ao cancelar pagamento',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Marca o pagamento como pago
     */
    public function marcarPago(Pagamento $pagamento): JsonResponse
    {
        try {
            if ($pagamento->status === 'pago') {
                return response()->json([
                    'message' => 'Pagamento já está marcado como pago',
                ], 422);
            }

            if ($pagamento->status === 'cancelado') {
                return response()->json([
                    'message' => 'Não é possível marcar como pago um pagamento cancelado',
                ], 422);
            }

            $pagamento->marcarComoPago();

            // Resetar horas da assinatura se aplicável
            if ($pagamento->assinatura_id) {
                $assinatura = Assinatura::find($pagamento->assinatura_id);
                if ($assinatura && $assinatura->plano) {
                    $assinatura->horas_disponiveis = $assinatura->plano->limite_horas_tecnicas;
                    $assinatura->save();

                    $this->logPaymentAction('INFO', 'RESET_HOURS', [
                        'assinatura_id' => $assinatura->id,
                        'horas_disponiveis' => $assinatura->horas_disponiveis
                    ], 'Horas da assinatura resetadas após pagamento');
                }
            }

            $this->logPaymentAction('INFO', 'MARK_PAID', [
                'id' => $pagamento->id,
                'valor' => $pagamento->valor
            ], 'Pagamento marcado como pago');

            \App\Models\Notificacao::notificarAdmins(
                'Pagamento Confirmado',
                "O pagamento #{$pagamento->id} do cliente {$pagamento->cliente->nome} foi confirmado",
                null,
                $pagamento->cliente_id,
                'pagamento'
            );

            return response()->json([
                'message' => 'Pagamento marcado como pago',
                'data' => $pagamento->fresh()->load(['cliente', 'assinatura.plano']),
            ]);
        } catch (\Exception $e) {
            $this->logPaymentAction('ERROR', 'MARK_PAID', [
                'id' => $pagamento->id
            ], 'Erro ao marcar pagamento como pago: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erro ao marcar pagamento como pago',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Gera fatura mensal para todas as assinaturas ativas
     */
    public function gerarFaturaMensal(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'cliente_id' => 'nullable|exists:clientes,id',
                'referencia_mes' => 'required|string|max:7', // formato YYYY-MM
            ]);

            $referenciaMes = $validated['referencia_mes'];
            $clienteId = $validated['cliente_id'] ?? null;

            // Período do mês
            $inicioMes = Carbon::createFromFormat('Y-m', $referenciaMes)->startOfMonth();
            $fimMes = Carbon::createFromFormat('Y-m', $referenciaMes)->endOfMonth();

            // Buscar assinaturas ativas
            $query = Assinatura::where('status', 'ativo')
                ->whereDate('data_inicio', '<=', $fimMes)
                ->with(['cliente', 'plano', 'dominio']);

            if ($clienteId) {
                $query->where('cliente_id', $clienteId);
            }

            $assinaturas = $query->get();

            $pagamentosCriados = 0;

            foreach ($assinaturas as $assinatura) {
                // Verificar se já existe pagamento para esse mês
                $pagamentoExistente = Pagamento::where('assinatura_id', $assinatura->id)
                    ->where('referencia_mes', $referenciaMes)
                    ->exists();

                if ($pagamentoExistente) {
                    continue;
                }

                // Criar pagamento
                Pagamento::create([
                    'cliente_id' => $assinatura->cliente_id,
                    'assinatura_id' => $assinatura->id,
                    'valor' => $assinatura->plano->preco,
                    'status' => 'aberto',
                    'data_vencimento' => $fimMes->copy()->addDays(10),
                    'referencia_mes' => $referenciaMes,
                    'descricao' => "Mensalidade {$referenciaMes} - {$assinatura->plano->nome} ({$assinatura->dominio->nome})",
                ]);

                $pagamentosCriados++;
            }

            $this->logPaymentAction('INFO', 'GENERATE_MONTHLY', [
                'referencia_mes' => $referenciaMes,
                'cliente_id' => $clienteId,
                'pagamentos_criados' => $pagamentosCriados
            ], "Geração de faturas mensais concluída");

            return response()->json([
                'message' => $pagamentosCriados > 0
                    ? "Gerado(s) {$pagamentosCriados} pagamento(s) para {$referenciaMes}"
                    : "Nenhum pagamento novo gerado para {$referenciaMes}",
                'pagamentos_criados' => $pagamentosCriados,
            ], 201);
        } catch (\Exception $e) {
            $this->logPaymentAction('ERROR', 'GENERATE_MONTHLY', [
                'referencia_mes' => $request->referencia_mes ?? 'N/A'
            ], 'Erro ao gerar faturas mensais: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erro ao gerar faturas mensais',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
