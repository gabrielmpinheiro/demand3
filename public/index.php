<?php

use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Load server-specific config (production only - sets APP_BASE_PATH)
if (file_exists(__DIR__ . '/_server_config.php')) {
    require __DIR__ . '/_server_config.php';
}

// Resolve the application base path
// In production (Locaweb): core is in a separate directory from public
// Locally: core is the parent directory of public (default)
$basePath = $_ENV['APP_BASE_PATH'] ?? __DIR__ . '/..';

// Determine if the application is in maintenance mode...
if (file_exists($maintenance = $basePath . '/storage/framework/maintenance.php')) {
    require $maintenance;
}

// Register the Composer autoloader...
require $basePath . '/vendor/autoload.php';

// Bootstrap Laravel and handle the request...
(require_once $basePath . '/bootstrap/app.php')
    ->handleRequest(Request::capture());
