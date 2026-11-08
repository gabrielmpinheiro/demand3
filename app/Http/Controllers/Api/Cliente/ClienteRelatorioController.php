<?php

namespace App\Http\Controllers\Api\Cliente;

use App\Http\Controllers\Controller;
use App\Services\RelatorioService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Controller de Relatório de Horas — Área do Cliente.
 *
 * O cliente visualiza apenas seu próprio relatório,
 * com as mesmas categorias de horas do relatório admin:
 *  - horas do plano
 *  - horas técnicas cobertas pelo saldo do plano
 *  - horas técnicas excedentes (billable)
 *  - horas técnicas avulsas (sem plano)
 */
class ClienteRelatorioController extends Controller
{
    public function __construct(private readonly RelatorioService $relatorioService) {}

    /**
     * Gera o relatório de horas do cliente autenticado.
     *
     * Query params:
     *   - data_inicio  (opcional) — default: 1º do mês corrente (Y-m-d)
     *   - data_fim     (opcional) — default: último dia do mês corrente (Y-m-d)
     *   - tipo         (opcional) — 'completo' (default) | 'simples'
     */
    public function index(Request $request): JsonResponse
    {
        $cliente = $request->user()->cliente;

        if (!$cliente) {
            return response()->json(['message' => 'Cliente não encontrado.'], 404);
        }

        $request->validate([
            'data_inicio' => 'nullable|date_format:Y-m-d',
            'data_fim'    => 'nullable|date_format:Y-m-d|after_or_equal:data_inicio',
            'tipo'        => 'nullable|in:completo,simples',
        ]);

        $dataInicio = $request->filled('data_inicio')
            ? Carbon::parse($request->data_inicio)->startOfDay()
            : Carbon::now()->startOfMonth();

        $dataFim = $request->filled('data_fim')
            ? Carbon::parse($request->data_fim)->endOfDay()
            : Carbon::now()->endOfMonth();

        $tipo = $request->get('tipo', 'completo');

        $relatorio = $this->relatorioService->gerar($cliente, $dataInicio, $dataFim, $tipo);

        $this->log('INFO', 'Relatório gerado pelo cliente', [
            'cliente_id'  => $cliente->id,
            'data_inicio' => $dataInicio->toDateString(),
            'data_fim'    => $dataFim->toDateString(),
            'tipo'        => $tipo,
        ]);

        return response()->json(['data' => $relatorio]);
    }

    private function log(string $type, string $message, array $data = []): void
    {
        $logPath = base_path('logs/personal-logs/cliente-relatorios.log');
        $logDir  = dirname($logPath);

        if (!is_dir($logDir)) {
            mkdir($logDir, 0755, true);
        }

        $timestamp = now()->format('Y-m-d H:i:s');
        $logEntry  = "[{$timestamp}] [{$type}] {$message} " . json_encode($data) . PHP_EOL;

        file_put_contents($logPath, $logEntry, FILE_APPEND);
    }
}

