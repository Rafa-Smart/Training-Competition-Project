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
        $per_page = $request->per_page || 25;
        // atau bsia juga pake 
        //  $per_page = $request->query('per_page') || 25;

        $transactions = Transaction::with(['category', 'wallet'])->whereHas('wallet', function($wallet){
            if($wallet->user_id == auth()->id()){
                return $wallet;
            }

            // atau gini
            // $wallet->where('user_id', auth()->id());
        })->orderBy('date', 'desc');
        // disini gausha pake terminated query ya, nani soalnya pas pagenate, tu adalah terminatednya / get() gitu lah

        if($request->has('year')){
            $transactions->whereYear('date',$request->year);
        }
        if($request->has('month')){
            $transactions->whereMonth('date',$request->month);
        }

        // nah ini wallet_id kita pake ya kalo ada
        if($request->has('wallet_id')){
            $transactions->where('wallet_id', $request->wallet_id);
        }
        return response()->json(
            $transactions->paginate($per_page), 200
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
            'wallet_id' => $data['wallet_id'],
            'category' => $data['category'],
            'amount' => $data['amount'],
            'date' => $data['date'],
            'note' => $data['note'],
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Transaction added successful',
            'data' => $transaction,
        ], 201);

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
        // https://chatgpt.com/c/6a181b29-904c-83ec-badd-82af480fc432
        // PENTING BANGET, TERNYATA DI LARAVEL ITU  kalo misalnya kita query ebuah model yang dimana model in itu punya relasi ke tabel lain dan ita ignin mendapatkan data di tabel yang beraalasitersebut, kita sebenrnya ga perlu pake with ya

        // JADI WITHITU CUMA EAGER LOADING GITU, JADI TERNYATA OTOMATIS SI LARAVEL KALO KTIA GA PAKE WITH ITU DIA AKNA LANGSUNG UERY OTOMATIS KE TABEL RELASINYA INI GITUUUUU namanya Lazy Loading
        // nah kalo pake with itu artinya kita pake Eager Loading

        // TPI KLO MAU PAKE JUGA GAPAPA, BERTAI NANTI BSIA PAKE YANG KAYA GINI
        // $transaction->load(['wallet']);

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
        ], 201);
    }
}
