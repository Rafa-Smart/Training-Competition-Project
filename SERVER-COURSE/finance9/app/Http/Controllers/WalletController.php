<?php

namespace App\Http\Controllers;

use App\Models\Wallet;
use App\Http\Requests\StoreWalletRequest;
use App\Http\Requests\UpdateWalletRequest;

class WalletController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $wallets = Wallet::where('user_id', auth()->id())->get();
         return response()->json([
            'status'=>'success',
            'message'=> "Get all wallets successful",
            'data'=>[
                'wallets'=>$wallets
            ]    
        ], 201);

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
    public function store(StoreWalletRequest $request)
    {
        $data = $request->validated();
        $wallet = Wallet::create([
            'user_id'=>auth()->id(),
            'name'=>$data['name'],
            'currency_code'=>$data['currency_code']
        ]); 
        return response()->json([
            'status'=>'success',
            'message'=> "Wallet added successful",
            'data'=>$wallet
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Wallet $wallet)
    {
        if($wallet->user_id != auth()->id()){
             return response()->json([
            'status'=>'error',
            'message'=> "Forbidden access" 
        ], 403);
        }
        return response()->json([
            'status'=>'success',
            'message'=> "Get detail wallet successful",
            'data'=>$wallet
        ], 201);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Wallet $wallet)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    // public function update(UpdateWalletRequest $request, $walletId)
    // {
    //     $data = $request->validated();
    //     $wallet = Wallet::with(['user'])->findOrFail($walletId);
    //     if($wallet->user_id != auth()->id()){
    //         return response()->json([
    //         'status'=>'error',
    //         'message'=> "Forbidden access" 
    //     ], 203);
    //     }
    //     $wallet->update([
    //         'name'=>$data['name']
    //     ]);
    //     $wallet->save();

    //      return response()->json([
    //         'status'=>'success',
    //         'message'=> "Wallet updated successful",
    //         'data'=>$wallet
    //     ], 201);
    // }

     public function update(UpdateWalletRequest $request, Wallet $wallet)
    {
        // gini juga bisa ya
        $data = $request->validated();
        if($wallet->user_id != auth()->id()){
            return response()->json([
            'status'=>'error',
            'message'=> "Forbidden access" 
        ], 403);
        }
        $wallet->update([
            'name'=>$data['name']
        ]);
        $wallet->save();

         return response()->json([
            'status'=>'success',
            'message'=> "Wallet updated successful",
            'data'=>$wallet
        ], 201);
    }
    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Wallet $wallet)
    {
        if($wallet->user_id != auth()->id()){
           return response()->json([
            'status'=>'error',
            'message'=> "Forbidden access" 
        ], 403);
        }

        $wallet->delete();
        return response()->json([
            'status'=>'success',
            'message'=> "Wallet deleted successful", 
        ], 200);
    }
}
