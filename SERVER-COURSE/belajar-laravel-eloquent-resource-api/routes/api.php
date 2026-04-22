<?php

use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');


// bisa kaya gini, karena ini itu binding
// Route::get('/category/{category}', function(Category $category){
//     return new CategoryResource($category);
// });

// tapi ini untuk belajr aja
Route::get('/categories/{id}', function( $id){
    $category = Category::findOrFail($id);

    // nah ini tuh otomatis akn berubah menjadi json
    return new CategoryResource($category);
});

// nah kia juga bisa mereturnkan data berupa array

Route::get('/categories', function(){
    $categories = Category::all();
    // dinsini engga pke gini ya
    // return new CategoryResource::collection($categories);

    // karena kita pake fungsi bukan class
    return CategoryResource::collection($categories);
});