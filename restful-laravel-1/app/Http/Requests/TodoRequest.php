<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class TodoRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */

    // gini ini tuh gunanya untuk cek apakah user boleh akses ke reuqest ini
    // dan bisa juga pake cek return auth()->check()
    // buat cek apakah dia sudah pernah login
    // jika tidka maka requetnya akan berhenti

    // atau bisa juga gini, jadi cek hanya user an punya data yang boleh akses
    //         $todo = $this->route('todo');
    // return $todo && auth()->id() === $todo->user_id;

    //     A. $this->route('todo') ITU APA?
    // Ini sangat penting
    // $this->route('todo')
    // Artinya:
    // Ambil route parameter bernama todo
    // Cocok dengan route ini
    // Route::put('/todos/{todo}', [TodoController::class, 'update']);
    // Nama parameter:
    // {todo}
    // jadi nanti di di controllernya itu ada parameter yang ngambil 
    // params dari route, yang namanya itu todo

    // jad nanti langusng otomatis di cari dengan findOrFail($todo)
    // dan nanti di parameternya itu langsung objek todonya yang sudah uniq

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
            'name' => 'required|max:255',
            // ini jgnajn ada spasi ya -> in_progress, done, cancelled
            // karena akna tetap dibaca
            'status' => 'required|in:in_progress,done,cancelled',
        ];
    }

    // jadi ini tuh akan di panggil jika rulesnya error
    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(
            response()->json([
                'message' => 'error validation',
                'errors' => $validator->errors(),
            ], 422)
        );
    }
}
