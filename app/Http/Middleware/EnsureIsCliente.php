<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureIsCliente
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user() || $request->user()->role !== 'cliente') {
            return response()->json([
                'message' => 'Acesso restrito a clientes.',
            ], 403);
        }

        return $next($request);
    }
}
