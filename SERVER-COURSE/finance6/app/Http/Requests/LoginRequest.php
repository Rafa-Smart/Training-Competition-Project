<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
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
            'email' => ['required', 'exists:users,email', 'email'],
            'password' => ['required', 'min:6'],
        ];
    }

    public function messages()
    {
        return [
            'email.exists' => "The email has already been taken.",
            'password.min' => 'The password field must be at least 6
characters.',
        ];
    }

    public function failedValidation(Validator $validator) {
        return response()->json([
            'status'=>'error',
            'message'=>'invalid field',
            'errors'=> $validator->errors()
        ], 422);
    }
}
