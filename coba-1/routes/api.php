<?php
// routes/api.php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\UserController;

// Auth Routes
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
});

// Protected Routes
Route::middleware('auth:sanctum')->group(function () {
    // Posts
    Route::apiResource('posts', PostController::class)->except(['update']);
    
    // Following
    Route::post('/users/{username}/follow', [UserController::class, 'follow']);
    Route::delete('/users/{username}/unfollow', [UserController::class, 'unfollow']);
    Route::get('/following', [UserController::class, 'getFollowing']);
    
    // Followers
    Route::put('/users/{username}/accept', [UserController::class, 'acceptFollowRequest']);
    Route::get('/users/{username}/followers', [UserController::class, 'getFollowers']);
    
    // Users
    Route::get('/users', [UserController::class, 'getUsersNotFollowed']);
    Route::get('/users/{username}', [UserController::class, 'show']);
});