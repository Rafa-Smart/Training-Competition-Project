<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;

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
            'full_name' => ['required'],
            'email' => ['email', 'exists:users,email', 'required'],
            'password' => ['required', 'min:6'],
        ];
    }
    // nah dinsi gapapa kita ambilnya itu fullnamenya aja api pas di input ke database itu apke name ya

    public function messages()
    {
        return [
            'full_name.required' => 'The name field is required.',
            'email.exists' => 'The email has already been taken.',
            'password' => 'The password field must be at least 6
characters.',
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
