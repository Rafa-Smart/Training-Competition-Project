<?php
// app/Http/Requests/Auth/RegisterRequest.php
namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'full_name' => ['required', 'string', 'max:255'],
            'bio' => ['required', 'string', 'max:100'],
            'username' => [
                'required',
                'string',
                'min:3',
                'max:255',
                'regex:/^[a-zA-Z0-9._]+$/',
                'unique:users,username'
            ],
            'password' => ['required', 'string', 'min:6'],
            'is_private' => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'full_name.required' => 'The full name field is required.',
            'bio.required' => 'The bio field is required.',
            'bio.max' => 'The bio field must not exceed 100 characters.',
            'username.required' => 'The username field is required.',
            'username.min' => 'The username field must be at least 3 characters.',
            'username.regex' => 'The username may only contain letters, numbers, dots, and underscores.',
            'username.unique' => 'The username has already been taken.',
            'password.required' => 'The password field is required.',
            'password.min' => 'The password field must be at least 6 characters.',
        ];
    }
}