<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Assinatura;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AssinaturaController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Assinatura::query();

        if ($request->has('cliente_id')) {
            $query->where('cliente_id', $request->cliente_id);
        }

        if ($request->has('dominio_id')) {
            $query->where('dominio_id', $request->dominio_id);
        }

        if ($request->has('plano_id')) {
            $query->where('plano_id', $request->plano_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $assinaturas = $query->with(['cliente', 'dominio', 'plano'])
            ->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 15));

        return response()->json($assinaturas);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'cliente_id' => 'required|exists:clientes,id',
            'dominio_id' => 'required|exists:dominios,id|unique:assinaturas,dominio_id,NULL,id,deleted_at,NULL',
            'plano_id' => 'required|exists:planos,id',
            'status' => 'nullable|in:ativo,inativo,cancelado',
            'data_inicio' => 'nullable|date',
            'data_fim' => 'nullable|date|after:data_inicio',
        ]);

        // Define horas disponíveis baseado no plano
        $plano = \App\Models\Plano::find($validated['plano_id']);
        $validated['horas_disponiveis'] = $plano->limite_horas_tecnicas;
        $validated['data_inicio'] = $validated['data_inicio'] ?? now();

        $assinatura = Assinatura::create($validated);

        return response()->json([
            'message' => 'Assinatura criada com sucesso',
            'data' => $assinatura->load(['cliente', 'dominio', 'plano']),
        ], 201);
    }

    public function show(Assinatura $assinatura): JsonResponse
    {
        return response()->json([
            'data' => $assinatura->load([
                'cliente',
                'dominio',
                'plano',
                'demandas',
                'pagamentos',
            ]),
        ]);
    }

    public function update(Request $request, Assinatura $assinatura): JsonResponse
    {
        $validated = $request->validate([
            'cliente_id' => 'sometimes|required|exists:clientes,id',
            'dominio_id' => 'sometimes|required|exists:dominios,id',
            'plano_id' => 'sometimes|required|exists:planos,id',
            'horas_disponiveis' => 'nullable|numeric|min:0',
            'status' => 'nullable|in:ativo,inativo,cancelado',
            'data_inicio' => 'nullable|date',
            'data_fim' => 'nullable|date',
        ]);

        // Se mudar o plano, reseta as horas
        if (isset($validated['plano_id']) && $validated['plano_id'] != $assinatura->plano_id) {
            $plano = \App\Models\Plano::find($validated['plano_id']);
            $validated['horas_disponiveis'] = $plano->limite_horas_tecnicas;
        }

        $assinatura->update($validated);

        return response()->json([
            'message' => 'Assinatura atualizada com sucesso',
            'data' => $assinatura->fresh()->load(['cliente', 'dominio', 'plano']),
        ]);
    }

    public function destroy(Assinatura $assinatura): JsonResponse
    {
        $assinatura->delete();

        return response()->json([
            'message' => 'Assinatura excluída com sucesso',
        ]);
    }

    /**
     * Reseta as horas da assinatura para o limite do plano
     */
    public function resetarHoras(Assinatura $assinatura): JsonResponse
    {
        $assinatura->resetarHoras();

        return response()->json([
            'message' => 'Horas resetadas com sucesso',
            'data' => $assinatura->fresh()->load(['cliente', 'dominio', 'plano']),
        ]);
    }
}
