<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\UserController;


// api.php
Route::prefix('v1')->group(function () {
    // Auth
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/login', [AuthController::class, 'login']);
    Route::post('/auth/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
    
    // Posts
    Route::apiResource('/posts', PostController::class)->middleware('auth:sanctum');
    // karen kalo delete itu engga support di apiResource
    Route::delete('/posts/{post}', [PostController::class, 'destroy'])->middleware('auth:sanctum');
    
    // Following
    Route::get('/following', [UserController::class, 'getFollowingsSelf'])->middleware('auth:sanctum');

    // followers
    Route::get("/followers", [UserController::class, 'getFollowersSelf'])->middleware('auth:sanctum');  
    
    // User actions
    Route::prefix('/users')->middleware('auth:sanctum')->group(function () {
        Route::get('/', [UserController::class, 'getUsersNotFollowed']);
        Route::get('/{username}', [UserController::class, 'getDetailUser']);
        Route::post('/{username}/follow', [UserController::class, 'follow']);
        Route::delete('/{username}/unfollow', [UserController::class, 'unfollow']);
        Route::put('/{username}/accept', [UserController::class, 'acceptFollowRequest']);
        Route::get('/{username}/followers', [UserController::class, 'getFollowersOther']);
        Route::get('/{username}/following', [UserController::class, 'getFollowingsOther']);
    });
});