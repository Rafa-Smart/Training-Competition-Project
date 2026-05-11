<?php

use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        //
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (AuthenticationException $authenticationException, Request $request) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized',
            ]);
        });
        $exceptions->render(function (NotFoundHttpException $notFoundHttpException, Request $request) {
            return response()->json([
                'status' => 'error',
                'message' => 'Not Found',
            ]);
        });
    })->create();
