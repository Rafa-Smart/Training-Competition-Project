<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
use App\Models\Category;
use App\Models\User;
use Hash;

class AuthController extends Controller
{
    public function register(RegisterRequest $request)
    {
        $data = $request->validated();
        $user = User::create([
            'email' => $data['email'],
            'name' => $data['full_name'],
            'password' => Hash::make($data['password']),
        ]);

        $user->tokens()->delete();
        $token = $user->createToken('register')->plainTextToken;
        $user->token = $token;

        return response()->json([
            'status' => 'success',
            'message' => 'Registration successful',
            'data' => $user,

        ], 200);
    }

    public function login(LoginRequest $request)
    {
        $data = $request->validated();
        $user = User::where('email', $data['email']);
        if (! $user || ! Hash::check($user, $data['password'])) {
            return response()->json([
                'status' => 'error',
                'message' => 'Username or password incorrect',
            ], 401);
        }

        $user->tokens()->delete();
        $token = $user->createToken('login')->plainTextToken;
        $user->token = $token;

        return response()->json([
            'status' => 'success',
            'message' => 'Login successful',
            'data' => $user,

        ], 200);
    }

    public function logout()
    {
        $user = auth()->user();
        $user->currentAccessToken()->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Logout successful',
        ]);
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCategoryRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Category $category)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Category $category)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCategoryRequest $request, Category $category)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Category $category)
    {
        //
    }
}
