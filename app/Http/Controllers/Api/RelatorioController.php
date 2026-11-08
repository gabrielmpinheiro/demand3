<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cliente;
use App\Services\RelatorioService;
use App\Services\EmailNotificacaoService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Controller de Relatório de Horas — Área do Admin.
 *
 * Permite:
 *  - Gerar relatório geral (todos os clientes) ou filtrado por cliente
 *  - Filtrar por intervalo de datas e tipo (completo | simples)
 *  - Enviar relatório por e-mail ao cliente
 */
class RelatorioController extends Controller
{
    public function __construct(private readonly RelatorioService $relatorioService) {}

    /**
     * Gera o relatório de horas.
     *
     * Query params:
     *   - cliente_id   (opcional) — filtra por cliente específico
     *   - data_inicio  (opcional) — default: 1º do mês corrente (Y-m-d)
     *   - data_fim     (opcional) — default: último dia do mês corrente (Y-m-d)
     *   - tipo         (opcional) — 'completo' (default) | 'simples'
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'cliente_id'  => 'nullable|exists:clientes,id',
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

        // ── Relatório de um cliente específico ──────────────────────────────
        if ($request->filled('cliente_id')) {
            $cliente = Cliente::findOrFail($request->cliente_id);

            $relatorio = $this->relatorioService->gerar($cliente, $dataInicio, $dataFim, $tipo);

            $this->log('INFO', 'Relatório gerado (admin, cliente único)', [
                'cliente_id'  => $cliente->id,
                'data_inicio' => $dataInicio->toDateString(),
                'data_fim'    => $dataFim->toDateString(),
                'tipo'        => $tipo,
            ]);

            return response()->json(['data' => $relatorio]);
        }

        // ── Relatório geral — todos os clientes ativos ──────────────────────
        $clientes = Cliente::where('status', 'ativo')
            ->orderBy('nome')
            ->get();

        $relatorios = $clientes->map(function (Cliente $cliente) use ($dataInicio, $dataFim, $tipo) {
            return $this->relatorioService->gerar($cliente, $dataInicio, $dataFim, $tipo);
        })->values();

        $this->log('INFO', 'Relatório geral gerado (admin)', [
            'total_clientes' => $clientes->count(),
            'data_inicio'    => $dataInicio->toDateString(),
            'data_fim'       => $dataFim->toDateString(),
            'tipo'           => $tipo,
        ]);

        return response()->json([
            'data' => $relatorios,
            'meta' => [
                'total_clientes' => $clientes->count(),
                'periodo'        => [
                    'inicio' => $dataInicio->toDateString(),
                    'fim'    => $dataFim->toDateString(),
                ],
                'tipo' => $tipo,
            ],
        ]);
    }

    /**
     * Envia o relatório de horas de um cliente por e-mail (somente admin).
     *
     * Body:
     *   - cliente_id   (obrigatório)
     *   - data_inicio  (opcional)
     *   - data_fim     (opcional)
     *   - tipo         (opcional) — 'completo' | 'simples'
     */
    public function enviarEmail(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'cliente_id'  => 'required|exists:clientes,id',
            'data_inicio' => 'nullable|date_format:Y-m-d',
            'data_fim'    => 'nullable|date_format:Y-m-d|after_or_equal:data_inicio',
            'tipo'        => 'nullable|in:completo,simples',
        ]);

        $cliente = Cliente::findOrFail($validated['cliente_id']);

        $dataInicio = isset($validated['data_inicio'])
            ? Carbon::parse($validated['data_inicio'])->startOfDay()
            : Carbon::now()->startOfMonth();

        $dataFim = isset($validated['data_fim'])
            ? Carbon::parse($validated['data_fim'])->endOfDay()
            : Carbon::now()->endOfMonth();

        $tipo = $validated['tipo'] ?? 'completo';

        $relatorio = $this->relatorioService->gerar($cliente, $dataInicio, $dataFim, $tipo);

        $emailDestinatario = $cliente->email ?? $cliente->user?->email;

        if (!$emailDestinatario) {
            return response()->json([
                'message' => 'O cliente não possui e-mail cadastrado.',
            ], 422);
        }

        try {
            (new EmailNotificacaoService())->relatorioHorasCliente($cliente, $relatorio, $dataInicio, $dataFim);

            $this->log('INFO', 'Relatório enviado por e-mail (admin)', [
                'cliente_id'   => $cliente->id,
                'destinatario' => $emailDestinatario,
                'tipo'         => $tipo,
            ]);

            return response()->json([
                'message'      => "Relatório enviado com sucesso para {$emailDestinatario}.",
                'destinatario' => $emailDestinatario,
            ]);
        } catch (\Throwable $e) {
            $this->log('ERROR', 'Falha ao enviar relatório por e-mail', [
                'cliente_id' => $cliente->id,
                'erro'       => $e->getMessage(),
            ]);

            return response()->json(['message' => 'Falha ao enviar e-mail do relatório.'], 500);
        }
    }

    private function log(string $type, string $message, array $data = []): void
    {
        $logPath = base_path('logs/personal-logs/relatorios.log');
        $logDir  = dirname($logPath);

        if (!is_dir($logDir)) {
            mkdir($logDir, 0755, true);
        }

        $timestamp = now()->format('Y-m-d H:i:s');
        $logEntry  = "[{$timestamp}] [{$type}] {$message} " . json_encode($data) . PHP_EOL;

        file_put_contents($logPath, $logEntry, FILE_APPEND);
    }
}

