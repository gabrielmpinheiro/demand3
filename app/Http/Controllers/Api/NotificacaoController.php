<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notificacao;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificacaoController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Notificacao::query();

        if ($request->has('cliente_id')) {
            $query->where('cliente_id', $request->cliente_id);
        }

        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->has('tipo')) {
            $query->where('tipo', $request->tipo);
        }

        if ($request->has('lida')) {
            $query->where('lida', $request->boolean('lida'));
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $notificacoes = $query->with(['cliente', 'demanda', 'user'])
            ->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 15));

        return response()->json($notificacoes);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'cliente_id' => 'nullable|exists:clientes,id',
            'demanda_id' => 'nullable|exists:demandas,id',
            'user_id' => 'nullable|exists:users,id',
            'tipo' => 'nullable|string|max:50',
            'titulo' => 'required|string|max:255',
            'mensagem' => 'nullable|string',
            'status' => 'nullable|in:ativo,arquivado',
        ]);

        $notificacao = Notificacao::create($validated);

        return response()->json([
            'message' => 'Notificação criada com sucesso',
            'data' => $notificacao->load(['cliente', 'demanda', 'user']),
        ], 201);
    }

    public function show(Notificacao $notificacao): JsonResponse
    {
        return response()->json([
            'data' => $notificacao->load(['cliente', 'demanda', 'user']),
        ]);
    }

    public function update(Request $request, Notificacao $notificacao): JsonResponse
    {
        $validated = $request->validate([
            'tipo' => 'nullable|string|max:50',
            'titulo' => 'sometimes|required|string|max:255',
            'mensagem' => 'nullable|string',
            'lida' => 'nullable|boolean',
            'status' => 'nullable|in:ativo,arquivado',
        ]);

        $notificacao->update($validated);

        return response()->json([
            'message' => 'Notificação atualizada com sucesso',
            'data' => $notificacao->fresh()->load(['cliente', 'demanda', 'user']),
        ]);
    }

    public function destroy(Notificacao $notificacao): JsonResponse
    {
        $notificacao->delete();

        return response()->json([
            'message' => 'Notificação excluída com sucesso',
        ]);
    }

    /**
     * Marca a notificação como lida
     */
    public function marcarLida(Notificacao $notificacao): JsonResponse
    {
        $notificacao->marcarComoLida();

        return response()->json([
            'message' => 'Notificação marcada como lida',
            'data' => $notificacao->fresh(),
        ]);
    }

    /**
     * Marca todas as notificações do usuário como lidas
     */
    public function marcarTodasLidas(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        Notificacao::where('user_id', $validated['user_id'])
            ->where('lida', false)
            ->update(['lida' => true]);

        return response()->json([
            'message' => 'Todas as notificações foram marcadas como lidas',
        ]);
    }
}
