<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Transaction;
use App\Http\Requests\StoreTransactionRequest;
use App\Http\Requests\UpdateTransactionRequest;
 
use Illuminate\Http\Request;

class ReportController extends Controller
{
    /**
     * Display a listing of the resource.
     */

    public function expense(Request $request){
        $summary = $this->summaryBy($request, "EXPENSE");
        return response()->json([
            'status'=>'message',
            'message'=> 'Get summary by expense category successful',
            'data'=>[
                'summary'=> $summary
            ]
        ], 200);
    }

    public function income(Request $request){
    $summary = $this->summaryBy($request, "INCOME");
        return response()->json([
            'status'=>'message',
            'message'=> 'Get summary by income category successful',
            'data'=>[
                'summary'=> $summary
            ]
        ], 200);    
    }

    protected function summaryBy(Request $request, string $type){
        $categories = Category::where('type', $type)->get();

        $summary = $categories->map(function($category) use ($request){
            $data = Transaction::with(['category', 'wallet'])->whereHas('wallet', function($w) {
                return $w->where('user_id', auth()->id());
            });

            if($request->has('month')){
                $data->whereMonth('date', $request->month);
            }
            if($request->has('year')){
                $data->whereYear('date', $request->year);
            }

            $total = $data->sum('amount');
            return [
                'category'=>$category,
                'amount'=>$total
            ];
        })->filter(function($d){
            return $d['amount']> 0;
        })->values()->toArray();
    return $summary;
    }

    public function index(Request $request)
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
    public function store(StoreTransactionRequest $request)
    {
        //  
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
        //  
    }
}
