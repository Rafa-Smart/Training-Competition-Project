<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Requests\StoreFollowRequest;
use App\Http\Requests\UpdateFollowRequest;
use App\Models\Follow;
use App\Models\User;
use Auth;
use Exception;
use Hash;

class AuthController extends Controller
{
    public function register(RegisterRequest $request)
    {
        try {
            $validated = $request->validted();

            $validated['password'] = Hash::make($validated['password']);

            $user = User::create($validated);

            $user->tokens()->delete();

            $token = $user->createToken()->plainTextToken;

            return response()->json([
                'message' => 'Register success',
                'token' => $token,
                'user' => $user,

            ], 201);
        } catch (Exception $e) {
            throw $e;
        }
    }

    public function login(LoginRequest $request)
    {
        try {

            $validated = $request->validted();

            $validated['password'] = Hash::make($validated['password']);

            $user = User::where('username', $validated->username)->first();

            if (! $user || ! Hash::check($user->password, $request->password)) {
                return response()->json([
                    'message' => 'Wrong username or password',

                ], 201);
            }

            $user->tokens()->delete();

            $token = $user->createToken()->plainTextToken;

            return response()->json([
                'message' => 'Login success',
                'token' => $token,
                'user' => $user,

            ], 201);
        } catch (Exception $e) {
            throw $e;
        }
    }

    public function logout()
    {
        try {

            $user = Auth::user();

            $user->tokens()->delete();

            return response()->json([
                'message' => 'Logout success',

            ], 200);
        } catch (Exception $e) {
            throw $e;
        }
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
    public function store(StoreFollowRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Follow $follow)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Follow $follow)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateFollowRequest $request, Follow $follow)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Follow $follow)
    {
        //
    }
}
