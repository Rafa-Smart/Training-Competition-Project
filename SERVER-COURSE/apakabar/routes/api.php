<?php

use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\PostController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {

    Route::get('/posts', [PostController::class, 'index']);

    Route::get('/posts/{slug}', [PostController::class, 'show']);

    Route::get('/categories', [CategoryController::class, 'index']);

});