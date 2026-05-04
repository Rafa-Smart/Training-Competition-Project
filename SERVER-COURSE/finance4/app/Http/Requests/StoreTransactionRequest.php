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
            'category_id' => ['exists:categories,id', 'required'],
            'amount' => ['required', 'integer', 'min:1'],
            'date' => ['required', 'date_format:Y-m-d'],
            'note' => ['nullable', 'string'],
        ];
    }
    // nah dinsi gapapa kita ambilnya itu fullnamenya aja api pas di input ke database itu apke name ya

    public function messages()
    {
        return [
            'wallet_id.required' => 'The wallet_id field is required.',
            'category_id.required' => 'The category_id field is required.',
            'amount.required' => 'The amount field is required.',
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
