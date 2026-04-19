<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Client\HttpClientException;
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
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'username' => 'required|min:3|unique:users,username|regex:/^[a-zA-Z0-9._]+$/',
            'full_name' => 'required|max:255',
            'bio' => 'required|max:100',
            'password' => 'required|min:6',
            'is_private' => 'boolean',
        ];
    }

    public function messages(){
        return [
            'username.required'=> 'The username field is required.',
            'full_name.required'=> 'The full name field is required.',
            'bio.required'=> 'The bio field is required.',
            'password.min'=> 'The password field must be at least 6 characters.',
        ];
    }

   public function failedValidator(Validator $validator){
    throw new HttpResponseException(
        response()->json([
            'message'=>'invalid json',
            'errors'=> $validator->errors()
        ])
    );
   }
}
