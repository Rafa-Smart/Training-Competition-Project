<?php

/**
 * FILE: routes/api.php
 *
 * INI ADALAH "PETA JALAN" dari seluruh API kita.
 * Setiap baris di sini artinya: "kalau ada request ke URL ini, panggil fungsi ini di Controller ini"
 *
 * Ada 2 kelompok besar:
 * 1. Route PUBLIK  → bisa diakses siapa saja tanpa login (register, login)
 * 2. Route PRIVATE → wajib login dulu, dilindungi middleware 'auth:sanctum'
 *
 * Middleware 'auth:sanctum' tugasnya: cek header Authorization: Bearer <TOKEN>
 * Kalau tokennya tidak valid → otomatis balik error 401 Unauthenticated dari Sanctum
 */

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CurrencyController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\WalletController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\ReportController;

// =============================================
// ROUTE PUBLIK - Tidak butuh token
// =============================================
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']); // A1
    Route::post('/login',    [AuthController::class, 'login']);    // A2
});

// =============================================
// ROUTE PRIVATE - Wajib pakai token
// Semua route di dalam sini, kalau tidak ada token → 401 otomatis dari Sanctum
// =============================================
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/auth/logout', [AuthController::class, 'logout']); // A3

    // Currency & Category
    Route::get('/currencies',  [CurrencyController::class, 'index']);  // B1
    Route::get('/categories',  [CategoryController::class, 'index']);  // B2

    // Wallets
    Route::post('/wallets',            [WalletController::class, 'store']);   // C1
    Route::put('/wallets/{walletId}',  [WalletController::class, 'update']); // C2
    Route::delete('/wallets/{walletId}', [WalletController::class, 'destroy']); // C3
    Route::get('/wallets',             [WalletController::class, 'index']);   // C4
    Route::get('/wallets/{walletId}',  [WalletController::class, 'show']);    // C5

    // Transactions
    Route::post('/transactions',                   [TransactionController::class, 'store']);   // D1
    Route::delete('/transactions/{transactionId}', [TransactionController::class, 'destroy']); // D2
    Route::get('/transactions',                    [TransactionController::class, 'index']);   // D3

    // Reports
    Route::get('/reports/summary-by-category/expense', [ReportController::class, 'expenseSummary']); // E1
    Route::get('/reports/summary-by-category/income',  [ReportController::class, 'incomeSummary']);  // E2
});
