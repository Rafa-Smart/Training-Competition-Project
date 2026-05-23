<?php

namespace App\Http\Controllers;

/**
 * FILE: app/Http/Controllers/CategoryController.php
 *
 * Controller ini menangani satu endpoint:
 * GET /api/categories → tampilkan semua kategori transaksi.
 *
 * Persis sama polanya dengan CurrencyController.
 * Perbedaan satu-satunya adalah Model yang dipakai (Category vs Currency)
 * dan pesan response-nya.
 *
 * Ini sengaja dibuat terpisah (bukan dijadikan satu dengan CurrencyController)
 * supaya setiap controller punya tanggung jawab yang jelas dan terfokus.
 * Prinsip ini disebut "Single Responsibility Principle".
 */

use App\Models\Category;

class CategoryController extends Controller
{
    /**
     * index() → GET /api/categories
     *
     * Alur:
     * 1. Sanctum cek token → kalau tidak valid, 401 sebelum sampai ke sini
     * 2. Ambil semua kategori
     * 3. Return sesuai format soal
     */
    public function index()
    {
        $categories = Category::all();

        return response()->json([
            'status'  => 'success',
            'message' => 'Get all categories successful',
            'data'    => [
                'categories' => $categories,
            ],
        ], 200);
    }
}
