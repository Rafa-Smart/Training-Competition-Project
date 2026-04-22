<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::prefix('v1')->group(function () {
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/login', [AuthController::class, 'login']);
    Route::middleware(['auth:sanctum'])->group(function () {
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::delete('/posts/{id}', [PostController::class, 'destroy']);
        Route::post('/posts', [PostController::class, 'store']);
        Route::get('/posts', [PostController::class, 'index']);
        Route::get('/follower', [UserController::class, 'getFollowerUsers']);

        Route::prefix('/users')->group(function () {
            Route::get('/', [UserController::class, 'getUsers']);
            Route::post('/{username}/follow', [UserController::class, 'follow']);
            Route::delete('/{username}/unfollow', [UserController::class, 'unFollow']);
            Route::put('/{username}/accept', [UserController::class, 'acceptFollow']);
            Route::get('/{username}/followers', [UserController::class,'getFollowerUsersOther']);
            Route::get('/{username}/following', [UserController::class,'getFollowingUsersOther']);
            Route::get('/{username}', [UserController::class,'getProfile']);
        });
    });
});
