<?php

namespace App\Http\Requests;

/**
 * FILE: app/Http/Requests/UpdateWalletRequest.php
 *
 * Form Request untuk endpoint UPDATE WALLET (PUT /api/wallets/:walletId).
 *
 * Saat update, kita hanya boleh ubah 'name' saja.
 * currency_code tidak bisa diubah setelah wallet dibuat.
 * Ini sesuai spesifikasi soal (lihat C2, body hanya 'name').
 */

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class UpdateWalletRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'The name field is required.',
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
