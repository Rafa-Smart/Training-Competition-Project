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
    public function summaryExpense(Request $request)
    {
        $summary = $this->getSummaryByType($request, 'EXPENSE');

        return response()->json([
            'status' => 'success',
            'message' => 'Get summary by expense category successful',
            'data' => $summary,
        ],200);
    }
    public function summaryIncome(Request $request)
    {
        $summary = $this->getSummaryByType($request, 'INCOME');

        return response()->json([
            'status' => 'success',
            'message' => 'Get summary by income category successful',
            'data' => $summary,
        ], 200);
    }

    private function getSummaryByType(Request $request, string $type)
    {
        $categories = Category::where('type', $type)->get();

        $sumarry = $categories->map(function ($category) use ($request) {
            $query = Transaction::with(['wallet', 'category'])->where('category.type', $category)->whereHas('wallet', function ($w) {
                return $w->where('user_id', auth()->id());
            });
            if ($request->has('month')) {
                $query->whereMonth('date', $request->month);
            }
            if ($request->has('year')) {
                $query->whereYear('date', $request->year);
            }

            $totalAmount = $query->sum('amount');

            return [
                'category' => $category,
                'amount' => $totalAmount,
            ];
        })->filter(function ($s) {
            $s['amount'] > 0;
        })->values()->toArray();

        return $sumarry;
    }

    public function index()
    {
        $currencies = Currency::all();

        return response()->json([
            'message' => 'Get all currencies successful',
            'data' => [
                'currencies' => $currencies,
            ],
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
