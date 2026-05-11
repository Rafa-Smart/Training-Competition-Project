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

        $per_page = $request->query('per_page');

        $transactions = Transaction::with(['category', 'walelt'])->whereHas('wallet', function ($w) {
            return $w->where('user_id', auth()->id());
        });

        if ($request->has('month')) {
            $transactions->whereMonth('date', $request->month);
        }if ($request->has('year')) {
            $transactions->whereYear('date', $request->year);
        }if ($request->has('wallet_id')) {
            $transactions->where('wallet_id', $request->wallet_id);
        }

        return response()->json($transactions->paginate($per_page), 200);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create() {}

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreTransactionRequest $request)
    {
        $data = $request->validated();
        $transaction = Transaction::create($data);

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
        $transaction = Transaction::with('wallet')->find($transactionId)->get();
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
        ], 200);
    }
}
