<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreWalletRequest;
use App\Http\Requests\UpdateWalletRequest;
use App\Models\Wallet;

class WalletController extends Controller
{
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
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(Wallet $wallet)
    {
        //
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

        $wallet = Wallet::create([
            'user_id' => auth()->id(),
            'name' => $data['name'],
            'currency_code' => $data['currency_code'],
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Wallet added successful',
            'data' => $wallet,
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Wallet $wallet)
    {
        //
    }
}
