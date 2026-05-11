<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreWalletRequest;
use App\Http\Requests\UpdateWalletRequest;
use App\Models\Wallet;
use Illuminate\Http\Request;

class WalletController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $wallets = Wallet::all();

        return response()->json([
            'status' => 'success',
            'message' => 'Get all wallets successful',
            'data' => $wallets,
        ], 200);
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
            'user_id' => auth()->id(),
            'name' => $data['name'],
            'currency_code' => $data['currency_code'],
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Wallet added successful',
            'data' => $wallet,
        ], 200);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, $walletId)
    {
        $wallet = Wallet::find($walletId)->get();
        if ($wallet->user_id != auth()->id()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Forbidden access',
            ], 403);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Get detail wallet successful',
            'data' => $wallet,
        ], 200);
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
    public function update(UpdateWalletRequest $request, Wallet $wallet)
    {
        $data = $request->validated();

        $wallet->update(['name' => $data['name']]);
        if ($wallet->user_id != auth()->id()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Forbidden access',
            ], 403);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Wallet updated successful',
            'data' => $wallet,
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, $walletId)
    {
        $wallet = Wallet::find($walletId)->get();
        if ($wallet->user_id != auth()->id()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Forbidden access',
            ], 403);
        }
        $wallet->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Wallet deleted successful',
        ], 200);
    }
}
