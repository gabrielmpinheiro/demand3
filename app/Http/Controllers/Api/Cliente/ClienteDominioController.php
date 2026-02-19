<?php

namespace App\Http\Controllers\Api\Cliente;

use App\Http\Controllers\Controller;
use App\Models\Dominio;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClienteDominioController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $cliente = $request->user()->cliente;

        $query = Dominio::where('cliente_id', $cliente->id);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('search')) {
            $query->where('nome', 'like', "%{$request->search}%");
        }

        $dominios = $query->with(['assinatura.plano'])
            ->withCount('demandas')
            ->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 15));

        return response()->json($dominios);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nome' => 'required|string|max:255|unique:dominios,nome',
        ]);

        try {
            $cliente = $request->user()->cliente;

            $dominio = Dominio::create([
                'cliente_id' => $cliente->id,
                'nome' => $validated['nome'],
                'status' => 'ativo',
            ]);

            $this->log('INFO', 'Domínio criado pelo cliente', ['id' => $dominio->id, 'nome' => $dominio->nome]);

            return response()->json([
                'message' => 'Domínio cadastrado com sucesso',
                'data' => $dominio->load(['assinatura.plano']),
            ], 201);
        } catch (\Exception $e) {
            $this->log('ERROR', 'Erro ao criar domínio', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Erro ao cadastrar domínio'], 500);
        }
    }

    public function show(Request $request, Dominio $dominio): JsonResponse
    {
        $cliente = $request->user()->cliente;

        if ($dominio->cliente_id !== $cliente->id) {
            return response()->json(['message' => 'Acesso negado'], 403);
        }

        return response()->json([
            'data' => $dominio->load(['assinatura.plano', 'demandas']),
        ]);
    }

    public function update(Request $request, Dominio $dominio): JsonResponse
    {
        $cliente = $request->user()->cliente;

        if ($dominio->cliente_id !== $cliente->id) {
            return response()->json(['message' => 'Acesso negado'], 403);
        }

        $validated = $request->validate([
            'nome' => 'sometimes|required|string|max:255|unique:dominios,nome,' . $dominio->id,
        ]);

        try {
            $dominio->update($validated);
            $this->log('INFO', 'Domínio atualizado pelo cliente', ['id' => $dominio->id]);

            return response()->json([
                'message' => 'Domínio atualizado com sucesso',
                'data' => $dominio->fresh()->load(['assinatura.plano']),
            ]);
        } catch (\Exception $e) {
            $this->log('ERROR', 'Erro ao atualizar domínio', ['id' => $dominio->id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Erro ao atualizar domínio'], 500);
        }
    }

    public function destroy(Request $request, Dominio $dominio): JsonResponse
    {
        $cliente = $request->user()->cliente;

        if ($dominio->cliente_id !== $cliente->id) {
            return response()->json(['message' => 'Acesso negado'], 403);
        }

        if ($dominio->demandas()->whereNotIn('status', ['concluido', 'cancelado'])->exists()) {
            return response()->json([
                'message' => 'Não é possível excluir o domínio pois existem demandas pendentes.',
            ], 422);
        }

        try {
            $dominio->delete();
            $this->log('INFO', 'Domínio excluído pelo cliente', ['id' => $dominio->id]);

            return response()->json(['message' => 'Domínio excluído com sucesso']);
        } catch (\Exception $e) {
            $this->log('ERROR', 'Erro ao excluir domínio', ['id' => $dominio->id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Erro ao excluir domínio'], 500);
        }
    }

    private function log(string $type, string $message, array $data = []): void
    {
        $logPath = base_path('logs/personal-logs/cliente-dominios.log');
        $logDir = dirname($logPath);
        if (!is_dir($logDir)) {
            mkdir($logDir, 0755, true);
        }
        $timestamp = now()->format('Y-m-d H:i:s');
        $logEntry = "[{$timestamp}] [{$type}] {$message} " . json_encode($data) . PHP_EOL;
        file_put_contents($logPath, $logEntry, FILE_APPEND);
    }
}
