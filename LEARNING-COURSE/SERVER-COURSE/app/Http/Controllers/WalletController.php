<?php

namespace App\Http\Controllers;

/**
 * FILE: app/Http/Controllers/WalletController.php
 *
 * Controller ini menangani semua endpoint WALLET:
 * - store()   → POST   /api/wallets            (C1) Buat wallet baru
 * - update()  → PUT    /api/wallets/:walletId   (C2) Edit nama wallet
 * - destroy() → DELETE /api/wallets/:walletId   (C3) Hapus wallet
 * - index()   → GET    /api/wallets            (C4) Ambil semua wallet milik user
 * - show()    → GET    /api/wallets/:walletId   (C5) Ambil detail satu wallet
 *
 * POLA PENTING DI SINI:
 * Setiap fungsi yang melibatkan walletId selalu melakukan 3 pengecekan berurutan:
 * 1. Cek apakah wallet EXIST → kalau tidak ada → 404 Not Found
 * 2. Cek apakah wallet MILIK user ini → kalau bukan → 403 Forbidden
 * 3. Kalau lolos keduanya → proses operasi
 *
 * Urutan ini PENTING. Kalau dibalik (cek ownership dulu baru cek exist),
 * bisa bocor informasi: user tahu bahwa wallet ID tertentu ada tapi bukan miliknya.
 * Standar keamanan yang benar: cek exist dulu, baru cek ownership.
 */

use App\Http\Requests\StoreWalletRequest;
use App\Http\Requests\UpdateWalletRequest;
use App\Models\Wallet; 

class WalletController extends Controller
{
    /**
     * store() → POST /api/wallets
     *
     * Alur:
     * 1. Validasi input via StoreWalletRequest (name & currency_code)
     * 2. Buat wallet baru dengan user_id dari user yang sedang login
     * 3. Return data wallet yang baru dibuat dengan status 201
     *
     * Kenapa pakai auth()->id()?
     * Karena kita tidak percaya input dari user untuk menentukan siapa pemilik wallet.
     * Kita ambil sendiri dari token yang sedang aktif → lebih aman.
     */
    public function store(StoreWalletRequest $request)
    {
        $wallet = Wallet::create([
            'user_id'       => auth()->id(),
            'name'          => $request->name,
            'currency_code' => $request->currency_code,
        ]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Wallet added successful',
            'data'    => $wallet,
        ], 201);
    }

    /**
     * update() → PUT /api/wallets/{walletId}
     *
     * Alur:
     * 1. Cari wallet berdasarkan {walletId} dari URL
     *    → Jika tidak ketemu: return 404
     * 2. Cek apakah wallet ini milik user yang sedang login
     *    → Jika bukan miliknya: return 403
     * 3. Validasi input via UpdateWalletRequest (hanya 'name')
     * 4. Update nama wallet dan return data terbaru
     */
    public function update(UpdateWalletRequest $request, $walletId)
    {
        // Pengecekan 1: Apakah wallet ini ada?
        $wallet = Wallet::find($walletId);

        if (!$wallet) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Not found',
            ], 404);
        }

        // Pengecekan 2: Apakah wallet ini milik user yang sedang login?
        if ($wallet->user_id !== auth()->id()) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Forbidden access',
            ], 403);
        }

        // Lolos semua pengecekan → lakukan update
        $wallet->update(['name' => $request->name]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Wallet updated successful',
            'data'    => $wallet,
        ], 200);
    }

    /**
     * destroy() → DELETE /api/wallets/{walletId}
     *
     * Alur sama dengan update():
     * 1. Cari wallet → 404 jika tidak ada
     * 2. Cek ownership → 403 jika bukan miliknya
     * 3. Hapus wallet (Soft Delete → kolom deleted_at diisi, data tidak benar-benar hilang)
     *
     * Kenapa Soft Delete?
     * Karena wallet terhubung ke banyak transaksi. Kalau wallet dihapus permanen,
     * transaksi-transaksi lamanya jadi kehilangan referensi. Dengan soft delete,
     * data histori tetap aman di database.
     */
    public function destroy($walletId)
    {
        $wallet = Wallet::find($walletId);

        if (!$wallet) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Not found',
            ], 404);
        }

        if ($wallet->user_id !== auth()->id()) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Forbidden access',
            ], 403);
        }

        // delete() di sini sebenarnya adalah Soft Delete karena Model pakai SoftDeletes trait
        $wallet->delete();

        return response()->json([
            'status'  => 'success',
            'message' => 'Wallet deleted successful',
        ], 200);
    }

    /**
     * index() → GET /api/wallets
     *
     * Ambil SEMUA wallet milik user yang sedang login.
     *
     * Kenapa filter dengan user_id = auth()->id()?
     * Karena kita tidak boleh tampilkan wallet milik user lain.
     * Setiap user hanya boleh lihat wallet miliknya sendiri.
     *
     * Response menyertakan 'balance' karena kita sudah set $appends = ['balance']
     * di Wallet model → accessor getBalanceAttribute() otomatis dipanggil.
     */
    public function index()
    {
        $wallets = Wallet::where('user_id', auth()->id())->get();

        return response()->json([
            'status'  => 'success',
            'message' => 'Get all wallets successful',
            'data'    => [
                'wallets' => $wallets,
            ],
        ], 200);
    }

    /**
     * show() → GET /api/wallets/{walletId}
     *
     * Ambil detail SATU wallet berdasarkan ID-nya.
     *
     * Sama seperti update/destroy: cek exist dulu, baru cek ownership.
     * Bedanya fungsi ini tidak mengubah data, hanya membaca.
     */
    public function show($walletId)
    {
        $wallet = Wallet::find($walletId);

        if (!$wallet) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Not found',
            ], 404);
        }

        if ($wallet->user_id !== auth()->id()) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Forbidden access',
            ], 403);
        }

        return response()->json([
            'status'  => 'success',
            'message' => 'Get detail wallet successful',
            'data'    => $wallet,
        ], 200);
    }
}
