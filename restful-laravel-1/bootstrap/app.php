<?php

// ingettt yang Request ituu inii
// dan kalo engg apake type hint juga ga papa
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

// ini coba baca errornya ya
// https://chatgpt.com/c/6953b25e-6bf0-8323-b5dc-842541633d97

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
        // nah semua error ayng ada kita taruh di sini
        // dan nanti tuh udah otomatis di cek errornya sama si laravel
        $exceptions->render(function (AuthenticationException $e, Request $request) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'unauthorized',
                    'errors' => $e->getMessage(),
                ], 401);
            }
        });
        $exceptions->render(function (AuthorizationException $e, Request $request) {
            return response()->json([
                'message' => 'forbidden',
                'errors' => $e->getMessage(),
            ], 403);
        });
        $exceptions->render(function (ValidationException $e, Request $request) {
            return response()->json([
                'message' => 'validation wrong',
                'errors' => $e->getMessage(),
            ], 422);
        });

        // jadi disni cek aja si NotHttpnya
        // karena NotFoundModel itu ada didalam si NotHttp
        $exceptions->render(function (NotFoundHttpException $e, Request $request) {
            // return response()->json([
            //     'message'=>'todo is not found',
            //     "errors"=>$e->getMessage()
            // ], 404);
            // itu ga bisa karena errornya itu sudah di bungkus oleh si notfoundhttp
            // jadi harus cek duulu
            $previous = $e->getPrevious();

            if ($previous instanceof ModelNotFoundException) {
                return response()->json([
                    'message' => 'todo is not found',
                    'errors' => $previous->getMessage(),
                ], 404);
            }

            return response()->json([
                'message' => 'endpoint is not found',
                'errors' => $e->getMessage(),
            ], 404);
        });
       
        $exceptions->render(function (MethodNotAllowedHttpException $e, Request $request) {
            return response()->json([
                'message' => 'method is not match',
                'errors' => $e->getMessage(),
            ], 404);
        });

        $exceptions->render(function(UniqueConstraintViolationException $e, Request $request) {
            return response()->json([
                'message'=>"data is already exists",
                "errros"=>$e->getMessage()
            ]);
        });
    })->create();


    // nih lihat
//     Todo::findOrFail(47)

//  Lempar ModelNotFoundException

// Laravel menangkap

// Laravel membungkus menjadi:

// NotFoundHttpException


// Yang dikirim ke exception handler hanyalah:

// NotFoundHttpException


//  ModelNotFoundException disimpan sebagai $e->getPrevious()