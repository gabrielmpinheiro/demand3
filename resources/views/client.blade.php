<!DOCTYPE html>
<html lang="pt-BR">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta name="description" content="Demand3 - Área do Cliente | Gerencie suas demandas, chamados e faturas">
    <title>Demand3 - Área do Cliente</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/client_app.jsx'])
</head>

<body class="bg-gray-50 text-gray-900 font-sans antialiased" style="font-family: 'Inter', sans-serif;">
    <div id="client-root"></div>
</body>

</html>