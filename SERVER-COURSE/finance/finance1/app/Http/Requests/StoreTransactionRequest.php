<?php

namespace App\Http\Requests;

/**
 * FILE: app/Http/Requests/StoreTransactionRequest.php
 *
 * Form Request untuk endpoint ADD TRANSACTION (POST /api/transactions).
 *
 * Yang divalidasi:
 * - wallet_id  : wajib ada DAN harus valid (ada di tabel wallets)
 * - category_id: wajib ada DAN harus valid (ada di tabel categories)
 * - amount     : wajib ada, harus integer, minimal nilai 1 (tidak boleh 0 atau negatif)
 * - date       : wajib ada, harus format tanggal "Y-m-d" (contoh: 2025-07-31)
 * - note       : optional, boleh tidak dikirim
 *
 * ATURAN 'date_format:Y-m-d':
 * Laravel akan memastikan format tanggalnya PERSIS "tahun-bulan-hari"
 * Kalau dikirim "31-07-2025" → gagal validasi
 * Kalau dikirim "2025-07-31" → lolos
 */

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class StoreTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'wallet_id'   => ['required', 'exists:wallets,id'],
            'category_id' => ['required', 'exists:categories,id'],
            'amount'      => ['required', 'integer', 'min:1'],
            'date'        => ['required', 'date_format:Y-m-d'],
            'note'        => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'wallet_id.required'   => 'The wallet id field is required.',
            'wallet_id.exists'     => 'The selected wallet id is invalid.',
            'category_id.required' => 'The category id field is required.',
            'category_id.exists'   => 'The selected category id is invalid.',
            'amount.required'      => 'The amount field is required.',
            'amount.integer'       => 'The amount must be an integer.',
            'amount.min'           => 'The amount must be at least 1.',
            'date.required'        => 'The date field is required.',
            'date.date_format'     => 'The date must be in Y-m-d format.',
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
