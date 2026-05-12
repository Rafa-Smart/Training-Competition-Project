<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
class UpdateGameRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'title'       => ['required', 'min:3', 'max:60'],
            'description' => ['required', 'max:200'],
        ];
    }

    public function messages(): array
    {
        return [
            'title.required'       => 'required',
            'title.min'            => 'must be at least 3 characters long',
            'title.max'            => 'must be at most 60 characters long',
            'description.required' => 'required',
            'description.max'      => 'must be at most 200 characters long',
        ];
    }public function failedValidation(Validator $validator)
    {
        response()->json([
            'status' => 'invalid',
            'message' => 'Request body is not valid.',
            'violations' => $validator->errors(),
        ], 400);
    }
}