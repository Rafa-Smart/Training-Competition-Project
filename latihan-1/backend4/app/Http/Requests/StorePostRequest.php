<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class StorePostRequest extends FormRequest
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
            'caption' => 'required|unique:users,username|regex:/^[a-zA-Z0-9._]+$/',
            'attachments' => 'required|array|min:1',
            'attachments.*' => 'file|mimes:jpg:,jpeg,png,webp,gif|image',

        ];
    }

    public function messages()
    {
        return [
            'caption.required' => 'The caption field is required.',
            'attachments.*.file' => 'The attachments.0 field must be a file of type: png, jpg,
jpeg, webp.',
        ];
    }

    public function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(
            response()->json([
                'message' => 'invalid input',
                'errors' => $validator->errors(),
            ])
        );
    }
}
