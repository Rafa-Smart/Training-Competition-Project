<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Requests\StoreCurrencyRequest;
use App\Http\Requests\UpdateCurrencyRequest;
use App\Models\Currency;
use App\Models\User;
use Exception;
use Illuminate\Support\Facades\Hash;
use Request;

class AuthController extends Controller
{
    public function register(RegisterRequest $request)
    {
        try {
            $validated = $request->validated();
            // ini balkah ajdi array ya bukan objek jadi bsia di mass atau pas apnggilnya harus apke [''];

            $user = User::create([
                'name' => $validated['full_name'],
                'password' => Hash::make($validated['password']),
                'email' => $validated['email'],
            ]);

            $user->tokens()->delete();

            $token = $user->createToken('register token')->plainTextToken;

            // $user[] = $token; salah nih karena user itu adalh objek dari user

            // makanya kita bisa pake ini, soalnya di laravel itu kita bisa nambahin atribute di dalam obek si modelnya

            // $user->name   //  benar
            // $user['name'] //  jangan
            // $user[]       //  salah total

            // jadi bisa gini
            $user->token = $token;

            return response()->json([
                'status' => 'success',
                'message' => 'Registration successful',
                'data' => $user,
            ], 201);
        } catch (Exception $e) {
            throw $e;
        }
    }

    public function login(LoginRequest $request)
    {
        try {
            $validated = $request->validated();
            // ini balkah ajdi array ya bukan objek jadi bsia di mass atau pas apnggilnya harus apke [''];

            $user = User::where('email', $request->email);
            if (! $user || ! Hash::check($validated['password'], $user->password)) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Username or password incorrect',
                ], 401);
            }

            $user->tokens()->delete();

            $token = $user->createToken('login token')->plainTextToken;

            // $user[] = $token; salah nih karena user itu adalh objek dari user

            // makanya kita bisa pake ini, soalnya di laravel itu kita bisa nambahin atribute di dalam obek si modelnya

            // $user->name   //  benar
            // $user['name'] //  jangan
            // $user[]       //  salah total

            // jadi bisa gini
            $user->token = $token;

            return response()->json([
                'status' => 'success',
                'message' => 'Login successful',
                'data' => $user,
            ], 200);
        } catch (Exception $e) {
            throw $e;
        }
    }

    public function logout(Request $request)
    {
        try {
            $user = auth()->user();
            $user->tokens->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Logout Successful',
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
    public function store(StoreCurrencyRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Currency $currency)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Currency $currency)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCurrencyRequest $request, Currency $currency)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Currency $currency)
    {
        //
    }
}
