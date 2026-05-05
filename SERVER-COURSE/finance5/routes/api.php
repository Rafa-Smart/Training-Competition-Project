<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CurrencyController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\WalletController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/currencies', [CurrencyController::class, 'index']);
    Route::get('/categories', [CategoryController::class, 'index']);

    Route::apiResource('/wallets', WalletController::class);

    Route::post('/transactions', [TransactionController::class, 'store']);
    Route::delete(`transactions/{transactionId}`, [TransactionController::class, 'destroy']);
    Route::get('/transactions', [TransactionController::class, 'index']);

    Route::get('/reports/summary-by-category/expense', [ReportController::class, 'summaryExpense']);

    Route::get('/reports/summary-by-category/income', [ReportController::class, 'summaryIncome']);
});
