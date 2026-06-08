<?php

namespace App\Http\Controllers;

use App\Http\Requests\SignInRequest;
use App\Http\Requests\SignUpRequest;
use App\Models\Admin;
use App\Http\Requests\StoreAdminRequest;
use App\Http\Requests\UpdateAdminRequest;
use App\Models\User;
use Hash;
use Illuminate\Http\Request;

class AuthController extends Controller
{

    public function signUp(SignUpRequest $request){
        $data = $request->validated();

        $user = User::create([
            'username'=> $data['username'],
            'password'=> Hash::make($data['password']),
            'role'=>'player'
        ]);
        $user->tokens()->delete();

        $token = $user->createToken('sign up token')->plainTextToken;
        $user->token = $token;
        return response()->json([
            'status'=>'success',
            "data" => $user
        ], 200);
    }


    public function signIn(SignInRequest $request){
        $data = $request->validated();

        

        $user = User::where('username', $data['username'])->first();
        if(!$user || !Hash::check($data['password'], $user->password)){
            return response()->json([
                'status'=>'invalid',
                'message'=> 'Wrong username or password'
            ], 401);
        }


        $user->tokens()->delete();

        $token = $user->createToken('signin token')->plainTextToken;
        $user->token = $token;
        return response()->json([
            'status'=> 'success',
            'data'=>$user
        ], 200);
    }

    public function signOut(Request $request){
        $user = auth()->user();

        $user->tokens()->delete();
        return response()->json([
            'status'=>'success',
            'message'=>'berhasil logout'
        ], 200);
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        
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
    public function store(StoreAdminRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Admin $admin)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Admin $admin)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateAdminRequest $request, Admin $admin)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Admin $admin)
    {
        //
    }
}
