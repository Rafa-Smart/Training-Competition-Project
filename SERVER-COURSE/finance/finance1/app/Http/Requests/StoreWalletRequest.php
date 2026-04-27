<?php

namespace App\Http\Requests;

/**
 * FILE: app/Http/Requests/StoreWalletRequest.php
 *
 * Form Request untuk endpoint ADD WALLET (POST /api/wallets).
 *
 * Yang divalidasi:
 * - name: wajib ada
 * - currency_code: wajib ada DAN harus valid (ada di tabel currencies)
 *
 * ATURAN 'exists:currencies,code':
 * Ini meminta Laravel cek ke tabel 'currencies', kolom 'code'.
 * Apakah nilai yang dikirim user ada di sana?
 * Kalau tidak ada → error "The selected currency code is invalid."
 */

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class StoreWalletRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'          => ['required', 'string'],
            'currency_code' => ['required', 'exists:currencies,code'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'          => 'The name field is required.',
            'currency_code.required' => 'The currency code field is required.',
            'currency_code.exists'   => 'The selected currency code is invalid.',
        ];
    }

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
