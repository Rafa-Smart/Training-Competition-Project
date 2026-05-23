<?php

namespace App\Models;

/**
 * FILE: app/Models/User.php
 *
 * Model ini merepresentasikan tabel 'users' di database.
 *
 * KONSEP MODEL:
 * Model adalah "jembatan" antara kode PHP kita dengan tabel di database.
 * Satu baris di tabel = satu objek Model.
 *
 * HAL PENTING DI SINI:
 * 1. HasApiTokens → Trait dari Sanctum. WAJIB ada agar kita bisa panggil
 *    $user->createToken() dan $user->currentAccessToken()->delete().
 *    Tanpa ini, Sanctum tidak akan bekerja.
 *
 * 2. $fillable → Daftar kolom yang BOLEH diisi secara massal (Mass Assignment).
 *    Contoh: User::create(['name' => 'Budi', 'email' => '...', 'password' => '...'])
 *    Kolom yang tidak ada di $fillable akan DIABAIKAN oleh Laravel (keamanan).
 *
 * 3. $hidden → Kolom yang TIDAK akan tampil ketika kita return $user sebagai JSON.
 *    Password jangan sampai terkirim ke client!
 */

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    // Pasang HasApiTokens agar user bisa punya token Sanctum
    use HasApiTokens;

    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    // Sembunyikan kolom ini ketika model di-convert ke JSON
    protected $hidden = [
        'password',
        'remember_token',
    ];
}
