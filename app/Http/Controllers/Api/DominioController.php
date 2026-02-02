<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Dominio;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class DominioController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Dominio::query();

        if ($request->has('cliente_id')) {
            $query->where('cliente_id', $request->cliente_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('search')) {
            $query->where('nome', 'like', "%{$request->search}%");
        }

        $dominios = $query->with(['cliente', 'assinatura.plano'])
            ->orderBy('nome')
            ->paginate($request->get('per_page', 15));

        return response()->json($dominios);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'cliente_id' => 'required|exists:clientes,id',
            'nome' => 'required|string|max:255|unique:dominios,nome',
            'status' => 'nullable|in:ativo,inativo,cancelado',
        ]);

        $dominio = Dominio::create($validated);

        return response()->json([
            'message' => 'Domínio criado com sucesso',
            'data' => $dominio->load(['cliente', 'assinatura.plano']),
        ], 201);
    }

    public function show(Dominio $dominio): JsonResponse
    {
        return response()->json([
            'data' => $dominio->load([
                'cliente',
                'assinatura.plano',
                'demandas',
                'vaults',
            ]),
        ]);
    }

    public function update(Request $request, Dominio $dominio): JsonResponse
    {
        $validated = $request->validate([
            'cliente_id' => 'sometimes|required|exists:clientes,id',
            'nome' => ['sometimes', 'required', 'string', 'max:255', Rule::unique('dominios')->ignore($dominio->id)],
            'status' => 'nullable|in:ativo,inativo,cancelado',
        ]);

        $dominio->update($validated);

        return response()->json([
            'message' => 'Domínio atualizado com sucesso',
            'data' => $dominio->fresh()->load(['cliente', 'assinatura.plano']),
        ]);
    }

    public function destroy(Dominio $dominio): JsonResponse
    {
        $dominio->delete();

        return response()->json([
            'message' => 'Domínio excluído com sucesso',
        ]);
    }
}
