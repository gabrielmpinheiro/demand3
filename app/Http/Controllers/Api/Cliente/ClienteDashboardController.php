<?php

namespace App\Http\Controllers\Api\Cliente;

use App\Http\Controllers\Controller;
use App\Models\Demanda;
use App\Models\Pagamento;
use App\Models\Suporte;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClienteDashboardController extends Controller
{
    public function stats(Request $request): JsonResponse
    {
        $cliente = $request->user()->cliente;

        if (!$cliente) {
            return response()->json(['message' => 'Cliente não encontrado'], 404);
        }

        $clienteId = $cliente->id;
        $dominioIds = $cliente->dominios()->pluck('id');

        // Chamados recentes (suportes)
        $chamadosRecentes = Suporte::where('cliente_id', $clienteId)
            ->with(['dominio'])
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        // Contagens de demandas por status
        $demandas = Demanda::whereIn('dominio_id', $dominioIds);
        $demandasPorStatus = [
            'pendente' => (clone $demandas)->where('status', 'pendente')->count(),
            'em_andamento' => (clone $demandas)->where('status', 'em_andamento')->count(),
            'em_aprovacao' => (clone $demandas)->where('status', 'em_aprovacao')->count(),
            'concluido' => (clone $demandas)->where('status', 'concluido')->count(),
            'cancelado' => (clone $demandas)->where('status', 'cancelado')->count(),
        ];

        // Domínios ativos
        $dominiosAtivos = $cliente->dominios()->where('status', 'ativo')->count();
        $totalDominios = $cliente->dominios()->count();

        // Faturas pendentes
        $faturasPendentes = Pagamento::where('cliente_id', $clienteId)
            ->whereIn('status', ['aberto', 'pendente_conferencia'])
            ->count();

        $faturasValor = Pagamento::where('cliente_id', $clienteId)
            ->where('status', 'aberto')
            ->sum('valor');

        return response()->json([
            'data' => [
                'chamados_recentes' => $chamadosRecentes,
                'demandas_por_status' => $demandasPorStatus,
                'dominios_ativos' => $dominiosAtivos,
                'total_dominios' => $totalDominios,
                'faturas_pendentes' => $faturasPendentes,
                'faturas_valor_pendente' => round($faturasValor, 2),
            ],
        ]);
    }
}
