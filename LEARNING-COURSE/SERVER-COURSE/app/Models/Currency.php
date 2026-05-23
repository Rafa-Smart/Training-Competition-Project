<?php

namespace App\Models;

/**
 * FILE: app/Models/Currency.php
 *
 * Model untuk tabel 'currencies'.
 * Tabel ini berisi data mata uang seperti IDR, USD, dll.
 * Data ini sifatnya MASTER DATA → sudah diisi lewat seeder/dump, user tidak bisa tambah.
 *
 * Tidak ada relasi khusus di sini karena Currency hanya di-read saja.
 * Wallet menyimpan currency_code (string), bukan currency_id (foreign key integer).
 * Itu sebabnya validasi di StoreWalletRequest pakai: 'exists:currencies,code'
 * bukan 'exists:currencies,id'.
 */

use Illuminate\Database\Eloquent\Model;

class Currency extends Model
{
    protected $fillable = ['name', 'symbol', 'code'];
}
