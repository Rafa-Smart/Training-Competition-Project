<?php

namespace App\Models;

/**
 * FILE: app/Models/Category.php
 *
 * Model untuk tabel 'categories'.
 * Berisi kategori transaksi seperti "Food & Drinks", "Salary", dll.
 *
 * Setiap kategori punya TYPE: 'INCOME' atau 'EXPENSE'.
 * TYPE ini sangat penting karena menentukan apakah transaksi
 * akan MENAMBAH atau MENGURANGI saldo wallet.
 *
 * RELASI:
 * Category hasMany Transaction → satu kategori bisa dipakai oleh banyak transaksi.
 * Kita daftarkan relasi ini agar bisa pakai eager loading:
 * Transaction::with('category') → otomatis ambil data kategori sekaligus.
 */

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    protected $fillable = ['name', 'icon', 'type'];

    // Satu kategori bisa punya banyak transaksi
    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }
}
