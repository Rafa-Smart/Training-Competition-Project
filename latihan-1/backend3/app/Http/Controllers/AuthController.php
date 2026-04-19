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
            $data = $request->validated();
            $data['password'] = Hash::make($data['password']);

            $user = User::create($data);

            $user->tokens()->delete();

            $token = $user->createToken('auth user')->plainTextToken;

            return response()->json([
                'messaage' => 'Register success',
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
            $data = $request->validated();

            $user = User::where('username', $data->username)->first();

            if (! $user || Hash::check($data->password, $user->password)) {
                return response()->json([
                    'messaage' => 'Wrong username or password',
                ], 404);
            }

            $user->tokens()->delete();

            $token = $user->createToken('auth user')->plainTextToken;

            return response()->json([
                'messaage' => 'Login success',
                'token' => $token,
                'user' => $user,
            ], 201);

        } catch (Exception $e) {
            throw $e;
        }
    }

    public function logout()
    {
        Auth::user()->tokens()->delete();

        return response()->json([
            'messaage' => 'Logout success',
        ], 204);
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
