<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\GameController;
use App\Http\Controllers\ScoreController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\AdminController;
use App\Http\Middleware\IsAdmin;
use Illuminate\Support\Facades\Route;

// ── Public ────────────────────────────────────────────────────────
Route::prefix('v1')->group(function () {

    // Auth
    Route::post('auth/signup',  [AuthController::class, 'signup']);
    Route::post('auth/signin',  [AuthController::class, 'signin']);

    // Games (public read)
    Route::get('games',          [GameController::class, 'index']);
    Route::get('games/{slug}',   [GameController::class, 'show']);
    Route::get('games/{slug}/scores', [ScoreController::class, 'index']);

    // Serve game files (public static)
    Route::get('users/{username}', [UserController::class, 'show']);

    // ── Protected ─────────────────────────────────────────────────
    Route::middleware('auth:sanctum')->group(function () {

        // Auth
        Route::post('auth/signout', [AuthController::class, 'signout']);

        // Games (write)
        Route::post('games',               [GameController::class, 'store']);
        Route::put('games/{slug}',         [GameController::class, 'update']);
        Route::delete('games/{slug}',      [GameController::class, 'destroy']);
        Route::post('games/{slug}/upload', [GameController::class, 'upload']);

        // Scores (write)
        Route::post('games/{slug}/scores', [ScoreController::class, 'store']);

        // Users & Admins (admin only)
        Route::middleware(IsAdmin::class)->group(function () {
            Route::get('admins',         [AdminController::class, 'index']);
            Route::get('users',          [UserController::class, 'index']);
            Route::post('users',         [UserController::class, 'store']);
            Route::put('users/{id}',     [UserController::class, 'update']);
            Route::delete('users/{id}',  [UserController::class, 'destroy']);
        });
    });
});