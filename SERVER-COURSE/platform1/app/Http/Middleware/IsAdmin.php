<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class IsAdmin
{
    public function handle(Request $request, Closure $next)
    {
        if (!$request->user()?->isAdmin()) {
            return response()->json([
                'status'  => 'forbidden',
                'message' => 'You are not the administrator',
            ], 403);
        }

        return $next($request);
    }
}