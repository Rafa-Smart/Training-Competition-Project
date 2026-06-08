<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class SignUpRequest extends FormRequest
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
            'username'=>['required', 'unique:users,username', 'min:4', 'max:60'],
            'password'=> ['required', 'min:1', 'max:10']
        ];
    }
    public function messages(){
        return [
            'username.required'=> 'username is required',
            'password.required'=> 'password is required',
        ];
    }

    public function failedValidation(\Illuminate\Contracts\Validation\Validator $validator){
        return [
            'status'=> 'error',
            'errors' => $validator->errors()
        ];
    }
}
