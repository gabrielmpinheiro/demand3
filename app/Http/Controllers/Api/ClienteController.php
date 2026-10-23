<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cliente;
use App\Models\User;
use App\Services\EmailNotificacaoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
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

            if ($request->has('is_parceiro')) {
                $query->where('is_parceiro', filter_var($request->is_parceiro, FILTER_VALIDATE_BOOLEAN));
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
                'nome'                => 'required|string|max:255',
                'email'               => 'required|email|unique:clientes,email|unique:users,email',
                'password'            => 'nullable|string|min:8',
                'gerar_senha'         => 'nullable|boolean',
                'telefone'            => 'nullable|string|max:20',
                'endereco'            => 'nullable|string|max:255',
                'cidade'              => 'nullable|string|max:100',
                'estado'              => 'nullable|string|size:2',
                'cep'                 => 'nullable|string|max:9',
                'cnpj'                => 'nullable|string|max:18|unique:clientes,cnpj',
                'cpf'                 => 'nullable|string|max:14|unique:clientes,cpf',
                'inscricao_estadual'  => 'nullable|string|max:50',
                'inscricao_municipal' => 'nullable|string|max:50',
                'status'              => 'nullable|in:ativo,inativo,cancelado',
            ]);

            // Determina a senha: informada, gerada ou nenhuma
            $senhaPlana = null;
            if (!empty($validated['password'])) {
                $senhaPlana = $validated['password'];
            } elseif (!empty($validated['gerar_senha'])) {
                $senhaPlana = Str::password(12);
            }

            $cliente = DB::transaction(function () use ($validated, $senhaPlana) {
                $user = null;

                if ($senhaPlana !== null) {
                    // Cria o User de acesso vinculado ao e-mail principal do cliente
                    $user = User::create([
                        'name'     => $validated['nome'],
                        'email'    => $validated['email'],
                        'password' => Hash::make($senhaPlana),
                        'role'     => 'cliente',
                        'status'   => 'ativo',
                    ]);
                }

                $clienteData = collect($validated)
                    ->except(['password', 'gerar_senha'])
                    ->toArray();

                if ($user) {
                    $clienteData['user_id'] = $user->id;
                }

                return Cliente::create($clienteData);
            });

            $this->logClientAction('INFO', 'CREATE', [
                'nome'          => $cliente->nome,
                'email'         => $cliente->email,
                'acesso_criado' => $cliente->user_id !== null,
            ], 'Cliente criado com sucesso');

            // Envia e-mail de boas-vindas com credenciais se houver senha
            if ($senhaPlana !== null && $cliente->user_id) {
                try {
                    (new EmailNotificacaoService())->credenciaisCliente(
                        $cliente->user,
                        $senhaPlana
                    );
                } catch (\Exception $emailEx) {
                    $this->logClientAction('WARNING', 'CREATE_EMAIL', [
                        'cliente_id' => $cliente->id,
                    ], 'Falha ao enviar e-mail de credenciais: ' . $emailEx->getMessage());
                }
            }

            \App\Models\Notificacao::notificarAdmins(
                'Novo Cliente',
                "O cliente {$cliente->nome} foi cadastrado no sistema",
                null,
                $cliente->id,
                'info'
            );

            return response()->json([
                'message'       => 'Cliente criado com sucesso',
                'acesso_criado' => $cliente->user_id !== null,
                'data'          => $cliente->load(['dominios', 'assinaturas.plano']),
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
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Provisiona acesso (User) para um cliente já cadastrado sem credencial de login.
     * Útil para clientes criados antes desta correção ou sem senha definida.
     */
    public function provisionarAcesso(Request $request, Cliente $cliente): JsonResponse
    {
        try {
            if ($cliente->user_id && $cliente->user) {
                return response()->json([
                    'message' => 'Este cliente já possui acesso ao sistema.',
                ], 422);
            }

            $validated = $request->validate([
                'password'    => 'nullable|string|min:8',
                'gerar_senha' => 'nullable|boolean',
            ]);

            $senhaPlana = null;
            if (!empty($validated['password'])) {
                $senhaPlana = $validated['password'];
            } elseif (!empty($validated['gerar_senha'])) {
                $senhaPlana = Str::password(12);
            }

            if ($senhaPlana === null) {
                return response()->json([
                    'message' => 'Informe uma senha ou solicite geração automática (gerar_senha: true).',
                ], 422);
            }

            // Verifica se já existe um User com o mesmo e-mail (possível conta órfã)
            $userExistente = User::where('email', $cliente->email)->first();
            if ($userExistente) {
                return response()->json([
                    'message' => 'Já existe um usuário cadastrado com o e-mail deste cliente. Vincule manualmente se necessário.',
                    'user_id' => $userExistente->id,
                ], 422);
            }

            $user = DB::transaction(function () use ($cliente, $senhaPlana) {
                $user = User::create([
                    'name'     => $cliente->nome,
                    'email'    => $cliente->email,
                    'password' => Hash::make($senhaPlana),
                    'role'     => 'cliente',
                    'status'   => 'ativo',
                ]);
                $cliente->update(['user_id' => $user->id]);
                return $user;
            });

            $this->logClientAction('INFO', 'PROVISIONAR_ACESSO', [
                'cliente_id' => $cliente->id,
                'user_id'    => $user->id,
            ], 'Acesso provisionado com sucesso');

            try {
                (new EmailNotificacaoService())->credenciaisCliente($user, $senhaPlana);
            } catch (\Exception $emailEx) {
                $this->logClientAction('WARNING', 'PROVISIONAR_ACESSO_EMAIL', [
                    'cliente_id' => $cliente->id,
                ], 'Falha ao enviar e-mail: ' . $emailEx->getMessage());
            }

            return response()->json([
                'message' => 'Acesso provisionado com sucesso. As credenciais foram enviadas por e-mail.',
                'data'    => $cliente->fresh()->load(['user', 'dominios', 'assinaturas.plano']),
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            throw $e;
        } catch (\Exception $e) {
            $this->logClientAction('ERROR', 'PROVISIONAR_ACESSO', [
                'cliente_id' => $cliente->id,
            ], 'Erro ao provisionar acesso: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erro ao provisionar acesso',
                'error'   => $e->getMessage(),
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

            $data = $cliente->load([
                'dominios',
                'assinaturas.plano',
                'pagamentos',
                'vaults',
            ]);

            $response = $data->toArray();
            if ($cliente->is_parceiro) {
                $response['parceria_stats'] = $cliente->parceria_stats;
            }

            return response()->json(['data' => $response]);
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
                'is_parceiro' => 'nullable|boolean',
                'parceria_inicio' => 'nullable|date',
                'parceria_fim' => 'nullable|date|after_or_equal:parceria_inicio',
                'valor_hora_avulsa' => 'nullable|numeric|min:0',
                'valor_hora_subsidiada' => 'nullable|numeric|min:0',
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

    /**
     * Ativa/desativa o status de parceiro de um cliente e configura os valores
     */
    public function toggleParceiro(Request $request, Cliente $cliente): JsonResponse
    {
        try {
            $validated = $request->validate([
                'is_parceiro' => 'required|boolean',
                'parceria_inicio' => 'nullable|date',
                'parceria_fim' => 'nullable|date|after_or_equal:parceria_inicio',
                'valor_hora_avulsa' => 'nullable|numeric|min:0',
                'valor_hora_subsidiada' => 'nullable|numeric|min:0',
            ]);

            $cliente->update($validated);

            $action = $validated['is_parceiro'] ? 'ATIVADO' : 'DESATIVADO';
            $this->logClientAction('INFO', "PARCEIRO_{$action}", [
                'id' => $cliente->id,
                'nome' => $cliente->nome,
            ], "Parceria {$action} com sucesso");

            return response()->json([
                'message' => 'Configuração de parceria atualizada com sucesso',
                'data' => $cliente->fresh()->load(['dominios', 'assinaturas.plano']),
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            throw $e;
        } catch (\Exception $e) {
            $this->logClientAction('ERROR', 'TOGGLE_PARCEIRO', [
                'id' => $cliente->id
            ], 'Erro ao configurar parceria: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erro ao configurar parceria',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Retorna as métricas de parceria de um cliente
     */
    public function parceriaStats(Cliente $cliente): JsonResponse
    {
        if (!$cliente->is_parceiro) {
            return response()->json(['message' => 'Cliente não é parceiro'], 422);
        }

        return response()->json([
            'data' => $cliente->parceria_stats,
        ]);
    }
}
