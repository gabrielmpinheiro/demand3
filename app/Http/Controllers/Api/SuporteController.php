<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Suporte;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SuporteController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Suporte::query();

        if ($request->has('cliente_id')) {
            $query->where('cliente_id', $request->cliente_id);
        }

        if ($request->has('demanda_id')) {
            $query->where('demanda_id', $request->demanda_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $suportes = $query->with(['cliente', 'demanda'])
            ->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 15));

        return response()->json($suportes);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'cliente_id' => 'required|exists:clientes,id',
            'demanda_id' => 'required|exists:demandas,id',
            'mensagem' => 'nullable|string',
            'status' => 'nullable|in:aberto,em_andamento,concluido,cancelado',
        ]);

        $suporte = Suporte::create($validated);

        return response()->json([
            'message' => 'Suporte criado com sucesso',
            'data' => $suporte->load(['cliente', 'demanda']),
        ], 201);
    }

    public function show(Suporte $suporte): JsonResponse
    {
        return response()->json([
            'data' => $suporte->load(['cliente', 'demanda.dominio']),
        ]);
    }

    public function update(Request $request, Suporte $suporte): JsonResponse
    {
        $validated = $request->validate([
            'cliente_id' => 'sometimes|required|exists:clientes,id',
            'demanda_id' => 'sometimes|required|exists:demandas,id',
            'mensagem' => 'nullable|string',
            'status' => 'nullable|in:aberto,em_andamento,concluido,cancelado',
        ]);

        $suporte->update($validated);

        return response()->json([
            'message' => 'Suporte atualizado com sucesso',
            'data' => $suporte->fresh()->load(['cliente', 'demanda']),
        ]);
    }

    public function destroy(Suporte $suporte): JsonResponse
    {
        $suporte->delete();

        return response()->json([
            'message' => 'Suporte excluído com sucesso',
        ]);
    }
}
