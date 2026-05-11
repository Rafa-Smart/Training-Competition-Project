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
            'password' => ['required'],
            'email' => ['required', 'email'],
            // 'email'=> ['required', 'exists:users,email','unique:users,email,except,id']
            // jadi except ini itu "cek unik, TAPI abaikan user id ini" bisnay pas mau update email gitu
        ];
    }

    public function messages()
    {
        return [
            'password.required' => 'The password field is required.',
            'email.unique' => 'The email has already been taken.',
            'email.required' => 'The emails field is required.',
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
