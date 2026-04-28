<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Client\HttpClientException;

class StoreTransactionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'wallet_id' => ['required',  'exists:wallets,id'],
            'category_id' => ['required', 'exists:categories,id'],
            'amount' => ['integer', 'min:1'],
            'date' => ['required', 'date_format:y-m-d'],
            'note' => ['nullable', 'string'],
        ];
    }

    public function messages()
    {
        return [
            'wallet_id.exists' => 'The selected wallet code is invalid.',
            'currency_id.exists' => 'The selected categories code is invalid.',
            'amount.integer' => 'amount must be integer',
            'date.date_format' => 'date must be date format',
            'note.string' => 'note must be string',
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpClientException(
            response()->json([
                'status' => 'error', 'message' => 'invalid field',
                'errors' => $validator->errors(),
            ], 422)
        );
    }
}
