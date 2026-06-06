<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CurrencyController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\WalletController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function(){
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
});

Route::middleware('auth:sanctum')->group(function(){
    Route::post('/auth/logout', [AuthController::class,'logout']);
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/currencies', [CurrencyController::class, 'index']);
    Route::apiResource('wallet', WalletController::class);
    Route::apiResource('transaction', TransactionController::class);

    Route::get('/api/reports/summary-by-category/income', [ReportController::class, 'income']);
    Route::get('/api/reports/summary-by-category/expense', [ReportController::class, 'expense']);
});