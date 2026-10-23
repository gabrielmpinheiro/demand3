<?php

namespace App\Http\Controllers\Api\Cliente;

use App\Http\Controllers\Controller;
use App\Models\Assinatura;
use App\Models\Plano;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClientePlanoController extends Controller
{
    /**
     * Retorna exclusivamente o(s) plano(s) atribuído(s) ao cliente.
     * Não exibe todos os planos disponíveis no sistema.
     */
    public function index(Request $request): JsonResponse
    {
        $cliente = $request->user()->cliente;

        if (!$cliente) {
            return response()->json(['data' => []]);
        }

        $dominioIds = $cliente->dominios()->pluck('id');

        $planoIds = Assinatura::where(function ($q) use ($cliente, $dominioIds) {
                $q->where('cliente_id', $cliente->id)
                  ->orWhereIn('dominio_id', $dominioIds);
            })
            ->where('status', 'ativo')
            ->pluck('plano_id')
            ->unique();

        $planos = Plano::whereIn('id', $planoIds)
            ->where('status', 'ativo')
            ->orderBy('preco', 'asc')
            ->get();

        return response()->json([
            'data' => $planos,
        ]);
    }
}
