<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest; 
use Illuminate\Http\Exceptions\HttpResponseException;

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
            'username' => 'required|min:3|regex:/^[a-zA-Z0-9._]+$/',
            'password' => 'required|min:6',
        ];
    }
    public function messages(){
        return [ 
            'username.required'=> 'The username field is required.',
            'password.min'=> 'The password field must be at least 6 characters.',
        ];
    }

    public function failedValidation(\Illuminate\Contracts\Validation\Validator $validator){
        throw new HttpResponseException(
            response()->json([
                'message'=>"invalid field",
                'errors'=>$validator->errors()
            ])
        );
    }
}
