<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Demanda;
use App\Models\Notificacao;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DemandaController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Demanda::query();

        if ($request->has('dominio_id')) {
            $query->where('dominio_id', $request->dominio_id);
        }

        if ($request->has('assinatura_id')) {
            $query->where('assinatura_id', $request->assinatura_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('cobrado')) {
            $query->where('cobrado', $request->boolean('cobrado'));
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('titulo', 'like', "%{$search}%")
                    ->orWhere('descricao', 'like', "%{$search}%");
            });
        }

        $demandas = $query->with(['dominio.cliente', 'assinatura.plano'])
            ->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 15));

        return response()->json($demandas);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'dominio_id' => 'required|exists:dominios,id',
            'titulo' => 'required|string|max:255',
            'descricao' => 'nullable|string',
            'quantidade_horas_tecnicas' => 'required|numeric|min:0.5',
            'status' => 'nullable|in:pendente,em_andamento,em_aprovacao,concluido,cancelado',
        ]);

        try {
            $demanda = new Demanda($validated);

            // Calcula o valor da demanda baseado nas regras de negócio
            $demanda->calcularValor();
            $demanda->save();

            // Notifica os admins sobre a nova demanda
            $dominio = $demanda->dominio;
            Notificacao::notificarAdmins(
                "Nova demanda: {$demanda->titulo}",
                "Cliente: {$dominio->cliente->nome}\nDomínio: {$dominio->nome}\nHoras: {$demanda->quantidade_horas_tecnicas}h\nValor: R$ " . number_format($demanda->valor, 2, ',', '.'),
                $demanda->id,
                $dominio->cliente_id,
                'demanda'
            );

            $this->log('INFO', 'Demanda criada com sucesso', ['id' => $demanda->id, 'titulo' => $demanda->titulo]);

            return response()->json([
                'message' => 'Demanda criada com sucesso',
                'data' => $demanda->load(['dominio.cliente', 'assinatura.plano']),
            ], 201);
        } catch (\Exception $e) {
            $this->log('ERROR', 'Erro ao criar demanda', ['error' => $e->getMessage(), 'data' => $validated]);
            return response()->json(['message' => 'Erro ao criar demanda'], 500);
        }
    }

    public function show(Demanda $demanda): JsonResponse
    {
        return response()->json([
            'data' => $demanda->load([
                'dominio.cliente',
                'assinatura.plano',
                'suporte',
                'notificacoes',
            ]),
        ]);
    }

    public function update(Request $request, Demanda $demanda): JsonResponse
    {
        $validated = $request->validate([
            'titulo' => 'sometimes|required|string|max:255',
            'descricao' => 'nullable|string',
            'status' => 'nullable|in:pendente,em_andamento,em_aprovacao,concluido,cancelado',
            'quantidade_horas_tecnicas' => 'sometimes|required|numeric|min:0.5',
        ]);

        try {
            // Se alterou as horas, recalcula o valor
            if (
                isset($validated['quantidade_horas_tecnicas']) &&
                $validated['quantidade_horas_tecnicas'] != $demanda->quantidade_horas_tecnicas
            ) {
                $demanda->fill($validated);
                $demanda->calcularValor();
                $demanda->save();
            } else {
                $demanda->update($validated);
            }

            // Check for support auto-completion if status is 'concluido'
            if ($demanda->status === 'concluido' && $demanda->suporte_id) {
                $suporte = $demanda->suporte;
                $pendingDemands = $suporte->demandas()->whereNotIn('status', ['concluido', 'cancelado'])->count();

                if ($pendingDemands === 0 && $suporte->status !== 'concluido') {
                    $suporte->status = 'concluido';
                    $suporte->save();
                    $this->log('INFO', 'Suporte concluído automaticamente', ['suporte_id' => $suporte->id, 'trigger_demanda_id' => $demanda->id]);
                }
            }

            $this->log('INFO', 'Demanda atualizada com sucesso', ['id' => $demanda->id, 'changes' => $validated]);

            return response()->json([
                'message' => 'Demanda atualizada com sucesso',
                'data' => $demanda->fresh()->load(['dominio.cliente', 'assinatura.plano']),
            ]);
        } catch (\Exception $e) {
            $this->log('ERROR', 'Erro ao atualizar demanda', ['id' => $demanda->id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Erro ao atualizar demanda'], 500);
        }
    }

    public function destroy(Demanda $demanda): JsonResponse
    {
        try {
            $id = $demanda->id;
            $demanda->delete();
            $this->log('INFO', 'Demanda excluída com sucesso', ['id' => $id]);

            return response()->json([
                'message' => 'Demanda excluída com sucesso',
            ]);
        } catch (\Exception $e) {
            $this->log('ERROR', 'Erro ao excluir demanda', ['id' => $demanda->id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Erro ao excluir demanda'], 500);
        }
    }

    /**
     * Aprova uma demanda pendente
     */
    public function aprovar(Demanda $demanda): JsonResponse
    {
        if ($demanda->status !== 'pendente') {
            return response()->json([
                'message' => 'Apenas demandas pendentes podem ser aprovadas',
            ], 422);
        }

        $demanda->status = 'em_andamento';
        $demanda->save();

        $this->log('INFO', 'Demanda aprovada', ['id' => $demanda->id]);

        return response()->json([
            'message' => 'Demanda aprovada com sucesso',
            'data' => $demanda->fresh()->load(['dominio.cliente', 'assinatura.plano']),
        ]);
    }

    /**
     * Conclui uma demanda
     */
    public function concluir(Demanda $demanda): JsonResponse
    {
        if (!in_array($demanda->status, ['pendente', 'em_andamento', 'em_aprovacao'])) {
            return response()->json([
                'message' => 'Status inválido para conclusão',
            ], 422);
        }

        $demanda->status = 'concluido';
        $demanda->save();

        // Check for support auto-completion
        if ($demanda->suporte_id) {
            $suporte = $demanda->suporte;
            $pendingDemands = $suporte->demandas()->whereNotIn('status', ['concluido', 'cancelado'])->count();

            if ($pendingDemands === 0 && $suporte->status !== 'concluido') {
                $suporte->status = 'concluido';
                $suporte->save();
                $this->log('INFO', 'Suporte concluído automaticamente', ['suporte_id' => $suporte->id, 'trigger_demanda_id' => $demanda->id]);
            }
        }

        $this->log('INFO', 'Demanda concluída', ['id' => $demanda->id]);

        return response()->json([
            'message' => 'Demanda concluída com sucesso',
            'data' => $demanda->fresh()->load(['dominio.cliente', 'assinatura.plano']),
        ]);
    }

    private function log(string $type, string $message, array $data = []): void
    {
        $logPath = base_path('logs/personal-logs/demandas.log');
        $timestamp = now()->format('Y-m-d H:i:s');
        $logMessage = "[{$timestamp}] [{$type}] {$message} " . json_encode($data) . PHP_EOL;

        // Ensure directory exists
        if (!file_exists(dirname($logPath))) {
            mkdir(dirname($logPath), 0755, true);
        }

        file_put_contents($logPath, $logMessage, FILE_APPEND);
    }

    /**
     * Cancela uma demanda
     */
    public function cancelar(Demanda $demanda): JsonResponse
    {
        if ($demanda->status === 'concluido') {
            return response()->json([
                'message' => 'Não é possível cancelar uma demanda concluída',
            ], 422);
        }

        $demanda->status = 'cancelado';
        $demanda->save();

        // Estorna as horas se tinham sido descontadas
        if ($demanda->assinatura_id && $demanda->valor == 0) {
            $assinatura = $demanda->assinatura;
            $assinatura->horas_disponiveis += $demanda->quantidade_horas_tecnicas;
            $assinatura->save();
        }

        return response()->json([
            'message' => 'Demanda cancelada com sucesso',
            'data' => $demanda->fresh()->load(['dominio.cliente', 'assinatura.plano']),
        ]);
    }
}
