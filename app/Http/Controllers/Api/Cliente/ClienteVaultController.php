<?php

namespace App\Http\Controllers\Api\Cliente;

use App\Http\Controllers\Controller;
use App\Models\Vault;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClienteVaultController extends Controller
{
    /**
     * Lista as credenciais do cliente logado
     */
    public function index(Request $request): JsonResponse
    {
        $cliente = $request->user()->cliente;

        if (!$cliente) {
            return response()->json(['message' => 'Cliente não encontrado'], 404);
        }

        $query = Vault::where('cliente_id', $cliente->id)->with('dominio');

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('servico', 'like', "%{$search}%")
                    ->orWhere('login', 'like', "%{$search}%")
                    ->orWhere('url', 'like', "%{$search}%")
                    ->orWhere('notas', 'like', "%{$search}%");
            });
        }

        if ($request->has('dominio_id') && $request->dominio_id) {
            $query->where('dominio_id', $request->dominio_id);
        }

        $vaults = $query->orderBy('servico')->get();

        // Oculta a senha na listagem
        $vaults->makeHidden('senha');

        return response()->json(['data' => $vaults]);
    }

    /**
     * Exibe detalhes de uma credencial (sem senha)
     */
    public function show(Request $request, Vault $vault): JsonResponse
    {
        $cliente = $request->user()->cliente;

        if (!$cliente || $vault->cliente_id !== $cliente->id) {
            return response()->json(['message' => 'Acesso negado'], 403);
        }

        $vault->load('dominio');
        $vault->makeHidden('senha');

        return response()->json(['data' => $vault]);
    }

    /**
     * Cria uma nova credencial
     */
    public function store(Request $request): JsonResponse
    {
        $cliente = $request->user()->cliente;

        if (!$cliente) {
            return response()->json(['message' => 'Cliente não encontrado'], 404);
        }

        $validated = $request->validate([
            'servico' => 'required|string|max:255',
            'login' => 'required|string|max:255',
            'senha' => 'required|string|max:255',
            'url' => 'nullable|string|max:255',
            'dominio_id' => 'nullable|exists:dominios,id',
            'notas' => 'nullable|string',
        ]);

        // Verifica se o domínio pertence ao cliente
        if (isset($validated['dominio_id'])) {
            $dominioDoCliente = $cliente->dominios()->where('id', $validated['dominio_id'])->exists();
            if (!$dominioDoCliente) {
                return response()->json(['message' => 'Domínio não pertence a este cliente'], 403);
            }
        }

        $validated['cliente_id'] = $cliente->id;

        try {
            $vault = Vault::create($validated);
            $vault->load('dominio');
            $vault->makeHidden('senha');

            return response()->json([
                'message' => 'Credencial criada com sucesso',
                'data' => $vault,
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Erro ao criar credencial'], 500);
        }
    }

    /**
     * Atualiza uma credencial
     */
    public function update(Request $request, Vault $vault): JsonResponse
    {
        $cliente = $request->user()->cliente;

        if (!$cliente || $vault->cliente_id !== $cliente->id) {
            return response()->json(['message' => 'Acesso negado'], 403);
        }

        $validated = $request->validate([
            'servico' => 'sometimes|required|string|max:255',
            'login' => 'sometimes|required|string|max:255',
            'senha' => 'sometimes|required|string|max:255',
            'url' => 'nullable|string|max:255',
            'dominio_id' => 'nullable|exists:dominios,id',
            'notas' => 'nullable|string',
        ]);

        // Verifica se o domínio pertence ao cliente
        if (isset($validated['dominio_id'])) {
            $dominioDoCliente = $cliente->dominios()->where('id', $validated['dominio_id'])->exists();
            if (!$dominioDoCliente) {
                return response()->json(['message' => 'Domínio não pertence a este cliente'], 403);
            }
        }

        try {
            $vault->update($validated);
            $vault->load('dominio');
            $vault->makeHidden('senha');

            return response()->json([
                'message' => 'Credencial atualizada com sucesso',
                'data' => $vault,
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Erro ao atualizar credencial'], 500);
        }
    }

    /**
     * Exclui uma credencial
     */
    public function destroy(Request $request, Vault $vault): JsonResponse
    {
        $cliente = $request->user()->cliente;

        if (!$cliente || $vault->cliente_id !== $cliente->id) {
            return response()->json(['message' => 'Acesso negado'], 403);
        }

        try {
            $vault->delete();
            return response()->json(['message' => 'Credencial excluída com sucesso']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Erro ao excluir credencial'], 500);
        }
    }

    /**
     * Revela a senha de uma credencial
     */
    public function revelarSenha(Request $request, Vault $vault): JsonResponse
    {
        $cliente = $request->user()->cliente;

        if (!$cliente || $vault->cliente_id !== $cliente->id) {
            return response()->json(['message' => 'Acesso negado'], 403);
        }

        return response()->json(['data' => ['senha' => $vault->senha]]);
    }
}
