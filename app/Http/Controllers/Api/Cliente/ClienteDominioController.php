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
            'nome' => 'required|string|max:255',
        ]);

        try {
            $cliente = $request->user()->cliente;

            // Sanitiza o nome do domínio
            $nomeSanitizado = $this->sanitizarDominio($validated['nome']);

            // Valida unicidade após sanitização
            if (Dominio::where('nome', $nomeSanitizado)->exists()) {
                return response()->json([
                    'message' => 'Registro de domínio duplicado.',
                    'errors' => ['nome' => ['Este domínio já está cadastrado.']]
                ], 422);
            }

            $dominio = Dominio::create([
                'cliente_id' => $cliente->id,
                'nome' => $nomeSanitizado,
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
            'nome' => 'sometimes|required|string|max:255',
        ]);

        try {
            // Sanitiza o nome do domínio se fornecido
            if (isset($validated['nome'])) {
                $nomeSanitizado = $this->sanitizarDominio($validated['nome']);

                // Valida unicidade após sanitização
                if (Dominio::where('nome', $nomeSanitizado)->where('id', '!=', $dominio->id)->exists()) {
                    return response()->json([
                        'message' => 'Registro de domínio duplicado.',
                        'errors' => ['nome' => ['Este domínio já está cadastrado.']]
                    ], 422);
                }

                $validated['nome'] = $nomeSanitizado;
            }

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

    /**
     * Sanitiza o nome do domínio, removendo http://, https:// e www.
     */
    private function sanitizarDominio(string $nome): string
    {
        $nome = preg_replace('#^https?://#i', '', $nome);
        $nome = preg_replace('#^www\.#i', '', $nome);
        $nome = rtrim($nome, '/');
        return strtolower(trim($nome));
    }
}
