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
    public function index()
    {
        $wallets = Wallet::all();

        return response()->json([
            'status' => 'success',
            'message' => 'Get all wallets successful',
            'wallets' => $wallets], 200);
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
            $validated = $request->validated();
            $wallet = Wallet::create($validated);

            return response()->json([
                'status' => 'success',
                'message' => 'Wallet added successful',
                'data' => $wallet], 200);
        } catch (Exception $e) {
            throw $e;
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Wallet $wallet)
    {
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

        try {
            $validated = $request->validated();
            // $walletData = $wallet;
            // if (! $walletData) {
            //     return response()->json([
            //         'status' => 'error',
            //         'message' => 'Not found',
            //     ], 404);
            // }

            // KITA UDHA PAKE INI YA AJDI GA AKN ERROR DAN UDAH DI NAGAIN ERRO NOT FOUNDNYA SEMAUNYA OKE JADI APS EDIT ATAU SHOW ITU TNGGAL AJA PAKE TIPE DATANYA
            //  $exceptions->render(function (NotFoundResourceException $err, Request $request) {
            //     return response()->json([
            //         'status' => 'error',
            //         'message' => 'Not found',
            //     ], 404);
            // });

            if ($wallet->user_id != auth()->id()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Forbidden access',
                ], 403);
            }

            $wallet->update(['name' => $validated['name']]);

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
    public function destroy(Wallet $wallet)
    {
        // ini juga sama ya jadi kit udah ada eror handling untuk error not foundnya

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
