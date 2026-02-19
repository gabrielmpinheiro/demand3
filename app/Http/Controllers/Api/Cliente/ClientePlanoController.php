<?php

namespace App\Http\Controllers\Api\Cliente;

use App\Http\Controllers\Controller;
use App\Models\Plano;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClientePlanoController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $planos = Plano::where('status', 'ativo')
            ->orderBy('preco', 'asc')
            ->get();

        return response()->json([
            'data' => $planos,
        ]);
    }
}
