<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Plano;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class PlanoController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Plano::query();

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $planos = $query->orderBy('preco')
            ->paginate($request->get('per_page', 15));

        return response()->json($planos);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nome' => 'required|string|max:255',
            'descricao' => 'nullable|string',
            'preco' => 'required|numeric|min:0',
            'limite_horas_tecnicas' => 'required|integer|min:0',
            'valor_hora' => 'nullable|numeric|min:0',
            'status' => 'nullable|in:ativo,inativo,cancelado',
        ]);

        if (!isset($validated['valor_hora'])) {
            $validated['valor_hora'] = 50.00;
        }

        $plano = Plano::create($validated);

        return response()->json([
            'message' => 'Plano criado com sucesso',
            'data' => $plano,
        ], 201);
    }

    public function show(Plano $plano): JsonResponse
    {
        return response()->json([
            'data' => $plano->load('assinaturas.cliente'),
        ]);
    }

    public function update(Request $request, Plano $plano): JsonResponse
    {
        $validated = $request->validate([
            'nome' => 'sometimes|required|string|max:255',
            'descricao' => 'nullable|string',
            'preco' => 'sometimes|required|numeric|min:0',
            'limite_horas_tecnicas' => 'sometimes|required|integer|min:0',
            'valor_hora' => 'nullable|numeric|min:0',
            'status' => 'nullable|in:ativo,inativo,cancelado',
        ]);

        $plano->update($validated);

        return response()->json([
            'message' => 'Plano atualizado com sucesso',
            'data' => $plano->fresh(),
        ]);
    }

    public function destroy(Plano $plano): JsonResponse
    {
        $plano->delete();

        return response()->json([
            'message' => 'Plano excluído com sucesso',
        ]);
    }
}
