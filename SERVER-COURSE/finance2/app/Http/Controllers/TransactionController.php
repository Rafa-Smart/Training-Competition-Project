<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTransactionRequest;
use App\Http\Requests\UpdateTransactionRequest;
use App\Models\Transaction;
use Exception;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Http\Client\Request;

class TransactionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {

        // oh jadi gini ya kalo param / url segmetnitu yang ada diurl nya 
        // kaya products/4
        // 4 adlah segment
        // dan dia akan masuk sebagai parameter di dalam si fungsi controllernya

        // nah tapi query parameter itu yang di ul juga
        // TPAI DIA PAKE ?
        // MISALNYA WALLET?PAGE=2

        // NAH INI TUH DIAMBILNYA PAKE REQUEST->QUERY


        // nah jadi nanti akan di kirim dari frontenya itu pake cara Request Parameters
        // jadi nanti di bjek ke dua di oaxios ake {params}
        // ini pake cara kirim pake params
        // export const getTransactions = (params = {}) => api.get("/transactions", { params });

        // nah ini baru yang pake data body ya
        // data: { wallet_id, category_id, amount, date, note (opsional) }
        // export const addTransaction = (data) => api.post("/transactions", data);

        $per_page = $request->query('per_page', 25); // nah ini tuh jdainya defaulntya adalah 25

        // pertama kita buat dulu transaksinya pake category dan juga alletnya

        // nah ini kita masuk ke wallet lalu di walletnya kita cari user idnya sama dnegan auth()->id
        $query = Transaction::with(['category', 'wallet'])->whereHas('wallet', function($wallet){
            $wallet->where('user_id', auth()->id);
        })->orderBy('date', 'desc');


        if(!$query->id != auth()->id ){
            return response()->json([
                'status'
            ]);
        }

        return response()->json([]);
        }catch(Exception $e){
            throw $e;
        }
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
        try {
            $transaction = Transaction::create([
                'category_id' => $request->category_id,
                'wallet_id' => $request->wallet_id,
                'amount' => $request->amount,
                'note' => $request->note,
                'date' => $request->date,
            ]);

            // atau karena sama aja bisa ake mass assgment

            // $transactions = Transaction::create($request->all());

            return response()->json([
                'status' => 'success',
                'message' => 'Transaction added successful',
                'data' => $transaction,
            ], 200);
        } catch (Exception $e) {
            throw $e;
        }
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
        $transaksi = Transaction::find($transactionId);
        if (! $transaksi) {
            return response()->json([
                'status' => 'error',
                'message' => 'Not Found',
            ], 404);
        }

        // if ($transaksi->wallet()->user_id != auth()->id()) {
        // itu alah ya yang dia atas
        //  Kenapa salah?
        // wallet() itu function
        // yang dikembalikan adalah Relation object, bukan data wallet
        // Jadi ini kira-kira seperti:
        // RelationObject->user_id
        //  user_id tidak ada di situ → bisa error / undefined
        //  2. Yang benar
        //  Benar:
        // if ($transaksi->wallet->user_id != auth()->id())
        // Ini artinya:
        // wallet = akses relasi sebagai property
        // Laravel otomatis:
        // ambil data wallet dari DB (lazy loading)
        // return Model Wallet
        // Jadi:
        // WalletModel->user_id

        if ($transaksi->wallet->user_id != auth()->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Forbidden Access',
            ], 403);
        }

        $transaksi->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Transaction deleted successful',
        ], 200);
    }
}
