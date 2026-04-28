<?php

namespace App\Http\Controllers;

/**
 * FILE: app/Http/Controllers/CurrencyController.php
 *
 * Controller ini menangani satu endpoint saja:
 * GET /api/currencies → tampilkan semua mata uang yang tersedia.
 *
 * Controller ini sangat simpel karena:
 * 1. Semua error 401 (Unauthenticated) sudah ditangani otomatis oleh Sanctum
 *    di middleware 'auth:sanctum' yang dipasang di routes/api.php
 * 2. Tidak ada validasi input karena ini endpoint GET tanpa parameter
 * 3. Tidak ada logika bisnis rumit — tinggal ambil semua data dan kembalikan
 *
 * Ini adalah pola paling sederhana dalam project ini. Hapalkan dulu ini 
 * sebagai "template dasar" controller, lalu controller lain tinggal ditambah logika.
 */

use App\Models\Currency;

class CurrencyController extends Controller
{
    /**
     * index() → GET /api/currencies
     *
     * Alur:
     * 1. Sanctum sudah pastikan user login (kalau tidak → 401 sebelum masuk ke sini)
     * 2. Ambil semua data dari tabel currencies
     * 3. Return dalam format yang diminta soal
     */
    public function index()
    {
        $currencies = Currency::all();

        return response()->json([
            'message' => 'Get all currencies successful',
            'data'    => [
                'currencies' => $currencies,
            ],
        ], 200);
    }
}
