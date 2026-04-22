<?php

namespace App\Exceptions;

use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Throwable;

class Handler extends ExceptionHandler
{
    public function render($request, Throwable $e)
    {
        if ($e instanceof AuthenticationException) {
            return response()->json([
                'message' => 'Unauthorization',
                'errors' => $e,
            ], 401);
        }
        if ($e instanceof AuthorizationException) {
            return response()->json([
                'message' => 'forbidden',
                'errors' => $e,
            ], 403);
        }
        if ($e instanceof ValidationException) {
            return response()->json([
                'message' => 'validation is failed',
                'errors' => $e,
            ], 422);
        }
        if ($e instanceof ModelNotFoundException) {
            return response()->json([
                'message' => 'data is not found',
                'errors' => $e,
            ], 403);
        }

        if ($e instanceof NotFoundHttpException) {
            return response()->json(['message' => 'Endpoint not found'], 404);
        }

        return response()->json(['message' => 'Internal server error'], 500);
    }
}
// REQUEST
//  ↓
// MIDDLEWARE
//  ↓
// FORM REQUEST (authorize + rules)
//  ↓
// ROUTE MODEL BINDING
//  ↓
// EXCEPTION PIPELINE (bootstrap/app.php)
//  ↓
// JSON RESPONSE

// baca ini plis
// https://chatgpt.com/c/69539756-a4fc-8322-b40c-33bb16271317
// /di bagian akhir aja
