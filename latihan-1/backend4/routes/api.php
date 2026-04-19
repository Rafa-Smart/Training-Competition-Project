<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\PostController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');


Route::prefix(('v1'))->group(function() {
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/login', [AuthController::class, 'login']);

    Route::middleware(['auth:sanctum'])->group(function() {
        Route::post("/posts", [PostController::class, 'store']);
        Route::get("/posts", [PostController::class, 'index']);
        Route::delete("/posts/{id}", [PostController::class, 'destroy']);
    });
});