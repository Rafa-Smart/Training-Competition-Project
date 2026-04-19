<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

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
            'full_name' => 'required',
            'bio' => 'required|max:100',
            'password' => 'required|min:6',
            'is_private' => 'required|boolean',
            'username' => 'required|min:3|unique:users,username|regex:/^[a-zA-Z0-9._]+$/',

        ];
    }

    public function messages()
    {
        return [
            'full_name.required' => 'The full name field is required.',
            'username.unique' => 'The username has already been taken.',
            'password.min' => 'The password field must be at least 6 characters.',
            'bio.required' => 'The bio field is required.',
        ];
    }

    public function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(
            response()->json(
                [
                    'message' => 'invalid input data',
                    'errors' => $validator->errors(),
                ], 422
            ),
        );
    }
}
