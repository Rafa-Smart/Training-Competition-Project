<?php

namespace App\Http\Controllers;

use App\Http\Requests\SignInRequest;
use App\Http\Requests\SignUpRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    /**
     * POST /api/v1/auth/signup
     * Create a new player account and return a token.
     */
    public function signup(SignUpRequest $request)
    {
        $user = User::create([
            'username' => $request->username,
            'password' => Hash::make($request->password),
            'role'     => 'player',
        ]);

        $token = $user->createToken('api')->plainTextToken;

        return response()->json(['status' => 'success', 'token' => $token], 201);
    }

    /**
     * POST /api/v1/auth/signin
     * Verify credentials and return a token.
     */
    public function signin(SignInRequest $request)
    {
        $user = User::where('username', $request->username)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'status'  => 'invalid',
                'message' => 'Wrong username or password',
            ], 401);
        }

        // Update last login timestamp
        $user->update(['last_login_at' => now()]);

        $token = $user->createToken('api')->plainTextToken;

        return response()->json(['status' => 'success', 'token' => $token]);
    }

    /**
     * POST /api/v1/auth/signout
     * Revoke the current token.
     */
    public function signout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['status' => 'success']);
    }
}