<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Client\HttpClientException;

class UpdateWalletRequest extends FormRequest
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
            'name' => ['required', 'string'], 
        ];
    }

    public function messages()
    {
        return [
            'name.required' => 'The name field is required.', 
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
