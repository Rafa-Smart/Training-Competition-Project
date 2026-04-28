<?php

namespace App\Http\Controllers;

/**
 * FILE: app/Http/Controllers/TransactionController.php
 *
 * Controller ini menangani semua endpoint TRANSACTION:
 * - store()   → POST   /api/transactions               (D1) Catat transaksi baru
 * - destroy() → DELETE /api/transactions/:transactionId (D2) Hapus transaksi
 * - index()   → GET    /api/transactions               (D3) Ambil semua transaksi (dengan filter & paginasi)
 *
 * POIN PENTING:
 * Saat ADD transaksi, kita perlu memastikan wallet_id yang dikirim
 * adalah milik user yang sedang login. Kenapa? Karena walaupun wallet_id sudah
 * divalidasi "exists:wallets,id", bisa saja user mengirim wallet_id milik orang lain!
 * Kita harus cegah itu.
 *
 * TENTANG PAGINATION (D3):
 * Laravel punya fungsi paginate() yang langsung menghasilkan format pagination
 * lengkap: current_page, last_page, total, dll. Persis seperti yang diminta soal.
 */

use App\Http\Requests\StoreTransactionRequest;
use App\Models\Transaction;
use App\Models\Wallet;
use Illuminate\Http\Request;

class TransactionController extends Controller
{
    /**
     * store() → POST /api/transactions
     *
     * Alur:
     * 1. Validasi input via StoreTransactionRequest
     * 2. Cek apakah wallet_id yang dikirim adalah MILIK user yang login
     *    → Kalau bukan → 403 Forbidden (user tidak boleh tambah transaksi ke wallet orang lain)
     * 3. Simpan transaksi ke database
     * 4. Return data transaksi baru
     *
     * Kenapa cek ownership wallet di sini, bukan di FormRequest?
     * Karena di FormRequest kita hanya validasi FORMAT data (apakah valid/tidak).
     * Pengecekan BISNIS (apakah boleh/tidak boleh) lebih tepat di Controller.
     */
    public function store(StoreTransactionRequest $request)
    {
        // Cek apakah wallet_id yang dikirim adalah milik user yang login
        $wallet = Wallet::find($request->wallet_id);

        if ($wallet->user_id !== auth()->id()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Forbidden access',
            ], 403);
        }

        // Buat transaksi baru
        $transaction = Transaction::create([
            'wallet_id' => $request->wallet_id,
            'category_id' => $request->category_id,
            'amount' => $request->amount,
            'date' => $request->date,
            'note' => $request->note,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Transaction added successful',
            'data' => $transaction,
        ], 201);
    }

    /**
     * destroy() → DELETE /api/transactions/{transactionId}
     *
     * Alur:
     * 1. Cari transaksi berdasarkan ID → 404 jika tidak ada
     * 2. Cek ownership: ambil wallet-nya, lalu cek apakah wallet itu milik user login
     *    → 403 jika bukan miliknya
     * 3. Hapus transaksi (HARD DELETE - data benar-benar hilang dari DB)
     *
     * Kenapa cek ownership via wallet, bukan langsung dari transaksi?
     * Karena tabel transactions tidak punya kolom user_id. Yang tahu siapa pemiliknya
     * adalah wallet-nya. Jadi kita perlu ambil wallet dari transaksi itu dulu.
     *
     * Kenapa HARD DELETE, bukan soft delete seperti wallet?
     * Karena soal tidak menyebutkan 'deleted_at' pada tabel transactions di ER Diagram.
     * Kalau wallet pakai soft delete karena ada kolom deleted_at di schema-nya.
     */
    public function destroy($transactionId)
    {
        // Sekaligus load relasi wallet-nya agar tidak perlu query lagi
        $transaction = Transaction::with('wallet')->find($transactionId);

        if (! $transaction) {
            return response()->json([
                'status' => 'error',
                'message' => 'Not found',
            ], 404);
        }

        // Cek apakah wallet pemilik transaksi ini adalah milik user yang login
        if ($transaction->wallet->user_id !== auth()->id()) {
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

    /**
     * index() → GET /api/transactions
     *
     * Ambil semua transaksi milik user, diurutkan dari terbaru, dengan pagination.
     *
     * FILTER OPSIONAL:
     * - ?month=7     → filter hanya transaksi di bulan Juli
     * - ?year=2025   → filter hanya transaksi di tahun 2025
     * - ?page=2      → halaman ke-2
     * - ?per_page=10 → 10 data per halaman (default 25)
     *
     * CARA KERJA QUERY BUILDER:
     * Kita mulai dari query dasar, lalu tambahkan kondisi WHERE secara berantai (chaining).
     * Kalau month/year tidak dikirim → kondisi itu dilewati, tidak ditambahkan ke query.
     *
     * EAGER LOADING dengan with(['wallet', 'category']):
     * Ini memuat data wallet dan category dalam SATU query tambahan saja,
     * bukan N+1 query (query per transaksi). Jauh lebih efisien.
     *
     * PAGINATION:
     * paginate($perPage) otomatis menghasilkan object dengan:
     * current_page, data[], from, last_page, per_page, to, total
     * Persis seperti yang diminta di response D3.
     */
    public function index(Request $request)
    {
        $perPage = $request->query('per_page', 25);

        $query = Transaction::with(['wallet', 'category'])
            ->whereHas('wallet', function ($q) {
                $q->where('user_id', auth()->id());
            })
            ->orderBy('date', 'desc');

        // Filter bulan
        // ini ga papa ya soalnya nanti itu kit hnya ambil perhari ajah jai engga per bulan atau per thun
        // Only show the date once per group;
        // hide if it's the same as the previous
        // transaction’s date.
        // tuh lihat perdate ya artinya prehari atua pertanggal

        if ($request->filled('month')) {
            $query->whereMonth('date', $request->month);
        }

        // Filter tahun
        // ini fungsinya adalah ini Cek apakah input month ADA dan TIDAK KOSONG
        // ntuk filled
        if ($request->filled('year')) {
            $query->whereYear('date', $request->year);
        }

        //  WAJIB (biar WalletDetail clean)
        // ini yang dari wallet detail ya, karean dari walet detail itu dia akn kirim wallet_id
        //         const {
        //     transactions,
        //     loading: txLoading,
        //     hasMore,
        //     loadMore,
        //     fetchPage,
        // } = useInfiniteTransactions({
        //     wallet_id: walletId,
        //     month: selectedMonth,
        //     year: selectedYear,
        // });
        if ($request->filled('wallet_id')) {
            $query->where('wallet_id', $request->wallet_id);
        }

        // nah ini yang dari overview ya jadi dia ga ngirim  parameter apa apa gitu
        //   const { transactions, loading, hasMore, loadMore, reload, fetchPage } =
        // useInfiniteTransactions({});

        // kalo ga ngirim apa apa berati kan dia engga akan di filter gara gara wallet_id
        // jadi nanti smeua transksi di seua wallet akan terlihat gituu
        // makanya yang dari walletDetil butuh walletId (dan disni juga filternya itu kalo ada)

        // tapi kalo dari overview, itu itu dia ga perlu walet_id kan solanya
        // dia akan ngambil seluruh transaksi dan ga perlu filter wallet
        // dna in juga waletnya itu duah di filter di atas ya jadi hanya milikuser id ini saja

        return response()->json(
            $query->paginate($perPage),
            200
        );

        // $query->paginate($perPage)
        // Ini bukan sekadar ambil data tapi:
        // Ambil data + bagi jadi halaman (pagination)
        // Misalnya:
        // $perPage = 10;
        // Artinya:
        // Halaman 1 → data ke 1–10
        // Halaman 2 → data ke 11–20
        // dst
        // Laravel otomatis handle:
        // limit
        // offset
        // total data
        // halaman sekarang

    }
}
