<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\WalletController;
use App\Models\Category;
use App\Models\Currency;
use App\Models\Transaction;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/currencies', [Currency::class, 'index']);
    Route::get('/categories', [Category::class, 'index']);

    // wallet
    Route::get('/wallets', [WalletController::class, 'index']);
    Route::get('/wallets/{walletId}',[WalletController::class, 'show']);
    Route::post('/wallets', [WalletController::class, 'create']);
    Route::put('/wallets/{walletId}', [WalletController::class, 'update']);
    Route::delete('/wallets/{walletid}', [WalletController::class, 'destroy']);


    // transaksi

    Route::post('/transactions', [Transaction::class, 'create']);
    Route::delete('/transactions', [Transaction::class, 'destroy']);
    Route::get('/transactions', [Transaction::class,'index']);
});
