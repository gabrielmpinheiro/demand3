<!DOCTYPE html>
<html lang="pt-BR">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Demand3 Admin</title>
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/admin_app.jsx'])
</head>

<body class="bg-gray-50 text-gray-900 font-sans antialiased">
    <!-- Modelo base do admin -->
    <div id="admin-root"></div>
</body>

</html>