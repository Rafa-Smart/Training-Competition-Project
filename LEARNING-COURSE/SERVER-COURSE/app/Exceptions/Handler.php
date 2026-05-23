<?php

/**
 * FILE: app/Exceptions/Handler.php
 *
 * Ini adalah "pusat penanganan error" untuk seluruh aplikasi Laravel.
 *
 * KENAPA FILE INI SANGAT PENTING?
 * Secara default, ketika token tidak valid atau tidak ada, Sanctum akan
 * melempar exception AuthenticationException. Laravel defaultnya akan
 * redirect user ke halaman login (untuk web), tapi untuk API kita butuh
 * response JSON 401.
 *
 * Di sinilah kita "abat" (intercept) exception itu dan mengubah formatnya
 * menjadi JSON yang sesuai spesifikasi soal:
 * {
 *   "status": "error",
 *   "message": "Unauthenticated."
 * }
 *
 * CARA KERJA:
 * Fungsi render() dipanggil setiap kali ada exception yang tidak tertangani.
 * Kita cek: apakah exception ini adalah AuthenticationException?
 * Kalau ya → return JSON 401 dengan format yang kita mau.
 * Kalau bukan → serahkan ke parent (handler default Laravel).
 *
 * INGAT: Ini berlaku untuk SEMUA route yang pakai middleware 'auth:sanctum'.
 * Jadi kamu tidak perlu cek token secara manual di setiap Controller —
 * cukup pasang middleware di routes/api.php dan Handler ini yang akan
 * merespons dengan 401 kalau token tidak valid.
 */

namespace App\Exceptions;

use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Throwable;

class Handler extends ExceptionHandler
{
    /**
     * render() → Dipanggil saat ada exception yang butuh dijadikan HTTP response.
     *
     * Parameter:
     * - $request   → request HTTP yang sedang berjalan
     * - $exception → exception yang terjadi
     *
     * Return: HTTP response yang sesuai
     */


    // SEKARANG ADANYA ITU DI SINI YA
    // bootstrap/app.php
    // ->withExceptions(function (Exceptions $exceptions) {
    //     $exceptions->render(function (\Illuminate\Auth\AuthenticationException $e, $request) {
    //         return response()->json([
    //             'status' => 'error',
    //             'message' => 'Unauthenticated.',
    //         ], 401);
    //     });
    // })


    public function render($request, Throwable $exception)
    {
        // Tangkap exception khusus dari Sanctum (token tidak ada / tidak valid)
        if ($exception instanceof AuthenticationException) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Unauthenticated.',
            ], 401);
        }

        // Untuk semua exception lainnya, serahkan ke handler default Laravel
        return parent::render($request, $exception);
    }
}
