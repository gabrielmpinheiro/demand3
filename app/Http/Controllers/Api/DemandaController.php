<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Demanda;
use App\Models\Notificacao;
use App\Models\Pagamento;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Carbon\Carbon;

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

        if ($request->has('suporte_id')) {
            $query->where('suporte_id', $request->suporte_id);
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
            'suporte_id' => 'required|exists:suportes,id', //torna obrigatório ter o registro do suporte_id na demanda.
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

            // Notifica o cliente sobre a nova demanda
            Notificacao::notificarCliente(
                $dominio->cliente_id,
                "Nova demanda criada: {$demanda->titulo}",
                "Uma nova demanda foi criada para o domínio {$dominio->nome}.\nHoras: {$demanda->quantidade_horas_tecnicas}h",
                $demanda->id
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
            $statusAnterior = $demanda->status;

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

            // Notifica o cliente se o status mudou
            if (isset($validated['status']) && $validated['status'] !== $statusAnterior) {
                $dominio = $demanda->dominio;
                $statusLabels = [
                    'pendente' => 'Pendente',
                    'em_andamento' => 'Em Andamento',
                    'em_aprovacao' => 'Em Aprovação',
                    'concluido' => 'Concluído',
                    'cancelado' => 'Cancelado',
                ];
                $statusLabel = $statusLabels[$demanda->status] ?? $demanda->status;
                Notificacao::notificarCliente(
                    $dominio->cliente_id,
                    "Demanda atualizada: {$demanda->titulo}",
                    "O status da demanda foi alterado para: {$statusLabel}",
                    $demanda->id
                );
            }

            // Verifica conclusão automática do suporte e gera cobrança se necessário
            if ($demanda->status === 'concluido') {
                if ($demanda->suporte_id) {
                    $suporte = $demanda->suporte;
                    $pendingDemands = $suporte->demandas()->whereNotIn('status', ['concluido', 'cancelado'])->count();

                    if ($pendingDemands === 0 && $suporte->status !== 'concluido') {
                        $suporte->status = 'concluido';
                        $suporte->save();
                        $this->log('INFO', 'Suporte concluído automaticamente', ['suporte_id' => $suporte->id, 'trigger_demanda_id' => $demanda->id]);
                    }

                    // Gera cobrança após todas demandas do chamado concluídas
                    if ($pendingDemands === 0) {
                        $this->gerarCobrancaChamado($suporte);
                    }
                } else {
                    // Demanda avulsa (sem chamado)
                    $this->gerarCobrancaAvulsa($demanda);
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

        // Notifica o cliente
        $dominio = $demanda->dominio;
        Notificacao::notificarCliente(
            $dominio->cliente_id,
            "Demanda aprovada: {$demanda->titulo}",
            "Sua demanda foi aprovada e está em andamento.",
            $demanda->id
        );

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

        // Notifica o cliente
        $dominio = $demanda->dominio;
        Notificacao::notificarCliente(
            $dominio->cliente_id,
            "Demanda concluída: {$demanda->titulo}",
            "Sua demanda foi concluída com sucesso.",
            $demanda->id
        );

        // Check for support auto-completion
        if ($demanda->suporte_id) {
            $suporte = $demanda->suporte;
            $pendingDemands = $suporte->demandas()->whereNotIn('status', ['concluido', 'cancelado'])->count();

            if ($pendingDemands === 0 && $suporte->status !== 'concluido') {
                $suporte->status = 'concluido';
                $suporte->save();
                $this->log('INFO', 'Suporte concluído automaticamente', ['suporte_id' => $suporte->id, 'trigger_demanda_id' => $demanda->id]);
            }

            // Gera cobrança após todas demandas do chamado concluídas
            if ($pendingDemands === 0) {
                $this->gerarCobrancaChamado($suporte);
            }
        } else {
            // Demanda avulsa (sem chamado)
            $this->gerarCobrancaAvulsa($demanda);
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
     * Gera cobrança para uma demanda avulsa (sem chamado de suporte)
     */
    private function gerarCobrancaAvulsa(Demanda $demanda): void
    {
        // Evita cobrança dupla
        if ($demanda->cobrado) {
            return;
        }

        $valorCobrar = 0;
        $descricaoTipo = '';

        if (!$demanda->assinatura_id) {
            // Sem assinatura: cobra valor integral
            $valorCobrar = (float) $demanda->valor;
            $descricaoTipo = 'Demanda avulsa (sem plano)';
        } elseif ((float) $demanda->valor_excedente > 0) {
            // Com assinatura mas com excedente: cobra apenas o excedente
            $valorCobrar = (float) $demanda->valor_excedente;
            $descricaoTipo = 'Excedente de horas';
        }

        if ($valorCobrar <= 0) {
            return; // Nada a cobrar (horas dentro do plano)
        }

        $dominio = $demanda->dominio;
        $clienteId = $dominio->cliente_id;
        $vencimento = Carbon::now()->addDays(15);

        Pagamento::create([
            'cliente_id' => $clienteId,
            'assinatura_id' => $demanda->assinatura_id,
            'valor' => $valorCobrar,
            'status' => 'aberto',
            'data_vencimento' => $vencimento,
            'descricao' => "{$descricaoTipo}: {$demanda->titulo}",
        ]);

        $demanda->cobrado = true;
        $demanda->save();

        $this->log('INFO', 'Cobrança avulsa gerada', [
            'demanda_id' => $demanda->id,
            'valor' => $valorCobrar,
            'vencimento' => $vencimento->format('Y-m-d'),
        ]);
    }

    /**
     * Gera cobrança agrupada para todas as demandas de um chamado de suporte
     * (somente quando todas estiverem concluídas ou canceladas)
     */
    private function gerarCobrancaChamado(\App\Models\Suporte $suporte): void
    {
        // Busca demandas não canceladas e ainda não cobradas do chamado
        $demandasNaoCobradas = $suporte->demandas()
            ->where('status', 'concluido')
            ->where('cobrado', false)
            ->get();

        if ($demandasNaoCobradas->isEmpty()) {
            return; // Nada a cobrar
        }

        $valorTotal = 0;
        $temAssinatura = false;

        foreach ($demandasNaoCobradas as $d) {
            if (!$d->assinatura_id) {
                $valorTotal += (float) $d->valor;
            } else {
                $valorTotal += (float) $d->valor_excedente;
                $temAssinatura = true;
            }
        }

        if ($valorTotal <= 0) {
            // Mesmo sem cobrar, marca como cobrado para não reprocessar
            $demandasNaoCobradas->each(function ($d) {
                $d->cobrado = true;
                $d->save();
            });
            return;
        }

        $clienteId = $suporte->dominio?->cliente_id ?? $suporte->cliente_id;
        $vencimento = Carbon::now()->addDays(15);
        $descricaoTipo = $temAssinatura ? 'Excedente de horas' : 'Demandas avulsas';

        Pagamento::create([
            'cliente_id' => $clienteId,
            'valor' => round($valorTotal, 2),
            'status' => 'aberto',
            'data_vencimento' => $vencimento,
            'descricao' => "{$descricaoTipo} — Chamado #{$suporte->id}",
        ]);

        // Marca todas as demandas do chamado como cobradas
        $demandasNaoCobradas->each(function ($d) {
            $d->cobrado = true;
            $d->save();
        });

        $this->log('INFO', 'Cobrança de chamado gerada', [
            'suporte_id' => $suporte->id,
            'valor_total' => round($valorTotal, 2),
            'demandas_cobradas' => $demandasNaoCobradas->count(),
            'vencimento' => $vencimento->format('Y-m-d'),
        ]);
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

        // Notifica o cliente
        $dominio = $demanda->dominio;
        Notificacao::notificarCliente(
            $dominio->cliente_id,
            "Demanda cancelada: {$demanda->titulo}",
            "A demanda foi cancelada.",
            $demanda->id
        );

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
