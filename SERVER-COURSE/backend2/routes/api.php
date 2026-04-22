<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/login', [AuthController::class, 'login']);

    Route::middleware(['auth:sanctum'])->group(function () {
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::apiResource('/posts', PostController::class);
        Route::delete('/posts/{id}', [PostController::class, 'destroy']);
        Route::get('/following', [UserController::class, 'getFollowing']);
        Route::get('/followers', [UserController::class, 'getFollower']);

        Route::prefix('/users')->group(function () {
            Route::get('/', action: [UserController::class, 'getUsers']);
            Route::get('/{username}', [UserController::class, 'detailUser']);
            Route::post('/{username}/follow', [UserController::class, 'follow']);
            Route::delete('/{username}/unfollow', [UserController::class, 'unFollow']);
            Route::put('/{username}/accept', [UserController::class, 'acceptFollowRequest']);
            Route::get('/{username}/followers', [UserController::class, 'getFollowerOther']);
            Route::get('/{username}/following', [UserController::class, 'getFollowingOther']);
        });
    });

});
