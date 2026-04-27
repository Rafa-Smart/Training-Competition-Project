<?php

namespace App\Http\Requests;

/**
 * FILE: app/Http/Requests/LoginRequest.php
 *
 * Form Request untuk endpoint LOGIN.
 * Lebih simpel dari RegisterRequest karena kita hanya cek:
 * - email ada dan tidak kosong
 * - password ada dan tidak kosong
 *
 * Kita TIDAK cek apakah email/password benar di sini.
 * Pengecekan kredensial (cocok/tidak cocok) dilakukan di Controller.
 * Di sini hanya validasi format input saja.
 *
 * POLA YANG SAMA dengan RegisterRequest:
 * authorize() → rules() → messages() → failedValidation()
 * Hapalin pola ini karena semua Request pakai pola yang sama!
 */

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class LoginRequest extends FormRequest
    {
        public function authorize(): bool
        {
            return true;
        }

        public function rules(): array
        {
            return [
                'email'    => ['required', 'email'],
                'password' => ['required', 'string'],
            ];
        }

        public function messages(): array
        {
            return [
                'email.required'    => 'The email field is required.',
                'email.email'       => 'The email must be a valid email address.',
                'password.required' => 'The password field is required.',
            ];
        }

        /**
         * Sama persis dengan RegisterRequest.
         * Format error 422 selalu sama di seluruh aplikasi ini.
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
