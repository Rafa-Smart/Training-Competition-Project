<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Client\HttpClientException;

class RegisterRequest extends FormRequest
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
            'full_name' => ['required', 'string'],
            'email' => ['required', 'email', 'unique:email,users'],
            'password' => ['required', 'min:6', 'string'],
        ];
    }

    public function messages()
    {
        return [
            'name.required' => 'The name field is required.',
            'email.unique' => 'The email has already been taken.',
            'password.min' => 'The password field must be at least 6
characters.',
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
