<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCurrencyRequest;
use App\Http\Requests\UpdateCurrencyRequest;
use App\Models\Category;
use App\Models\Currency;
use App\Models\Transaction;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    /**
     * Display a listing of the resource.
     */

    public function getExpense(Request $request){
        $summary = $this->getSummaryByType($request, "EXPENSE");
        return response()->json([
            'status'=> 'success',
            'message'=> 'Get summary by expense category successful',
            'data'=> $summary
        ]);
    }
        public function getIncome(Request $request){
        $summary = $this->getSummaryByType($request, "INCOME");
        return response()->json([
            'status'=> 'success',
            'message'=> 'Get summary by income category successful',
            'data'=> $summary
        ]);
    }

    private function getSummaryByType(Request $request, string $type){
        $categories = Category::where('type', $type)->get();

        $summary = $categories->map(function($category) use ($request){
            $query = Transaction::where('category_id', $category->id)->whereHas('wallet', function($w){
                return $w->where('user_id', auth()->id());
            });

            if($request->filled('month')){
                $query->where('date', $request->month);
            }
            if($request->filled('year')){
                $query->where('date', $request->year);
            }


            // setelah itu kita sum dan tiap loop ini kita abil category dan total trasaksi didalam categoy ini

            $totalAmount = $query->sum('amount');

            return [
                'category'=>$category,
                'amount'=>$totalAmount
            ];
        })->filter(function($s){
            return $s['amount']> 0;
        })->values()->toArray();
        return $summary;
    }



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
    public function store(StoreCurrencyRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Currency $currency)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Currency $currency)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCurrencyRequest $request, Currency $currency)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Currency $currency)
    {
        //
    }
}
