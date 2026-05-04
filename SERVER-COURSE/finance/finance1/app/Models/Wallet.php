<?php

namespace App\Models;

/**
 * FILE: app/Models/Wallet.php
 *
 * Model untuk tabel 'wallets'.
 * Wallet adalah "dompet" milik user. Satu user bisa punya banyak wallet.
 *
 * FITUR SOFT DELETE:
 * Kita pakai SoftDeletes → ketika wallet "dihapus", Laravel tidak benar-benar
 * DELETE dari database. Melainkan mengisi kolom 'deleted_at' dengan timestamp.
 * Efeknya: query normal tidak akan menemukan wallet yang sudah dihapus,
 * tapi datanya masih ada di database (berguna untuk histori/audit).
 * Ini sesuai dengan schema di ER Diagram yang punya kolom 'deleted_at'.
 *
 * COMPUTED ATTRIBUTE 'balance':
 * Balance (saldo) tidak disimpan sebagai kolom di database!
 * Saldo dihitung DINAMIS setiap kali diperlukan:
 * saldo = total INCOME - total EXPENSE dari semua transaksi wallet ini.
 * Cara kerjanya ada di accessor getBalanceAttribute() di bawah.
 *
 * RELASI:
 * - belongsTo User → wallet ini milik siapa
 * - hasMany Transaction → satu wallet punya banyak transaksi
 */

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Wallet extends Model
{
    // Aktifkan fitur Soft Delete
    use SoftDeletes;

    protected $fillable = ['user_id', 'name', 'currency_code'];

    // Tambahkan 'balance' ke array yang di-append saat model di-serialize ke JSON
    // Tanpa ini, getBalanceAttribute() tidak akan muncul di response JSON
    protected $appends = ['balance'];

    /**
     * ACCESSOR: getBalanceAttribute()
     *
     * Accessor adalah fungsi yang dipanggil otomatis saat kita akses $wallet->balance.
     * Naming convention Laravel: get + NamaAtribut + Attribute
     * Jadi 'balance' → getBalanceAttribute()
     *
     * CARA HITUNG SALDO:
     * 1. Ambil semua transaksi wallet ini, gabungkan dengan data kategorinya
     * 2. Pisahkan mana INCOME dan mana EXPENSE berdasarkan category.type
     * 3. Saldo = total income - total expense
     *
     * Kenapa pakai $this->transactions()->with('category')->get() bukan langsung query?
     * Karena kita butuh data category.type untuk tahu apakah income atau expense.
     */

    // ohhh jaid ini tuh udah carnaya ya buat geter di larave
    // jadi harus pake awalan get dan akhiran atribute
    public function getBalanceAttribute(): int
    {
        // jadi ini tuh dia ngambil semua transaksi  di walet ini dan sekalian eagerloading gitu ya pake with
        // nah kita butuh withnya ini biar bisa dapeitin category.type nya itu buat nentuin mana yang income mana yang expense
        $transactions = $this->transactions()->with('category')->get();

        // jadi nanti di transaksi ni akna ada data objek transaksinya dan tipa objeknya tu diapunya category type

        // dan cara aksesnya itu ketika mau di where adalah pakke category.type

        // disni kita totallin dan hiung pake sum (tambahin) total semuanya ya

        $income  = $transactions->where('category.type', 'INCOME')->sum('amount');
        $expense = $transactions->where('category.type', 'EXPENSE')->sum('amount');

        return $income - $expense;
    }

    // Relasi: wallet ini milik satu user
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Relasi: wallet ini punya banyak transaksi
    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }
}
