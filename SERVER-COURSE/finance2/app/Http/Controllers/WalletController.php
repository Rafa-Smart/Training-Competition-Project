<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreWalletRequest;
use App\Http\Requests\UpdateWalletRequest;
use App\Models\Wallet;
use Exception;

class WalletController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index($request)
    {
        try {
            $wallets = Wallet::all();

            return response()->json([
                'status' => 'success',
                'message' => 'Get all wallets successful',
                'data' => [
                    'wallets' => $wallets,
                    // nah ingat ya DISINI ITU UDAH ADA BALANCE YA
                ],
            ], 200);
        } catch (Exception $e) {

        }
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
        try {

            $wallet = Wallet::create([
                'user_id' => auth()->id,
                'name' => $request->name,
                'currency_code' => $request->currency_code,
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Wallet added successful',
                'data' => [
                    'name' => $wallet->name,
                    'user_id' => $wallet->user_id,
                    'updated_at' => $wallet->updated_at,
                    'created_at' => $wallet->created_at,
                    'id' => $wallet->id,
                    'currency_code' => $wallet->currency_code,
                ],
            ], 201);

        } catch (Exception $e) {
            throw $e;
        }
    }

    /**
     * Display the specified resource.
     */
    public function show($walletId)
    {
        try {
            $wallet = Wallet::find($walletId);

            if (! $wallet) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Not Found',
                ], 404);
            }

            if ($wallet != auth()->id) {
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
        } catch (Exception $e) {
            throw $e;
        }
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
    public function update(UpdateWalletRequest $request, $walletId)
    {
        try {
            $wallet = Wallet::find($walletId);

            if (! $wallet) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Not Found',
                ], 404);
            }

            if ($wallet->user_id != auth()->id) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Forbidden access',
                ], 403);
            }

            $wallet->update([
                'name' => $request->name,
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Wallet updated successful',
                'data' => $wallet,
            ], 200);

        } catch (Exception $e) {
            throw $e;
        }

    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($walletId)
    {
        try {
            $wallet = Wallet::find($walletId);
            if (! $wallet) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Not Found',
                ], 404);
            }

            if ($wallet->user_id != auth()->id) {
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
        } catch (Exception $e) {
            throw $e;
        }
    }
}
