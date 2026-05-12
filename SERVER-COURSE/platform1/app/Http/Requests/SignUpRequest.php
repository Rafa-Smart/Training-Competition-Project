<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;

class SignUpRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'username' => ['required', 'unique:users,username', 'min:4', 'max:60'],
            'password' => ['required', 'min:5', 'max:10'],
        ];
    }

    public function messages(): array
    {
        return [
            'username.required' => 'required',
            'username.unique'   => 'Username already exists',
            'username.min'      => 'must be at least 4 characters long',
            'username.max'      => 'must be at most 60 characters long',
            'password.required' => 'required',
            'password.min'      => 'must be at least 5 characters long',
            'password.max'      => 'must be at most 10 characters long',
        ];

    }    public function failedValidation(Validator $validator)
    {
        response()->json([
            'status' => 'invalid',
            'message' => 'Request body is not valid.',
            'violations' => $validator->errors(),
        ], 400);
    }
}