<?php

use App\Http\Middleware\CheckBlocked;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Routing\Exception\MethodNotAllowedException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        //

        $middleware->appendToGroup('api', CheckBlocked::class);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function(AuthenticationException $auth){
            $messagenya = str_contains($auth->getMessage(), 'Missing') ? "Missing token" :'Invalid token';


            return response()->json([
                "status"=> 'Unauthenticated.',
                'message'=>$messagenya
            ], 401);
        });

        $exceptions->render(function(NotFoundHttpException $notFound){
            return response()->json([
                'status'=>'not-found',
                'message'=>'Not found'
            ], 404);;
        });

        $exceptions->render(function(MethodNotAllowedException $notAllowed){
           return response()->json([
                'status'=>'not-found',
                'message'=>'Not found'
            ], 405);;
        });
    })->create();
