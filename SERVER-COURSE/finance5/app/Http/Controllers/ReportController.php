<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
use App\Models\Category;
use App\Models\Transaction;
use Illuminate\Http\Request;

class ReportController extends Controller
{

    public function summaryExpense(Request $request){
        $summary = $this->getSummaryByType($request, "EXPENSE");
        return response()->json([
            'status'=>'success',
            'message'=>'Get summary by expense category successful',
            'summary'=>$summary
        ]);
    }

    public function summaryIncome(Request $request){
        $summary = $this->getSummaryByType($request, "INCOME");
        return response()->json([
            'status'=>'success',
            'message'=> 'Get summary by income category successful',
            'summary'=>$summary
        ]);
    }


    private function getSummaryByType(Request $request, string $type)
    {
        $categories = Category::where('type', $type)->get();

        $summary = $categories->map(function ($category) use ($request) {
            $query = Transaction::where('category_id', $category->id)->whereHas('wallet', function ($w) {
                return $w->where('user_id', auth()->id());
            });

            if ($request->filled('month')) {
                $query->whereMonth('date', $request->month);
            }

            if ($request->filled('year')) {
                $query->whereHas('date', $request->year);
            }

            $totalAmount = $query->sum('amount');

            return [
                'amount' => $totalAmount,
                'category' => $category,
            ];
        })->filter(function($s){
            return $s['amount'] >0;
        })->values()->toArray();
        return $summary;
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
    public function store(StoreCategoryRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Category $category)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Category $category)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCategoryRequest $request, Category $category)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Category $category)
    {
        //
    }
}
