<?php

namespace App\Models;

/**
 * FILE: app/Models/Transaction.php
 *
 * Model untuk tabel 'transactions'.
 * Transaksi adalah catatan keuangan dalam sebuah wallet.
 *
 * Setiap transaksi selalu punya:
 * - wallet_id   → milik wallet mana
 * - category_id → kategori apa (dan dari sini kita tahu income/expense)
 * - amount      → jumlah uangnya (selalu positif, tipe income/expense yang menentukan arah)
 * - date        → tanggal kejadian
 * - note        → catatan tambahan (boleh kosong)
 *
 * RELASI:
 * - belongsTo Wallet   → transaksi ini ada di wallet mana
 * - belongsTo Category → transaksi ini masuk kategori apa
 *
 * Kedua relasi ini kita butuhkan untuk eager loading di TransactionController:
 * Transaction::with(['wallet', 'category']) → satu query langsung dapat semua data
 */

use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    protected $fillable = [
        'wallet_id',
        'category_id',
        'amount',
        'date',
        'note',
    ];

    // Relasi: transaksi ini ada di satu wallet
    public function wallet()
    {
        return $this->belongsTo(Wallet::class);
    }

    // Relasi: transaksi ini punya satu kategori
    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}
