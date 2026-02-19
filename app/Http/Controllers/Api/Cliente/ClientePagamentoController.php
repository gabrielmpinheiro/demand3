<?php

namespace App\Http\Controllers\Api\Cliente;

use App\Http\Controllers\Controller;
use App\Models\Pagamento;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClientePagamentoController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $cliente = $request->user()->cliente;

        $query = Pagamento::where('cliente_id', $cliente->id);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('referencia_mes')) {
            $query->where('referencia_mes', $request->referencia_mes);
        }

        $pagamentos = $query->with(['assinatura.plano', 'assinatura.dominio'])
            ->orderBy('data_vencimento', 'desc')
            ->paginate($request->get('per_page', 15));

        return response()->json($pagamentos);
    }

    /**
     * Marca a fatura como pendente de conferência (cliente clicou em "Pagar")
     */
    public function marcarPendente(Request $request, Pagamento $pagamento): JsonResponse
    {
        $cliente = $request->user()->cliente;

        if ($pagamento->cliente_id !== $cliente->id) {
            return response()->json(['message' => 'Acesso negado'], 403);
        }

        if ($pagamento->status !== 'aberto') {
            return response()->json([
                'message' => 'Apenas faturas em aberto podem ser marcadas para pagamento.',
            ], 422);
        }

        try {
            $pagamento->status = 'pendente_conferencia';
            $pagamento->save();

            $this->log('INFO', 'Fatura marcada como pendente de conferência', [
                'pagamento_id' => $pagamento->id,
                'cliente_id' => $cliente->id,
            ]);

            // Notifica admins
            \App\Models\Notificacao::notificarAdmins(
                'Pagamento pendente de conferência',
                "O cliente {$cliente->nome} informou o pagamento da fatura #{$pagamento->id} (R$ " . number_format((float) $pagamento->valor, 2, ',', '.') . "). Verifique o recebimento.",
                null,
                $cliente->id,
                'pagamento'
            );

            return response()->json([
                'message' => 'Pagamento informado com sucesso. Aguarde a confirmação.',
                'data' => $pagamento->fresh()->load(['assinatura.plano', 'assinatura.dominio']),
            ]);
        } catch (\Exception $e) {
            $this->log('ERROR', 'Erro ao marcar fatura pendente', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Erro ao processar pagamento'], 500);
        }
    }

    private function log(string $type, string $message, array $data = []): void
    {
        $logPath = base_path('logs/personal-logs/cliente-pagamentos.log');
        $logDir = dirname($logPath);
        if (!is_dir($logDir)) {
            mkdir($logDir, 0755, true);
        }
        $timestamp = now()->format('Y-m-d H:i:s');
        $logEntry = "[{$timestamp}] [{$type}] {$message} " . json_encode($data) . PHP_EOL;
        file_put_contents($logPath, $logEntry, FILE_APPEND);
    }
}
