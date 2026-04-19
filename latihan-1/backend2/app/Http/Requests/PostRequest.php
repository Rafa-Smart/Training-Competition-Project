<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class PostRequest extends FormRequest
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
            'caption' =>'required',
            'attachments' => 'required|min:1|array',
            'attachments*' => 'file|mimes:jpg,jpeg,webp,png,gif|image',
        ];
    }

    public function messages()
    {
        return [
            'caption.required' => 'The caption field is required.',
            'attachments.*.mimes' => 'The attachments.0 field must be a file of type: png, jpg,
jpeg, webp.',
        ];
    }

    public function failedValidation(\Illuminate\Contracts\Validation\Validator $validator)
    {
        throw new HttpResponseException(
            response()->json([
                'message' => 'invalid field',
                'errors' => $validator->errors(),
            ])
        );
    }
}
