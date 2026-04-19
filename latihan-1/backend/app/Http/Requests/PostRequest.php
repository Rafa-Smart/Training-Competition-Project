<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

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
        'caption' => ['required', 'string'],

        // FIELD INDUK
        'attachments' => ['required', 'array', 'min:1'],

        // SETIAP FILE
        'attachments.*' => [
            'file',
            'image',
            'mimes:jpg,jpeg,png,webp,gif',
            'max:5120',
        ],
    ];
    }

    public function messages()
    {
        return [
            'caption.required' => 'The caption field is required.',
            'attachments.*.mimes' => 'The attachments.0 field must be a file of type: png, jpg,jpeg, webp.',
        ];
    }
}
