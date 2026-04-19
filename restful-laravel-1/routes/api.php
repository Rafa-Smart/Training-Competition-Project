<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\TodoController;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// ini untuk mendapatkna list todo
Route::get('/todos', [TodoController::class, 'index']);

// buat detail
Route::get('/todos/{todo}', [TodoController::class, 'show']);

// Route::get("/todos", function(){
//     return [
//         "message"=>true
//     ];
// });

// ini untuk santum
// ini ktia buatkan agar seluruh route yang ada didala sini
// itu prefixnya /auth
// https://chatgpt.com/c/6954b30e-4c20-8322-a179-87f83a524b58
// nah ingat kalo middleware sanctum ini itu sudah gini nih
// jadi akn kalo pake express mah kita mnual buat middleware untuk
// /ambil data di databse berdasarkan token ya
// nah tapi kalo pake sanctum ini sudah otomatis middlewarenya
// Jika token valid:
// Token di-hash
// Dicocokkan
// Relasi tokenable dipanggil
// Laravel otomatis:
// Mengisi $request->user()
// Mengisi Auth::user()
// Request diteruskan
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::delete('/logout', [AuthController::class, 'logout'])->middleware(['auth:sanctum']);
});

// ini untuk todo yang pake middleware sanctum

Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/todos', [TodoController::class, 'store']);
    Route::patch('/todos/{todo}', [TodoController::class, 'update']);
    Route::delete('/todos/{todo}', [TodoController::class, 'destroy']);
});

// siapa aja boleh akses
// ini untuk mendapatkna list todo
Route::get('/todos', [TodoController::class, 'index']);
// buat detail
Route::get('/todos/{todo}', [TodoController::class, 'show']);

// get users
Route::get('/users', function () {
    return response()->json([
        'data' => User::get(),
        'total_users' => User::get()->count(),
    ]);
});
    