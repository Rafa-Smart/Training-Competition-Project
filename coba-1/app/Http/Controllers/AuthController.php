<?php
// app/Http/Controllers/AuthController.php
namespace App\Http\Controllers;

use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Traits\ApiResponse;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    use ApiResponse;

    // Register
    public function register(RegisterRequest $request)
    {
        try {
            $user = User::create([
                'full_name' => $request->full_name,
                'bio' => $request->bio,
                'username' => $request->username,
                'password' => Hash::make($request->password),
                'is_private' => $request->boolean('is_private', false),
            ]);

            $token = $user->createToken('auth_token')->plainTextToken;

            return $this->successResponse('Register success', [
                'token' => $token,
                'user' => [
                    'full_name' => $user->full_name,
                    'bio' => $user->bio,
                    'username' => $user->username,
                    'is_private' => $user->is_private,
                    'id' => $user->id,
                ]
            ], 201);

        } catch (\Exception $e) {
            return $this->errorResponse('Registration failed', [], 500);
        }
    }

    // Login
    public function login(LoginRequest $request)
    {
        try {
         $credentials = $request->only('username', 'password');

            if (!Auth::attempt($credentials)) {
                return $this->errorResponse('Wrong username or password', [], 401);
            }

            $user = Auth::user();
            $token = $user->createToken('auth_token')->plainTextToken;

            return $this->successResponse('Login success', [
                'token' => $token,
                'user' => [
                    'id' => $user->id,
                    'full_name' => $user->full_name,
                    'username' => $user->username,
                    'bio' => $user->bio,
                    'is_private' => $user->is_private,
                    'created_at' => $user->created_at->format('Y-m-d\TH:i:s.u\Z'),
                ]
            ]);

        } catch (\Exception $e) {
            return $this->errorResponse('Login failed', [], 500);
        }
    }

    // Logout
    public function logout(Request $request)
    {
        try {
            $request->user()->currentAccessToken()->delete();

            return $this->successResponse('Logout success');

        } catch (\Exception $e) {
            return $this->errorResponse('Logout failed', [], 500);
        }
    }
}