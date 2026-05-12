<?php

use App\Http\Middleware\CheckBlocked;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        api: __DIR__.'/../routes/api.php',
        apiPrefix: 'api',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Attach CheckBlocked middleware to every authenticated API request
        $middleware->appendToGroup('api', CheckBlocked::class);
    })
    ->withExceptions(function (Exceptions $exceptions) {

        // ── 401: Missing / invalid token ──────────────────────────
        $exceptions->render(function (AuthenticationException $e, Request $request) {
            $message = str_contains($e->getMessage(), 'Missing')
                ? 'Missing token'
                : 'Invalid token';

            return response()->json([
                'status' => 'unauthenticated',
                'message' => $message,
            ], 401);
        });

        // ── 404: Route or model not found ─────────────────────────
        $exceptions->render(function (NotFoundHttpException $e, Request $request) {
            return response()->json([
                'status' => 'not-found',
                'message' => 'Not found',
            ], 404);
        });

        // ── 405: Method not allowed ───────────────────────────────
        $exceptions->render(function (MethodNotAllowedHttpException $e, Request $request) {
            return response()->json([
                'status' => 'not-found',
                'message' => 'Not found',
            ], 404);
        });

    })->create();
