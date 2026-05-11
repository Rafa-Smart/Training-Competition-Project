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
            'wallet_id' => ['required', 'exists:wallets,wid'],
            'category_id' => ['required', 'exists:categories,id'],
            'amount' => ['required', 'integer', 'min:1'],
            'note' => ['string'],
            'date' => ['required', 'date_format:Y-m-d'],
        ];
    }

    public function messages()
    {
        return [
            'wallet_id.required' => 'The wallet_id field is required.',
            'category_id.required' => 'The v field is required.',
            'amount.required' => 'The amount field is required.',
            'note.required' => 'The note field is required.',
            'date.required' => 'The date field is required.',
        ];
    }

    public function failedValidation(Validator $validator)
    {
        return response()->json([
            'status' => 'error',
            'message' => 'Invalid field',
            'errors' => $validator->errors(),
        ]);
    }
}
