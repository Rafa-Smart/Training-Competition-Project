<?php

namespace App\Http\Requests;

/**
 * FILE: app/Http/Requests/RegisterRequest.php
 *
 * Ini adalah Form Request untuk endpoint REGISTER.
 * Tugasnya: validasi input sebelum sampai ke Controller.
 *
 * KONSEP FORM REQUEST:
 * Laravel punya sistem validasi yang rapi. Daripada kita validasi di Controller
 * (yang bikin Controller jadi panjang dan berantakan), kita pisahkan ke file ini.
 * Laravel otomatis menjalankan validasi ini SEBELUM fungsi register() di Controller dijalankan.
 *
 * Kalau validasi GAGAL → Laravel otomatis return 422 dengan daftar error.
 * Kita bisa atur format error-nya di fungsi failedValidation() di bawah.
 *
 * FUNGSI-FUNGSI PENTING:
 * - authorize() → return true artinya siapa saja boleh akses endpoint ini
 * - rules()     → daftar aturan validasi
 * - messages()  → pesan error custom (optional tapi bagus untuk konsistensi)
 * - failedValidation() → atur format response ketika validasi gagal
 */

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

    class RegisterRequest extends FormRequest
    {
        /**
         * authorize(): Apakah request ini boleh diproses?
         * Return true = semua orang boleh (karena register memang publik).
         */
        public function authorize(): bool
        {
            return true;
        }

        /**
         * rules(): Aturan validasi untuk setiap field.
         *
         * Penjelasan tiap aturan:
         * - 'required'     → field wajib ada dan tidak boleh kosong
         * - 'string'       → nilainya harus string
         * - 'email'        → harus format email valid (ada @ dan domain)
         * - 'unique:users' → cek ke tabel 'users', pastikan email belum ada
         * - 'min:6'        → minimal 6 karakter
         */
        public function rules(): array
        {
            return [
                'full_name' => ['required', 'string'],
                'email'     => ['required', 'email', 'unique:users,email'],
                'password'  => ['required', 'string', 'min:6'],
            ];
        }

        /**
         * messages(): Pesan error custom.
         * Format: 'nama_field.nama_rule' => 'pesan error'
         * Ini untuk mengubah pesan default Laravel menjadi lebih sesuai kebutuhan kita.
         */
        public function messages(): array
        {
            return [
                'full_name.required' => 'The name field is required.',
                'email.required'     => 'The email field is required.',
                'email.email'        => 'The email must be a valid email address.',
                'email.unique'       => 'The email has already been taken.',
                'password.required'  => 'The password field is required.',
                'password.min'       => 'The password field must be at least 6 characters.',
            ];
        }

        /**
         * failedValidation(): Dijalankan otomatis ketika validasi GAGAL.
         *
         * Kenapa kita override fungsi ini?
         * Karena default Laravel untuk API akan return 422 tapi dengan format yang sedikit berbeda.
         * Di sini kita paksa format response-nya sesuai spesifikasi soal:
         * {
         *   "status": "error",
         *   "message": "Invalid field",
         *   "errors": { ... }
         * }
         *
         * HttpResponseException adalah cara kita "melempar" response langsung dan
         * menghentikan proses selanjutnya.
         */
        protected function failedValidation(Validator $validator)
        {
            throw new HttpResponseException(
                response()->json([
                    'status'  => 'error',
                    'message' => 'Invalid field',
                    'errors'  => $validator->errors(),
                ], 422)
            );
        }
}
