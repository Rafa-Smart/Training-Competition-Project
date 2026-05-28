<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreWalletRequest extends FormRequest
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
            'name'=>['required'],
            'currency_code'=>['required', 'exists:currencies,code'], 
        ];
    }

    public function messages(){
        return [    
            'name.required'=>"The name field is required.",
            'currency_code.exists'=>           "The selected currency code is invalid.", 
        ];
    }

    public function failedValidation(\Illuminate\Contracts\Validation\Validator $validator){
        return response()->json([
            'status'=>'error',
            'message'=>'Invalid field',
            'errors'=>$validator->errors()
        ]);
    }
}
