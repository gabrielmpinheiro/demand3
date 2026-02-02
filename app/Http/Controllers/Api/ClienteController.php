<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cliente;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ClienteController extends Controller
{
    public function index(Request $request): JsonResponse
    {
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

        return response()->json($clientes);
    }

    public function store(Request $request): JsonResponse
    {
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

        return response()->json([
            'message' => 'Cliente criado com sucesso',
            'data' => $cliente->load(['dominios', 'assinaturas.plano']),
        ], 201);
    }

    public function show(Cliente $cliente): JsonResponse
    {
        return response()->json([
            'data' => $cliente->load([
                'dominios',
                'assinaturas.plano',
                'pagamentos',
                'vaults',
            ]),
        ]);
    }

    public function update(Request $request, Cliente $cliente): JsonResponse
    {
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

        return response()->json([
            'message' => 'Cliente atualizado com sucesso',
            'data' => $cliente->fresh()->load(['dominios', 'assinaturas.plano']),
        ]);
    }

    public function destroy(Cliente $cliente): JsonResponse
    {
        $cliente->delete();

        return response()->json([
            'message' => 'Cliente excluído com sucesso',
        ]);
    }
}
