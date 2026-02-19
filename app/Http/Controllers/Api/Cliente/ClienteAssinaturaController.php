<?php

namespace App\Http\Controllers\Api\Cliente;

use App\Http\Controllers\Controller;
use App\Models\Assinatura;
use App\Models\Dominio;
use App\Models\Plano;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClienteAssinaturaController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $cliente = $request->user()->cliente;
        $dominioIds = $cliente->dominios()->pluck('id');

        $query = Assinatura::whereIn('dominio_id', $dominioIds);

        if ($request->has('dominio_id')) {
            $query->where('dominio_id', $request->dominio_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $assinaturas = $query->with(['plano', 'dominio'])
            ->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 15));

        return response()->json($assinaturas);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'dominio_id' => 'required|exists:dominios,id',
            'plano_id' => 'required|exists:planos,id',
        ]);

        try {
            $cliente = $request->user()->cliente;
            $dominio = Dominio::findOrFail($validated['dominio_id']);

            // Verifica se o domínio pertence ao cliente
            if ($dominio->cliente_id !== $cliente->id) {
                return response()->json(['message' => 'Acesso negado'], 403);
            }

            // Verifica se já tem assinatura ativa
            if ($dominio->assinatura) {
                return response()->json([
                    'message' => 'Este domínio já possui uma assinatura ativa.',
                ], 422);
            }

            $plano = Plano::findOrFail($validated['plano_id']);

            $assinatura = Assinatura::create([
                'cliente_id' => $cliente->id,
                'dominio_id' => $dominio->id,
                'plano_id' => $plano->id,
                'horas_disponiveis' => $plano->limite_horas_tecnicas,
                'status' => 'ativo',
                'data_inicio' => now(),
            ]);

            $this->log('INFO', 'Assinatura criada pelo cliente', [
                'id' => $assinatura->id,
                'dominio' => $dominio->nome,
                'plano' => $plano->nome,
            ]);

            return response()->json([
                'message' => 'Plano assinado com sucesso',
                'data' => $assinatura->load(['plano', 'dominio']),
            ], 201);
        } catch (\Exception $e) {
            $this->log('ERROR', 'Erro ao assinar plano', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Erro ao assinar plano'], 500);
        }
    }

    private function log(string $type, string $message, array $data = []): void
    {
        $logPath = base_path('logs/personal-logs/cliente-assinaturas.log');
        $logDir = dirname($logPath);
        if (!is_dir($logDir)) {
            mkdir($logDir, 0755, true);
        }
        $timestamp = now()->format('Y-m-d H:i:s');
        $logEntry = "[{$timestamp}] [{$type}] {$message} " . json_encode($data) . PHP_EOL;
        file_put_contents($logPath, $logEntry, FILE_APPEND);
    }
}
