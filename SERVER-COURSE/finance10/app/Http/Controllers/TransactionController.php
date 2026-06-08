<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Http\Requests\StoreTransactionRequest;
use App\Http\Requests\UpdateTransactionRequest;
use Gate;
use Illuminate\Http\Request;

class TransactionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $per_page = $request->query('per_page') ?? 5;
        $transactions = Transaction::with(['category', 'wallet'])->whereHas('wallet', function($w){
            return $w->where('user_id', auth()->id());
        })->orderBy('date', 'desc');

        if($request->has('year')){
            $transactions->whereYear('date', $request->year);
        }
        if($request->has('month')){
            $transactions->whereMonth('date', $request->month);
        }
        if($request->has('wallet_id')){
            $transactions->where('wallet_id', $request->wallet_id);
        }
    return response()->json([
            $transactions->paginate($per_page)
        ], 200);
    return response()->json(
    $transactions->paginate($per_page),
    200
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
        $data = $request->validated();
        $transaction = Transaction::create([
            'wallet_id'=>$data['wallet_id'],
            'category_id'=>$data['category_id'],
            'amount'=>$data['amount'],
            'note'=>$data['note'],
            'date'=>$data['date'],
        ]);
        return response()->json([
            'status' => 'success',
            'message' => "Transaction added successful",
            'data'=>$transaction
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
    public function destroy(Transaction $transaction)
    {
        Gate::authorize('delete', $transaction);
        $transaction->delete();
         return response()->json([
            'status' => 'success',
            'message' => "Transaction deleted successful" 
        ], 200);
    }
}
