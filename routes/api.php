<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ClienteController;
use App\Http\Controllers\Api\DominioController;
use App\Http\Controllers\Api\PlanoController;
use App\Http\Controllers\Api\AssinaturaController;
use App\Http\Controllers\Api\DemandaController;
use App\Http\Controllers\Api\PagamentoController;
use App\Http\Controllers\Api\SuporteController;
use App\Http\Controllers\Api\NotificacaoController;
use App\Http\Controllers\Api\VaultController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes - Sistema de Gerenciamento de Demandas
|--------------------------------------------------------------------------
*/

// Health check
Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'timestamp' => now()->toIso8601String(),
        'version' => '1.0.0',
    ]);
});

// Rotas públicas de autenticação
Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);
});

// Rotas protegidas por autenticação
Route::middleware('auth:sanctum')->group(function () {

    // Dashboard
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);

    // Auth
    Route::prefix('auth')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/user', [AuthController::class, 'user']);
        Route::put('/password', [AuthController::class, 'updatePassword']);
    });

    // Users (Admin management)
    Route::apiResource('users', UserController::class);

    // Clientes
    Route::apiResource('clientes', ClienteController::class);

    // Domínios
    Route::apiResource('dominios', DominioController::class);

    // Planos
    Route::apiResource('planos', PlanoController::class);

    // Assinaturas
    Route::apiResource('assinaturas', AssinaturaController::class);
    Route::post('assinaturas/{assinatura}/resetar-horas', [AssinaturaController::class, 'resetarHoras']);

    // Demandas
    Route::apiResource('demandas', DemandaController::class);
    Route::post('demandas/{demanda}/aprovar', [DemandaController::class, 'aprovar']);
    Route::post('demandas/{demanda}/concluir', [DemandaController::class, 'concluir']);
    Route::post('demandas/{demanda}/cancelar', [DemandaController::class, 'cancelar']);

    // Pagamentos
    Route::apiResource('pagamentos', PagamentoController::class);
    Route::post('pagamentos/{pagamento}/marcar-pago', [PagamentoController::class, 'marcarPago']);
    Route::post('pagamentos/{pagamento}/cancelar', [PagamentoController::class, 'cancelar']);
    Route::post('pagamentos/gerar-fatura', [PagamentoController::class, 'gerarFaturaMensal']);

    // Suporte
    Route::apiResource('suportes', SuporteController::class);

    // Notificações
    Route::apiResource('notificacoes', NotificacaoController::class);
    Route::post('notificacoes/{notificacao}/marcar-lida', [NotificacaoController::class, 'marcarLida']);
    Route::post('notificacoes/marcar-todas-lidas', [NotificacaoController::class, 'marcarTodasLidas']);
    Route::post('notificacoes/excluir-multiplas', [NotificacaoController::class, 'excluirMultiplas']);

    // Vault (Cofre de senhas)
    Route::apiResource('vault', VaultController::class);
    Route::get('vault/{vault}/revelar-senha', [VaultController::class, 'revelarSenha']);
});
