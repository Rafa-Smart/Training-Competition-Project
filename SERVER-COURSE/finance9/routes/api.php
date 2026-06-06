<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoryController; 
use App\Http\Controllers\CurrencyController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\WalletController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function(){
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

Route::middleware('auth:sanctum')->group(function(){
    Route::get('/categories', [CategoryController::class,'index']);
    Route::get('/currencies', [CurrencyController::class,'index']);
    Route::apiResource('/wallets', WalletController::class);
    Route::apiResource('/transactions', TransactionController::class);
    // atua bsia jgua gini y
    Route::apiResources([
        'wallets'=>WalletController::class,
        'transactions'=>TransactionController::class
    ]);
    

    Route::get('/reports/summary-by-category/expense');
    Route::get('/reports/summary-by-category/income');
});
