<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTransactionRequest;
use App\Http\Requests\UpdateTransactionRequest;
use App\Models\Transaction;
use Illuminate\Http\Request;

class TransactionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $per_page = $request->query('per_page', 25);
        $query = Transaction::with(['wallet', 'category'])->whereHas('wallet', function ($w) {
            return $w->where('user_id', auth()->id());
        })->orderBy('date', 'desc');

        if ($request->filled('month')) {
            $query->where('date', $request->month);
        }

        if ($request->filled('year')) {
            $query->where('date', $request->year);
        }

        if ($request->filled('wallet_id')) {
            $query->where('date', $request->wallet_id);
        }

        return response()->json(
            $query->paginate($per_page), 200
        );

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
    public function store(StoreTransactionRequest $request)
    {
        $validated = $request->validated();
        $transaction = Transaction::create($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Transaction added successful',
            'data' => $transaction,
        ], 200);
    }

    /**
     * Display the specified resource.
     */
    public function show(Transaction $transaction)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Transaction $transaction)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateTransactionRequest $request, Transaction $transaction)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($transactionId)
    {
        $transaction = Transaction::with('wallet')->where('id', $transactionId)->get();

        if (! $transaction) {
            return response()->json([
                'status' => 'error',
                'message' => 'Not Found',
            ], 404);
        }

        if ($transaction->wallet->user_id != auth()->id()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Forbidden access',
            ], 403);
        }

        $transaction->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Transaction deleted successful',
        ], 403);
    }
}
