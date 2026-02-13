<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pagamento;
use App\Models\Demanda;
use App\Models\Cliente;
use App\Models\Assinatura;
use App\Models\Suporte;
use App\Models\Notificacao;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function stats(): JsonResponse
    {
        $inicioMes = Carbon::now()->startOfMonth();
        $hoje = Carbon::now();

        // 1. Faturamento do mês corrente (pagamentos com status = 'pago' no período)
        $faturamento = Pagamento::where('status', 'pago')
            ->whereBetween('data_pagamento', [$inicioMes, $hoje])
            ->sum('valor');

        // 2. Demandas em aberto no período
        $demandasAbertas = Demanda::whereIn('status', ['pendente', 'em_andamento', 'em_aprovacao'])
            ->whereBetween('created_at', [$inicioMes, $hoje])
            ->count();

        // 3. Clientes ativos
        $clientesAtivos = Cliente::where('status', 'ativo')->count();

        // 4. Assinaturas ativas
        $assinaturasAtivas = Assinatura::where('status', 'ativo')->count();

        // 5. Últimos 6 chamados de suporte
        $ultimosSuportes = Suporte::with('cliente')
            ->orderBy('created_at', 'desc')
            ->limit(6)
            ->get()
            ->map(function ($s) {
                return [
                    'id' => $s->id,
                    'cliente' => $s->cliente->nome ?? 'N/A',
                    'mensagem' => \Illuminate\Support\Str::limit($s->mensagem, 60),
                    'status' => $s->status,
                    'created_at' => $s->created_at->format('d/m/Y H:i'),
                ];
            });

        // 6. Últimas 6 notificações
        $ultimasNotificacoes = Notificacao::orderBy('created_at', 'desc')
            ->limit(6)
            ->get()
            ->map(function ($n) {
                return [
                    'id' => $n->id,
                    'titulo' => $n->titulo,
                    'mensagem' => \Illuminate\Support\Str::limit($n->mensagem, 60),
                    'lida' => $n->lida,
                    'created_at' => $n->created_at->format('d/m/Y H:i'),
                ];
            });

        // 7. Assinaturas em atraso: pagamentos abertos com data_vencimento + 5 dias < hoje
        $limiteAtraso = Carbon::now()->subDays(5);
        $assinaturasAtraso = Pagamento::where('status', 'aberto')
            ->whereDate('data_vencimento', '<', $limiteAtraso)
            ->with(['cliente', 'assinatura.plano', 'assinatura.dominio'])
            ->orderBy('data_vencimento', 'asc')
            ->get()
            ->map(function ($p) {
                $diasAtraso = round(Carbon::parse($p->data_vencimento)->floatDiffInDays(Carbon::now()), 2);
                return [
                    'id' => $p->id,
                    'cliente' => $p->cliente->nome ?? 'N/A',
                    'plano' => $p->assinatura->plano->nome ?? 'N/A',
                    'dominio' => $p->assinatura->dominio->nome ?? 'N/A',
                    'valor' => round((float) $p->valor, 2),
                    'data_vencimento' => Carbon::parse($p->data_vencimento)->format('d/m/Y'),
                    'dias_atraso' => $diasAtraso,
                    'referencia_mes' => $p->referencia_mes,
                ];
            });

        return response()->json([
            'faturamento' => round((float) $faturamento, 2),
            'demandas_abertas' => $demandasAbertas,
            'clientes_ativos' => $clientesAtivos,
            'assinaturas_ativas' => $assinaturasAtivas,
            'ultimos_suportes' => $ultimosSuportes,
            'ultimas_notificacoes' => $ultimasNotificacoes,
            'assinaturas_atraso' => $assinaturasAtraso,
        ]);
    }
}
