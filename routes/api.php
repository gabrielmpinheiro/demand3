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

/*
|--------------------------------------------------------------------------
| API Routes - Área do Cliente
|--------------------------------------------------------------------------
*/

use App\Http\Controllers\Api\Cliente\ClienteAuthController;
use App\Http\Controllers\Api\Cliente\ClienteDashboardController;
use App\Http\Controllers\Api\Cliente\ClienteDominioController;
use App\Http\Controllers\Api\Cliente\ClienteAssinaturaController;
use App\Http\Controllers\Api\Cliente\ClientePagamentoController;
use App\Http\Controllers\Api\Cliente\ClienteSuporteController;
use App\Http\Controllers\Api\Cliente\ClienteNotificacaoController;
use App\Http\Controllers\Api\Cliente\ClienteUserController;
use App\Http\Controllers\Api\Cliente\ClientePlanoController;

// Rotas públicas do cliente
Route::prefix('client/auth')->group(function () {
    Route::post('/login', [ClienteAuthController::class, 'login']);
    Route::post('/register', [ClienteAuthController::class, 'register']);
});

// Rotas protegidas do cliente
Route::prefix('client')->middleware(['auth:sanctum', 'ensure.cliente'])->group(function () {
    // Dashboard
    Route::get('/dashboard/stats', [ClienteDashboardController::class, 'stats']);

    // Auth
    Route::post('/auth/logout', [ClienteAuthController::class, 'logout']);
    Route::get('/auth/user', [ClienteAuthController::class, 'user']);
    Route::put('/auth/password', [ClienteAuthController::class, 'updatePassword']);
    Route::put('/auth/profile', [ClienteAuthController::class, 'updateProfile']);

    // Domínios
    Route::apiResource('dominios', ClienteDominioController::class);

    // Assinaturas
    Route::apiResource('assinaturas', ClienteAssinaturaController::class)->only(['index', 'store']);

    // Pagamentos (Faturas)
    Route::get('pagamentos', [ClientePagamentoController::class, 'index']);
    Route::post('pagamentos/{pagamento}/marcar-pendente', [ClientePagamentoController::class, 'marcarPendente']);

    // Chamados (Suporte)
    Route::apiResource('suportes', ClienteSuporteController::class);

    // Notificações
    Route::apiResource('notificacoes', ClienteNotificacaoController::class)->only(['index', 'show']);
    Route::post('notificacoes/{notificacao}/marcar-lida', [ClienteNotificacaoController::class, 'marcarLida']);
    Route::post('notificacoes/marcar-todas-lidas', [ClienteNotificacaoController::class, 'marcarTodasLidas']);

    // Sub-usuários
    Route::apiResource('users', ClienteUserController::class)->only(['index', 'store', 'destroy']);

    // Planos disponíveis
    Route::get('planos', [ClientePlanoController::class, 'index']);
});

