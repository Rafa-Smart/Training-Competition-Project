<?php

namespace App\Http\Requests;

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
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
        public function rules(): array
    {
        return [
            'full_name'=>'required',
            'bio'=>'required|max:100|string',
            'username'=>[
                'required',
                'max:255',
                'min:3',
                'regex:/^[a-zA-Z0-9._]+$/',
                'unique:users,username'
            ],
            'password'=>'required|min:6|string',
            'is_private'=>'boolean'
        ];
    }

    public function messages(){
        return [
            'full_name.required'=>'The full name field is required.',
            'username.unique'=>'The username has already been taken.',
            'password.min'=>'The password field must be at least 6 characters.',
            'bio.required'=>'The bio field is required'
        ];
    }

    // nah jadi ini untuk custom error di validasi login dan register
    // atua yang lianya nanti tinggal di copy aja
    protected function failedValidation(\Illuminate\Contracts\Validation\Validator $validator){
        throw new HttpResponseException(
            response()->json([
                'message'=>'invalid field',
                'errors' => $validator->errors()
            ])
        );
    }
}
