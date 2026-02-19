<?php

namespace App\Http\Controllers\Api\Cliente;

use App\Http\Controllers\Controller;
use App\Models\Suporte;
use App\Models\Notificacao;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClienteSuporteController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $cliente = $request->user()->cliente;

        $query = Suporte::where('cliente_id', $cliente->id);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('dominio_id')) {
            $query->where('dominio_id', $request->dominio_id);
        }

        $suportes = $query->with(['dominio', 'demandas'])
            ->withCount('demandas')
            ->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 15));

        return response()->json($suportes);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'dominio_id' => 'nullable|exists:dominios,id',
            'mensagem' => 'required|string',
        ]);

        try {
            $cliente = $request->user()->cliente;

            // Verifica que o domínio pertence ao cliente
            if (isset($validated['dominio_id'])) {
                $dominio = $cliente->dominios()->find($validated['dominio_id']);
                if (!$dominio) {
                    return response()->json(['message' => 'Domínio não pertence à sua conta'], 403);
                }
            }

            $suporte = Suporte::create([
                'cliente_id' => $cliente->id,
                'dominio_id' => $validated['dominio_id'] ?? null,
                'mensagem' => $validated['mensagem'],
                'status' => 'aberto',
            ]);

            // Notifica admins
            Notificacao::notificarAdmins(
                'Novo chamado do cliente',
                "O cliente {$cliente->nome} abriu um novo chamado: {$validated['mensagem']}",
                null,
                $cliente->id,
                'suporte'
            );

            $this->log('INFO', 'Chamado criado pelo cliente', ['id' => $suporte->id, 'cliente' => $cliente->nome]);

            return response()->json([
                'message' => 'Chamado aberto com sucesso',
                'data' => $suporte->load(['dominio', 'demandas']),
            ], 201);
        } catch (\Exception $e) {
            $this->log('ERROR', 'Erro ao criar chamado', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Erro ao abrir chamado'], 500);
        }
    }

    public function show(Request $request, Suporte $suporte): JsonResponse
    {
        $cliente = $request->user()->cliente;

        if ($suporte->cliente_id !== $cliente->id) {
            return response()->json(['message' => 'Acesso negado'], 403);
        }

        return response()->json([
            'data' => $suporte->load(['dominio', 'demandas.dominio']),
        ]);
    }

    public function update(Request $request, Suporte $suporte): JsonResponse
    {
        $cliente = $request->user()->cliente;

        if ($suporte->cliente_id !== $cliente->id) {
            return response()->json(['message' => 'Acesso negado'], 403);
        }

        $validated = $request->validate([
            'mensagem' => 'sometimes|required|string',
        ]);

        try {
            $suporte->update($validated);
            $this->log('INFO', 'Chamado atualizado pelo cliente', ['id' => $suporte->id]);

            return response()->json([
                'message' => 'Chamado atualizado com sucesso',
                'data' => $suporte->fresh()->load(['dominio', 'demandas']),
            ]);
        } catch (\Exception $e) {
            $this->log('ERROR', 'Erro ao atualizar chamado', ['id' => $suporte->id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Erro ao atualizar chamado'], 500);
        }
    }

    public function destroy(Request $request, Suporte $suporte): JsonResponse
    {
        $cliente = $request->user()->cliente;

        if ($suporte->cliente_id !== $cliente->id) {
            return response()->json(['message' => 'Acesso negado'], 403);
        }

        if ($suporte->demandas()->whereNotIn('status', ['concluido', 'cancelado'])->exists()) {
            return response()->json([
                'message' => 'Não é possível excluir o chamado pois existem demandas pendentes.',
            ], 422);
        }

        try {
            $suporte->delete();
            $this->log('INFO', 'Chamado excluído pelo cliente', ['id' => $suporte->id]);

            return response()->json(['message' => 'Chamado excluído com sucesso']);
        } catch (\Exception $e) {
            $this->log('ERROR', 'Erro ao excluir chamado', ['id' => $suporte->id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Erro ao excluir chamado'], 500);
        }
    }

    private function log(string $type, string $message, array $data = []): void
    {
        $logPath = base_path('logs/personal-logs/cliente-suporte.log');
        $logDir = dirname($logPath);
        if (!is_dir($logDir)) {
            mkdir($logDir, 0755, true);
        }
        $timestamp = now()->format('Y-m-d H:i:s');
        $logEntry = "[{$timestamp}] [{$type}] {$message} " . json_encode($data) . PHP_EOL;
        file_put_contents($logPath, $logEntry, FILE_APPEND);
    }
}
