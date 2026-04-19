<?php
// app/Http/Requests/Post/StorePostRequest.php
namespace App\Http\Requests\Post;

use Illuminate\Foundation\Http\FormRequest;

class StorePostRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'caption' => ['required', 'string'],
            'attachments.*' => [
                'required',
                'image',
                'mimes:jpg,jpeg,png,gif,webp',
                'max:5120' // 5MB
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'caption.required' => 'The caption field is required.',
            'attachments.required' => 'The attachments field is required.',
            'attachments.array' => 'The attachments must be an array.',
            'attachments.min' => 'At least one attachment is required.',
            'attachments.*.required' => 'Each attachment file is required.',
            'attachments.*.image' => 'Each attachment must be an image.',
            'attachments.*.mimes' => 'Each attachment must be a file of type: jpg, jpeg, png, gif, webp.',
            'attachments.*.max' => 'Each attachment must not exceed 5MB.',
        ];
    }
}