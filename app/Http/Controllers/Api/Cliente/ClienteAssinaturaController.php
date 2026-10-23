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
        return response()->json([
            'message' => 'A contratação e atribuição de planos aos domínios é realizada exclusivamente pela administração.',
        ], 403);
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
