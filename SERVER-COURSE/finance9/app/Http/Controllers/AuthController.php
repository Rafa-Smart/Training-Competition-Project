<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Models\Currency;
use App\Http\Requests\StoreCurrencyRequest;
use App\Http\Requests\UpdateCurrencyRequest;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{

    public function register(RegisterRequest $request){
        $data = $request->validated();

        $user = User::create([
            'name'=>$data['full_name'],
            'email'=> $data['email'],
            'password'=> Hash::make($data['password'])
        ]);

        $user->tokens()->delete();

        $token = $user->createToken('register token')->plainTextToken;
        $user->token = $token;
        return response()->json([
            'status'=>'success',
            'message'=> 'Registration successful',
            'data'=>$user
        ], 200);
    }

     public function login(LoginRequest $request){
        $data = $request->validated();

        $user = User::where('email', $data['email'])->firstOrFail();
        if(!$user || Hash::check($user->password, $data['password'])){
            return response()->json([
                'status'=>'error',
                'message'=> 'Username or password incorrect'
            ],401 );
        }

        $user->tokens()->delete();

        $token = $user->createToken('login token')->plainTextToken;
        $user->token = $token;
        return response()->json([
            'status'=>'success',
            'message'=> 'Login successful',
            'data'=>$user
        ], 200);
    }

    public function logout(){
        $user = auth()->user();

        $user->tokens()->delete();

         return response()->json([
            'status'=>'success',
            'message'=> 'Logout successful', 
        ], 200);
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
