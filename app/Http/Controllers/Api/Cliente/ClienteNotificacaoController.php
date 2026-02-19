<?php

namespace App\Http\Controllers\Api\Cliente;

use App\Http\Controllers\Controller;
use App\Models\Notificacao;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClienteNotificacaoController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $cliente = $request->user()->cliente;

        $query = Notificacao::where('cliente_id', $cliente->id)
            ->whereNull('user_id'); // Notificações do cliente, não do admin

        if ($request->has('lida')) {
            $query->where('lida', $request->boolean('lida'));
        }

        if ($request->has('tipo')) {
            $query->where('tipo', $request->tipo);
        }

        $notificacoes = $query->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 15));

        return response()->json($notificacoes);
    }

    public function show(Request $request, Notificacao $notificacao): JsonResponse
    {
        $cliente = $request->user()->cliente;

        if ($notificacao->cliente_id !== $cliente->id) {
            return response()->json(['message' => 'Acesso negado'], 403);
        }

        return response()->json([
            'data' => $notificacao->load(['demanda']),
        ]);
    }

    public function marcarLida(Request $request, Notificacao $notificacao): JsonResponse
    {
        $cliente = $request->user()->cliente;

        if ($notificacao->cliente_id !== $cliente->id) {
            return response()->json(['message' => 'Acesso negado'], 403);
        }

        $notificacao->marcarComoLida();

        return response()->json([
            'message' => 'Notificação marcada como lida',
            'data' => $notificacao,
        ]);
    }

    public function marcarTodasLidas(Request $request): JsonResponse
    {
        $cliente = $request->user()->cliente;

        Notificacao::where('cliente_id', $cliente->id)
            ->whereNull('user_id')
            ->where('lida', false)
            ->update(['lida' => true]);

        return response()->json([
            'message' => 'Todas as notificações foram marcadas como lidas',
        ]);
    }
}
