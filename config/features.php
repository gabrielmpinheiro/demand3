<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Feature Flags / Alternância de Recursos
    |--------------------------------------------------------------------------
    |
    | Aqui você pode ativar ou desativar recursos da aplicação de forma simples.
    | Altere os valores para true (ativado) ou false (desativado).
    | Também é possível sobrescrever via variáveis de ambiente no arquivo .env.
    |
    */

    'client' => [
        // Área de faturas do cliente (temporariamente desativada)
        'invoices' => env('FEATURE_CLIENT_INVOICES', false),

        // Demais módulos do painel do cliente
        'subscriptions' => env('FEATURE_CLIENT_SUBSCRIPTIONS', true),
        'tickets' => env('FEATURE_CLIENT_TICKETS', true),
        'domains' => env('FEATURE_CLIENT_DOMAINS', true),
        'vault' => env('FEATURE_CLIENT_VAULT', true),
        'users' => env('FEATURE_CLIENT_USERS', true),
        'notifications' => env('FEATURE_CLIENT_NOTIFICATIONS', true),
    ],
];
