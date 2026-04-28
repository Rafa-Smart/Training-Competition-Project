<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
use App\Models\Category;
use App\Models\User;
use Auth;
use Exception;
use Hash;

class AuthController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function register(RegisterRequest $request)
    {
        try {

            $user = User::create([
                'name' => $request->full_name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
            ]);

            $user->tokens()->delete();

            $token = $user->createToken('auth')->plainTextToken;

            return response()->json([
                'status' => 'success',
                'message' => 'Registration successful',
                'data' => [
                    'name' => $user->name,
                    'email' => $user->email,
                    'updated_at' => $user->updated_at,
                    'created_at' => $user->created_at,
                    'id' => $user->id,
                    'token' => $token,
                ],
            ], 200);

        } catch (Exception $e) {
            throw $e;
        }
    }

    public function login(LoginRequest $request)
    {
        try {
            $user = User::where('email', $request->email);
            if (! $user || ! Hash::check($request->email, $user->email)) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Username or password incorrect',
                ], 401);
            }

            $user->tokens->delete();

            $token = $user->createToken('auth')->plainTextToken;

            return response()->json([
                'status' => 'success', 'message' => 'Login successful',
                'data' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'created_at' => $user->create_at,
                    'updated_at' => $user->updated_at,
                    'token' => $token,
                ],
            ], 200);

        } catch (Exception $e) {
            throw $e;
        }
    }

    public function logout()
    {
        try {

            $user = Auth::user();
            $user->tokens()->delete();

            response()->json([
                'status' => 'success',
                'message' => 'Logout successful',
            ], 200);

        } catch (Exception $e) {
            throw $e;
        }
    }

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
