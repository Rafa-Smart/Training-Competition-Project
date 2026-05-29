<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreReportRequest;
use App\Http\Requests\UpdateReportRequest;
use App\Models\Category;
use App\Models\Report;
use App\Models\Transaction;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function expense(Request $request)
    {
        $summary = $this->getSummary($request, 'EXPENSE');

        return response()->json([
            'status' => 'success',
            'message' => 'Get summary by expense category successful',
            'data' => [
                'summary' => $summary,
            ],
        ]);
    }

    public function income(Request $request)
    {
        $summary = $this->getSummary($request, 'INCOME');

        return response()->json([
            'status' => 'success',
            'message' => 'Get summary by income category successful',
            'data' => [
                'summary' => $summary,
            ],
        ]);
    }

    public function getSummary(Request $request, string $type)
    {
        $categories = Category::where('type', $type)->get();
        $summary = $categories->map(function ($category) use ($request) {
            $query = Transaction::with(['category', 'wallet'])->whereHas('wallet', function ($w) {
                $w->where('user_id', auth()->id());
            });

            if ($request->has('year')) {
                $query->whereYear('date', $request->year);
            }
            if ($request->has('month')) {
                $query->whereMonth('date', $request->month);
            }

            $total = $query->sum('amount');

            return [
                'category' => $category,
                'amount' => $total,
            ];
        })->filter(function ($d) {
            return $d['amount'] > 0;
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
    public function store(StoreReportRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Report $report)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Report $report)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateReportRequest $request, Report $report)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Report $report)
    {
        //
    }
}
