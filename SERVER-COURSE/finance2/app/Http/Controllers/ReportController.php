<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCurrencyRequest;
use App\Http\Requests\UpdateCurrencyRequest;
use App\Models\Category;
use App\Models\Currency;
use App\Models\Transaction;
use Exception;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function expenseSumary(Request $request)
    {
        // nah diis kitapake this uuk akses fungsi private
        //
        $sumary = $this->getSumaryByType($request, 'EXPENSE');

        return response()->json([
            'status' => 'success',
            'message' => 'Get summary by expense category successful',
            'data' => [
                'sumary' => $sumary,
            ],
        ], 200);
    }


    public function incomeSumary(Request $request){
        $sumary = $this->getSumaryByType($request, 'INCOME');
        return response()->json([
            'status'=>'success',
            'message'=>'Get summary by expense category successful',
            'data'=>[
                'sumary'=>$sumary
            ]
        ]);
    }

    private function getSumaryByType(Request $request, string $type)
    {

        // nah jadi di sini itu kita akn ambil cateogry dari y      ang udah di kirim dari parameter
        // jadi bsia expense / income
        // jadi ini itu iisnya kana seluruh category yang tipneya dari tipe ya
        $categories = Category::where('type', $type)->get();

        // nah sekrang kita ak ambil dari transaksi semua transaksi berdasarkan si categoris kita ini
        // dan setlah tia ambil si transaksinya kita ambil juga walletnya yang id user di waletnya itu dari user id
        // sama dan mirip kaya yang di index yang ada di transaksi

        $sumary = $categories->map(function ($category) use ($request) {
            // nah karena kita itu butuh variable request didalam blok fungsi yang ada didalam fugnsi map si category
            // itu sbelmnya ga bisaya makanya diisni kita maskan aja gitu kaya parameter gtu jad bisa di akses di damal blok fungsi sini

            $query = Transaction::where('category.type', $category->type)->whereHas('wallet', function ($wl) {
                $wl->where('user_id', auth()->id);
            });

            if ($request->filled('month')) {
                // ini mirip bangt sama yang dari index di transaksi
                $query->whereMonth('date', $request->month);
            }

            if ($request->filled('year')) {
                $query->whereYear('date', $request->year);
            }

            $totalAmount = $query->sum('amount');

            return [
                'category' => $category,
                'amount' => $totalAmount,
            ];

        })->filter(function ($item) {
            return $item['amount'] > 0;
        })->values()->toArray();
        // nadh ajdi disni kitahnya ngambil yang amountnya lebih dari 0
        // nah kerena ini jadi nanti dia akan lobat lompat dan ngelewatin si arraynya
        // jadi yang asalnya indexnya itu ada 0,1,2,3,4
        // karean nanti udha di filter maka bisa jadi akan 2,4

        // maknaya kita harus ubha lagi ke value biar index arrynya jadi bener lagi
        // dan ingat ini tuh bukan aoke index tapi ini tuh array assosiatif

        return $sumary;

    }

    public function index()
    {
        try {

            $currencies = Currency::all();

            return response()->json([
                'status' => 'success',
                'message' => 'Get all currencies successful',
                'data' => [
                    'currencies' => $currencies,
                ],
            ]);

        } catch (Exception $e) {
            throw $e;
        }

    }

    /**=>
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
