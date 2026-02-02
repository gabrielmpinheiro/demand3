<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pagamento;
use App\Models\Demanda;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Carbon\Carbon;

class PagamentoController extends Controller
{
    public function index(Request $request): JsonResponse
    {
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

        $pagamentos = $query->with(['cliente', 'assinatura.plano'])
            ->orderBy('data_vencimento', 'desc')
            ->paginate($request->get('per_page', 15));

        return response()->json($pagamentos);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'cliente_id' => 'required|exists:clientes,id',
            'assinatura_id' => 'nullable|exists:assinaturas,id',
            'valor' => 'required|numeric|min:0',
            'status' => 'nullable|in:aberto,pago,cancelado',
            'data_vencimento' => 'nullable|date',
            'referencia_mes' => 'nullable|string|max:7',
            'descricao' => 'nullable|string',
        ]);

        $pagamento = Pagamento::create($validated);

        return response()->json([
            'message' => 'Pagamento criado com sucesso',
            'data' => $pagamento->load(['cliente', 'assinatura.plano']),
        ], 201);
    }

    public function show(Pagamento $pagamento): JsonResponse
    {
        return response()->json([
            'data' => $pagamento->load(['cliente', 'assinatura.plano']),
        ]);
    }

    public function update(Request $request, Pagamento $pagamento): JsonResponse
    {
        $validated = $request->validate([
            'cliente_id' => 'sometimes|required|exists:clientes,id',
            'assinatura_id' => 'nullable|exists:assinaturas,id',
            'valor' => 'sometimes|required|numeric|min:0',
            'status' => 'nullable|in:aberto,pago,cancelado',
            'data_vencimento' => 'nullable|date',
            'data_pagamento' => 'nullable|date',
            'referencia_mes' => 'nullable|string|max:7',
            'descricao' => 'nullable|string',
        ]);

        $pagamento->update($validated);

        return response()->json([
            'message' => 'Pagamento atualizado com sucesso',
            'data' => $pagamento->fresh()->load(['cliente', 'assinatura.plano']),
        ]);
    }

    public function destroy(Pagamento $pagamento): JsonResponse
    {
        $pagamento->delete();

        return response()->json([
            'message' => 'Pagamento excluído com sucesso',
        ]);
    }

    /**
     * Marca o pagamento como pago
     */
    public function marcarPago(Pagamento $pagamento): JsonResponse
    {
        $pagamento->marcarComoPago();

        return response()->json([
            'message' => 'Pagamento marcado como pago',
            'data' => $pagamento->fresh()->load(['cliente', 'assinatura.plano']),
        ]);
    }

    /**
     * Gera fatura mensal para um cliente
     */
    public function gerarFaturaMensal(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'cliente_id' => 'required|exists:clientes,id',
            'referencia_mes' => 'required|string|max:7', // formato YYYY-MM
        ]);

        $clienteId = $validated['cliente_id'];
        $referenciaMes = $validated['referencia_mes'];

        // Período do mês
        $inicioMes = Carbon::createFromFormat('Y-m', $referenciaMes)->startOfMonth();
        $fimMes = Carbon::createFromFormat('Y-m', $referenciaMes)->endOfMonth();

        // Busca demandas não cobradas do cliente no período
        $demandas = Demanda::whereHas('dominio', function ($q) use ($clienteId) {
            $q->where('cliente_id', $clienteId);
        })
            ->where('cobrado', false)
            ->where('status', 'concluido')
            ->whereBetween('created_at', [$inicioMes, $fimMes])
            ->get();

        if ($demandas->isEmpty()) {
            return response()->json([
                'message' => 'Nenhuma demanda a ser faturada no período',
            ], 422);
        }

        // Calcula o valor total
        $valorTotal = $demandas->sum(function ($demanda) {
            return $demanda->valor + $demanda->valor_excedente;
        });

        // Cria o pagamento
        $pagamento = Pagamento::create([
            'cliente_id' => $clienteId,
            'valor' => $valorTotal,
            'status' => 'aberto',
            'data_vencimento' => $fimMes->copy()->addDays(10),
            'referencia_mes' => $referenciaMes,
            'descricao' => "Fatura mensal - {$demandas->count()} demanda(s)",
        ]);

        // Marca as demandas como cobradas
        $demandas->each(function ($demanda) {
            $demanda->cobrado = true;
            $demanda->save();
        });

        return response()->json([
            'message' => 'Fatura gerada com sucesso',
            'data' => $pagamento->load(['cliente']),
            'demandas_faturadas' => $demandas->count(),
        ], 201);
    }
}
