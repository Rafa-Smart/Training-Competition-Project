<?php

namespace App\Http\Requests;

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
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
      public function rules(): array
    {
        return [
            'username'=>[
                'required'
            ],
            'password'=>'required|min:6|string',
        ];
    }

    public function messages(){
        return [
            'username.required'=>'The username is required',
            'password.required'=>'The password is required',
            'password.min'=>'The password field must be at least 6 characters.',
        ];
    }
}
