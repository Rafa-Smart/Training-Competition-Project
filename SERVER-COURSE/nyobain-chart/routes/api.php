<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::get('/categories', function (Request $request) {
        $categories = [
            [
                'category' => 'makanan',
                'total' => 40,
            ],
            [
                'category' => 'minuman',
                'total' => 70,
            ],
            [
                'category' => 'snack',
                'total' => 20,
            ],
        ];

        return response()->json([
            'data' => $categories,
        ]);
    });
});
