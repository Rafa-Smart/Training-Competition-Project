<?php

namespace App\Http\Controllers;

/**
 * FILE: app/Http/Controllers/AuthController.php
 *
 * Controller ini menangani semua urusan AUTENTIKASI:
 * - register() → buat akun baru
 * - login()    → masuk dan dapat token
 * - logout()   → hapus token yang sedang dipakai
 *
 * ALUR SANCTUM:
 * Sanctum itu sistem token berbasis database. Ketika user login,
 * kita panggil $user->createToken('nama') → Sanctum simpan token di tabel
 * 'personal_access_tokens' dan kasih kita string token-nya.
 * Token ini dikirim ke client, lalu client pakai di header:
 *   Authorization: Bearer <TOKEN>
 *
 * Sanctum akan otomatis validasi token itu setiap kali request masuk.
 * Kalau tidak valid → dia sendiri yang balik 401 Unauthenticated.
 */

use App\Http\Requests\RegisterRequest;
use App\Http\Requests\LoginRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    /**
     * REGISTER - POST /api/auth/register
     *
     * Alur:
     * 1. Validasi input pakai RegisterRequest (cek nama, email unik, password min 6)
     * 2. Buat user baru di database
     * 3. Langsung buatkan token untuk user baru itu
     * 4. Return data user + token dengan status 201
     */
    public function register(RegisterRequest $request)
    {
        // Buat user baru. Password di-hash otomatis karena kita set $casts di Model.
        $user = User::create([
            'name'     => $request->full_name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
        ]);

        // Buat token Sanctum untuk user ini. 'auth_token' itu cuma label/nama saja.
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'status'  => 'success',
            'message' => 'Registration successful',
            'data'    => [
                'id'         => $user->id,
                'name'       => $user->name,
                'email'      => $user->email,
                'created_at' => $user->created_at,
                'updated_at' => $user->updated_at,
                'token'      => $token,
            ],
        ], 201);
    }

    /**
     * LOGIN - POST /api/auth/login
     *
     * Alur:
     * 1. Validasi input pakai LoginRequest
     * 2. Cari user berdasarkan email
     * 3. Cek apakah password cocok dengan Hash::check()
     * 4. Kalau salah → return 401 manual
     * 5. Kalau benar → buat token baru dan return
     *
     * Kenapa buat token BARU tiap login?
     * Karena setiap device/session punya token sendiri-sendiri.
     * Ini yang membuat logout hanya logout di satu device saja.
     */
    public function login(LoginRequest $request)
    {
        // Cari user berdasarkan email
        $user = User::where('email', $request->email)->first();

        // Cek apakah user ada DAN password cocok
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Username or password incorrect',
            ], 401);
        }

        // Login berhasil → buat token baru
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'status'  => 'success',
            'message' => 'Login successful',
            'data'    => [
                'id'         => $user->id,
                'name'       => $user->name,
                'email'      => $user->email,
                'created_at' => $user->created_at,
                'updated_at' => $user->updated_at,
                'token'      => $token,
            ],
        ], 200);
    }

    /**
     * LOGOUT - POST /api/auth/logout
     *
     * Alur:
     * 1. Route ini dilindungi 'auth:sanctum', jadi kalau token tidak valid
     *    → Sanctum langsung tolak dengan 401, fungsi ini tidak dijalankan sama sekali
     * 2. Kalau sampai masuk ke sini, berarti user sudah terautentikasi
     * 3. Kita hapus HANYA token yang sedang dipakai saat ini (currentAccessToken())
     *    → Ini yang bikin logout hanya berlaku di device ini saja
     */
    public function logout(Request $request)
    {
        // Hapus hanya token yang sedang aktif dipakai request ini

        // nanti pake in ya $user->tokens()->delete();
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'status'  => 'success',
            'message' => 'Logout successful',
        ], 200);
    }
}
