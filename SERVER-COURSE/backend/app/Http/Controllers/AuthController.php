<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Traits\ApiResponse;
use App\Models\User;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    use ApiResponse;

    public function register(RegisterRequest $registerRequest)
    {

        try {
            DB::beginTransaction();
            $user = User::create($registerRequest->validated());
            $user->password = Hash::make($registerRequest->password);
            $user->save();

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
            DB::rollBack();

            return $this->errorResponse('error register', [], 500);
        }
    }

    public function login(LoginRequest $loginRequest)
    {
        try {

            // ini ribe mending manual aja
            // // cek username dan password
            // $credentials = $loginRequest->only('username', 'password');
            // if (! Auth::attempt($credentials)) {
            //     return $this->errorResponse('Wrong username or password', [], 401);
            // }

            $user = User::where('username', $loginRequest->username)->first();

            if (! $user || ! Hash::check($loginRequest->password, $user->password)) {
                return $this->errorResponse('Wrong username or password', [], 401);
            }

            // $user = Auth::user();

            // kita hapus dulu seluruh toke yang ada sebelumna
            $user->tokens()->delete();

            $token = $user->createToken('auth_token')->plainTextToken;

            // return response()->json([
            //     'message' => 'Login success',
            //     'token' => '2|Qnt2aqHIi0EVwCz3rSH0yiFIKMqey38SdkUZntRvf0e507ff',
            //     'user' => [
            //         'id' => 1,
            //         'full_name' => 'John Doe',
            //         'username' => 'john.doe',
            //         'bio' => 'The best way to predict the future is to create it.',
            //         'is_private' => 0,
            //         'created_at' => '2023-10-14T15:04:33.000000Z',
            //     ],

            // ]);

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
            ], 201);

        } catch (Exception $e) {

            return $this->errorResponse('error login', ['errors' => $e], 500);
        }
    }

    public function logout(Request $request)
    {
        try {
            Auth::user()->currentAccessToken()->delete();

            return response()->json([
                'message' => 'logout success',
                'user' => Auth::user()->token,
            ]);
        } catch (Exception $e) {
            return $this->errorResponse('error logout', [], 500);
        }
    }
}
