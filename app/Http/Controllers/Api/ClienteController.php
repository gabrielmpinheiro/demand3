<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cliente;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ClienteController extends Controller
{
    private function logClientAction(string $level, string $action, array $data, string $message): void
    {
        $logPath = storage_path('logs/personal-logs/clientes.log');
        $logDir = dirname($logPath);

        if (!file_exists($logDir)) {
            mkdir($logDir, 0755, true);
        }

        $timestamp = now()->format('Y-m-d H:i:s');
        $dataStr = json_encode($data, JSON_UNESCAPED_UNICODE);
        $logMessage = "[{$timestamp}] {$level} [{$action}] Cliente: {$dataStr} | Message: {$message}\n";

        file_put_contents($logPath, $logMessage, FILE_APPEND);
    }
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Cliente::query();

            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('nome', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('cnpj', 'like', "%{$search}%")
                        ->orWhere('cpf', 'like', "%{$search}%");
                });
            }

            $clientes = $query->with(['dominios', 'assinaturas.plano'])
                ->orderBy('nome')
                ->paginate($request->get('per_page', 15));

            $this->logClientAction('INFO', 'LIST', ['count' => $clientes->total()], 'Clientes listados com sucesso');

            return response()->json($clientes);
        } catch (\Exception $e) {
            $this->logClientAction('ERROR', 'LIST', [], 'Erro ao listar clientes: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erro ao listar clientes',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'nome' => 'required|string|max:255',
                'email' => 'required|email|unique:clientes,email',
                'telefone' => 'nullable|string|max:20',
                'endereco' => 'nullable|string|max:255',
                'cidade' => 'nullable|string|max:100',
                'estado' => 'nullable|string|size:2',
                'cep' => 'nullable|string|max:9',
                'cnpj' => 'nullable|string|max:18|unique:clientes,cnpj',
                'cpf' => 'nullable|string|max:14|unique:clientes,cpf',
                'inscricao_estadual' => 'nullable|string|max:50',
                'inscricao_municipal' => 'nullable|string|max:50',
                'status' => 'nullable|in:ativo,inativo,cancelado',
            ]);

            $cliente = Cliente::create($validated);

            $this->logClientAction('INFO', 'CREATE', [
                'nome' => $cliente->nome,
                'email' => $cliente->email
            ], 'Cliente criado com sucesso');

            \App\Models\Notificacao::notificarAdmins(
                'Novo Cliente',
                "O cliente {$cliente->nome} foi cadastrado no sistema",
                null,
                $cliente->id,
                'info'
            );

            return response()->json([
                'message' => 'Cliente criado com sucesso',
                'data' => $cliente->load(['dominios', 'assinaturas.plano']),
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            $this->logClientAction('ERROR', 'CREATE', [
                'email' => $request->email ?? 'N/A'
            ], 'Validação falhou: ' . json_encode($e->errors()));
            throw $e;
        } catch (\Exception $e) {
            $this->logClientAction('ERROR', 'CREATE', [
                'email' => $request->email ?? 'N/A'
            ], 'Erro ao criar cliente: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erro ao criar cliente',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show(Cliente $cliente): JsonResponse
    {
        try {
            $this->logClientAction('INFO', 'SHOW', [
                'id' => $cliente->id,
                'nome' => $cliente->nome
            ], 'Cliente visualizado com sucesso');

            return response()->json([
                'data' => $cliente->load([
                    'dominios',
                    'assinaturas.plano',
                    'pagamentos',
                    'vaults',
                ]),
            ]);
        } catch (\Exception $e) {
            $this->logClientAction('ERROR', 'SHOW', [
                'id' => $cliente->id ?? 'N/A'
            ], 'Erro ao visualizar cliente: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erro ao visualizar cliente',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, Cliente $cliente): JsonResponse
    {
        try {
            $validated = $request->validate([
                'nome' => 'sometimes|required|string|max:255',
                'email' => ['sometimes', 'required', 'email', Rule::unique('clientes')->ignore($cliente->id)],
                'telefone' => 'nullable|string|max:20',
                'endereco' => 'nullable|string|max:255',
                'cidade' => 'nullable|string|max:100',
                'estado' => 'nullable|string|size:2',
                'cep' => 'nullable|string|max:9',
                'cnpj' => ['nullable', 'string', 'max:18', Rule::unique('clientes')->ignore($cliente->id)],
                'cpf' => ['nullable', 'string', 'max:14', Rule::unique('clientes')->ignore($cliente->id)],
                'inscricao_estadual' => 'nullable|string|max:50',
                'inscricao_municipal' => 'nullable|string|max:50',
                'status' => 'nullable|in:ativo,inativo,cancelado',
            ]);

            $cliente->update($validated);

            $this->logClientAction('INFO', 'UPDATE', [
                'id' => $cliente->id,
                'nome' => $cliente->nome,
                'email' => $cliente->email
            ], 'Cliente atualizado com sucesso');

            return response()->json([
                'message' => 'Cliente atualizado com sucesso',
                'data' => $cliente->fresh()->load(['dominios', 'assinaturas.plano']),
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            $this->logClientAction('ERROR', 'UPDATE', [
                'id' => $cliente->id
            ], 'Validação falhou: ' . json_encode($e->errors()));
            throw $e;
        } catch (\Exception $e) {
            $this->logClientAction('ERROR', 'UPDATE', [
                'id' => $cliente->id
            ], 'Erro ao atualizar cliente: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erro ao atualizar cliente',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy(Cliente $cliente): JsonResponse
    {
        try {
            $clienteData = [
                'id' => $cliente->id,
                'nome' => $cliente->nome,
                'email' => $cliente->email
            ];

            $cliente->delete();

            $this->logClientAction('INFO', 'DELETE', $clienteData, 'Cliente excluído com sucesso');

            return response()->json([
                'message' => 'Cliente excluído com sucesso',
            ]);
        } catch (\Exception $e) {
            $this->logClientAction('ERROR', 'DELETE', [
                'id' => $cliente->id ?? 'N/A'
            ], 'Erro ao excluir cliente: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erro ao excluir cliente',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
