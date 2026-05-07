<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;

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
            'wallet_id' => ['required', 'exists:wallets,id'],
            'category_id' => ['required', 'exists:categories,id'],
            'amount' => ['required', 'integer', 'min:1'],
            'date' => ['required', 'date_format:Y-m-d'],
            'note' => ['string', 'nullable'],
        ];
    }

    public function messages()
    {
        return [
            'wallet_id.exists' => 'The selected wallet_id code is invalid.',
            'category_id.exists' => 'The selected category_id code is invalid.',
            'amount.required' => 'The amount field is required.',
            'date.required' => 'The date field is required.',
        ];
    }

    public function failedValidation(Validator $validator)
    {
        return response()->json([
            'status' => 'error',
            'message' => 'invalid field',
            'errors' => $validator->errors(),
        ], 422);
    }
}
