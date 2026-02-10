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
            $query->whereHas('demandas', function ($q) use ($request) {
                $q->where('id', $request->demanda_id);
            });
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $suportes = $query->with(['cliente', 'demandas'])
            ->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 15));

        return response()->json($suportes);
    }

    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'cliente_id' => 'required|exists:clientes,id',
                'mensagem' => 'nullable|string',
                'status' => 'nullable|in:aberto,em_andamento,concluido,cancelado',
            ]);

            $suporte = Suporte::create($validated);

            $this->log('INFO', 'Suporte criado com sucesso', ['id' => $suporte->id]);

            return response()->json([
                'message' => 'Suporte criado com sucesso',
                'data' => $suporte->load(['cliente', 'demandas']),
            ], 201);
        } catch (\Exception $e) {
            $this->log('ERROR', 'Erro ao criar suporte', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Erro ao criar suporte'], 500);
        }
    }

    public function show(Suporte $suporte): JsonResponse
    {
        return response()->json([
            'data' => $suporte->load(['cliente', 'demandas.dominio']),
        ]);
    }

    public function update(Request $request, Suporte $suporte): JsonResponse
    {
        try {
            $validated = $request->validate([
                'cliente_id' => 'sometimes|required|exists:clientes,id',
                'mensagem' => 'nullable|string',
                'status' => 'nullable|in:aberto,em_andamento,concluido,cancelado',
            ]);

            $suporte->update($validated);

            $this->log('INFO', 'Suporte atualizado com sucesso', ['id' => $suporte->id]);

            return response()->json([
                'message' => 'Suporte atualizado com sucesso',
                'data' => $suporte->fresh()->load(['cliente', 'demandas']),
            ]);
        } catch (\Exception $e) {
            $this->log('ERROR', 'Erro ao atualizar suporte', ['id' => $suporte->id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Erro ao atualizar suporte'], 500);
        }
    }

    public function destroy(Suporte $suporte): JsonResponse
    {
        // Verifica se há demandas pendentes (não concluídas e não canceladas)
        if ($suporte->demandas()->whereNotIn('status', ['concluido', 'cancelado'])->exists()) {
            $this->log('WARNING', 'Tentativa de excluir suporte com demandas pendentes', ['id' => $suporte->id]);
            return response()->json([
                'message' => 'Não é possível excluir o suporte pois existem demandas pendentes vinculadas.',
            ], 422);
        }

        try {
            $suporte->delete();
            $this->log('INFO', 'Suporte excluído com sucesso', ['id' => $suporte->id]);

            return response()->json([
                'message' => 'Suporte excluído com sucesso',
            ]);
        } catch (\Exception $e) {
            $this->log('ERROR', 'Erro ao excluir suporte', ['id' => $suporte->id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Erro ao excluir suporte'], 500);
        }
    }

    /**
     * Registra logs personalizados para o módulo de suporte
     */
    private function log(string $type, string $message, array $data = []): void
    {
        $logPath = base_path('logs/personal-logs/suporte.log');
        $logDir = dirname($logPath);

        if (!is_dir($logDir)) {
            mkdir($logDir, 0755, true);
        }

        $timestamp = now()->format('Y-m-d H:i:s');
        $logEntry = "[{$timestamp}] [{$type}] {$message} " . json_encode($data) . PHP_EOL;

        file_put_contents($logPath, $logEntry, FILE_APPEND);
    }
}
