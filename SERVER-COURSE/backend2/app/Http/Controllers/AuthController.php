<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Models\User;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(RegisterRequest $request)
    {
        try {
            DB::beginTransaction();                                                                   
            // $user = User::create($request->validated());
            // $user->password = Hash::make($request->password);
            // $user->save();

            $data = $request->validated();
            $data['password'] = Hash::make($data['password']);
            $user = User::create($data);

            $user->tokens()->delete();

            $token = $user->createToken('auth_token')->plainTextToken;

            DB::commit();

            return response()->json([
                'message' => 'Register success',
                'token' => $token,
                'user' => [
                    'full_name' => $user->full_name,
                    'bio' => $user->bio,
                    'username' => $user->username,
                    'is_private' => $user->is_private,
                    'id' => $user->id,
                ],
            ], 201);

        } catch (Exception $e) {
            throw $e;
        }
    }


    public function login(LoginRequest $request)
    {
        try {
            DB::beginTransaction();
            $user = User::where('username', '=', $request->username)->first();
            if (! $user || ! Hash::check($request->password, $user->password)) {
                return response()->json([
                    'message' => 'Wrong username or password',
                ], 401);

            }

            $user->tokens()->delete();

            $token = $user->createToken('auth_token')->plainTextToken;

            DB::commit();

            return response()->json([
                'message' => 'Login success',
                'token' => $token,
                'user' => [
                    'full_name' => $user->full_name,
                    'bio' => $user->bio,
                    'username' => $user->username,
                    'is_private' => $user->is_private,
                    'id' => $user->id,
                ],
            ], 200);

        } catch (Exception $e) {
            throw $e;
        }
    }

    public function logout()
    {
        try {
            DB::beginTransaction();

            Auth::user()->tokens()->delete();

            DB::commit();

            return response()->json([
                'message' => 'logout success',
            ], 201);

        } catch (Exception $e) {
            throw $e;
        }
    }
}
