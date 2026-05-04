<?php

namespace App\Http\Controllers;

/**
 * FILE: app/Http/Controllers/ReportController.php
 *
 * Controller ini menangani endpoint LAPORAN KEUANGAN:
 * - expenseSummary() → GET /api/reports/summary-by-category/expense  (E1)
 * - incomeSummary()  → GET /api/reports/summary-by-category/income   (E2)
 *
 * TUJUAN ENDPOINT INI:
 * Merangkum total pengeluaran/pemasukan per kategori. Misalnya:
 * - Food & Drinks: Rp 500.000
 * - Transport: Rp 200.000
 * - Groceries: Rp 150.000
 *
 * Ini berguna untuk chart/pie chart di frontend nanti.
 *
 * LOGIKA INTI:
 * 1. Ambil semua kategori dengan tipe tertentu (EXPENSE atau INCOME)
 * 2. Untuk setiap kategori, hitung total amount dari transaksi yang:
 *    - wallet-nya milik user yang login
 *    - filter bulan/tahun jika dikirim
 * 3. Kembalikan daftar kategori beserta total amount-nya
 *
 * Kedua fungsi (expense dan income) logikanya hampir identik,
 * jadi kita buat fungsi helper privat getSummaryByType() untuk menghindari duplikasi.
 */

use App\Models\Category;
use App\Models\Transaction;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    /**
     * expenseSummary() → GET /api/reports/summary-by-category/expense
     *
     * Cukup memanggil helper dengan tipe 'EXPENSE' dan pesan yang sesuai.
     */
    public function expenseSummary(Request $request)
    {
        $summary = $this->getSummaryByType($request, 'EXPENSE');

        return response()->json([
            'status' => 'success',
            'message' => 'Get summary by expense category successful',
            'data' => [
                'summary' => $summary,
            ],
        ], 200);
    }

    /**
     * incomeSummary() → GET /api/reports/summary-by-category/income
     *
     * Sama persis, tapi dengan tipe 'INCOME'.
     */
    public function incomeSummary(Request $request)
    {
        $summary = $this->getSummaryByType($request, 'INCOME');

        return response()->json([
            'status' => 'success',
            'message' => 'Get summary by income category successful',
            'data' => [
                'summary' => $summary,
            ],
        ], 200);
    }

    /**
     * getSummaryByType() → Fungsi privat (hanya bisa dipanggil dari dalam class ini)
     *
     * Ini adalah JANTUNG logika reporting. Penjelasan langkah demi langkah:
     *
     * Langkah 1: Ambil semua kategori dengan tipe yang diminta (EXPENSE atau INCOME).
     *
     * Langkah 2: Untuk setiap kategori, hitung total amount transaksi-nya.
     *   - Kita perlu filter: transaksi harus ada di wallet milik user yang login.
     *   - Tambahkan filter bulan/tahun jika parameter dikirim.
     *   - Gunakan whereHas('wallet', ...) untuk memastikan wallet adalah milik user ini.
     *
     * Langkah 3: Format hasilnya menjadi array of {category, amount}.
     *   - Kita pakai map() untuk mentransformasi setiap kategori.
     *   - Hanya tampilkan kategori yang total amount-nya > 0 (pakai filter()).
     *   - values() untuk reset key array setelah filter (agar jadi 0,1,2,... bukan 0,2,4,...).
     *
     * Kenapa tidak pakai JOIN atau GROUP BY langsung?
     * Karena dengan pendekatan ini kode lebih mudah dibaca dan dipahami,
     * terutama untuk pemula. Performa bisa dioptimasi nanti jika data sudah banyak.
     */
    private function getSummaryByType(Request $request, string $type): array
    {
        // Ambil semua kategori dengan tipe yang diminta
        $categories = Category::where('type', $type)->get();
        // sdasd
        // sdasd
        // sdasd
        // sdasd

        // Untuk setiap kategori, hitung total transaksinya
        // use ($request, $type) ini itu agar si viable nya bisa dikases secara closure di dalam map()
        $summary = $categories->map(function ($category) use ($request) {

            // INAT SETIAP ITERASI bikin QUERY BARU dari nol
            // JAID BUKAN REPLACE YA DAN INI KAN MAP JADI DIA AKAN RETURN

            // Bangun query untuk menghitung total transaksi kategori ini
            $query = Transaction::where('category_id', $category->id)
                ->whereHas('wallet', function ($q) {
                    // Hanya hitung transaksi yang wallet-nya milik user yang login
                    $q->where('user_id', auth()->id());
                });

            // Tambahkan filter bulan jika dikiri m
            // INGAT YA INI TUH SI MONTHNYA AKNA DI QUERY DI TRANSAKSI YA
            // BUKAN DI WALLET NYA
            if ($request->has('month')) {
                $query->whereMonth('date', $request->query('month'));
            }

            // Tambahkan filter tahun jika dikirim
            if ($request->has('year')) {
                $query->whereYear('date', $request->query('year'));
            }

            // JAGI GINIYA HARUSNY ITU IDEANYA DARI RONTNY KITA KASOH JUGA FILTER UNTUK SATU WALLET ID INI SAJA TAPI DARI SOAL LKSNYA TU KITA GA DIKASIH UNTUK FILTER
            // https://chatgpt.com/c/69f7f361-e96c-8320-9ed8-9420f17fe75c
            // COBA LIA AJA INI


            // Hitung total amount untuk kategori ini
            // KARAN KAN SI QUERY INI ITU ISINYA ADALAH ARRAY YA HASIL DARI WHERE DI TRANSAKSI INI, MAKA DARI ARRAY ITU KITA HITUNG AMOUNTNYA
            $totalAmount = $query->sum('amount');

            // NAH COBA INI LIHAT, JADI DISNI KITA ITU AKAN RETURN NYA DISINI KARENA DIA MAP YA
            return [
                'category' => $category,
                'amount' => $totalAmount,
            ];

        })

        // NAH BARU KETIKA SEMUA NYA UDAH DI LOPP MAKA AKAN MASUK KE FILTER SINI YAAAAAA
        // DAN MASUK KE VALUES LALU TOARRAY
        // Hanya tampilkan kategori yang ada transaksinya (amount > 0)
            ->filter(function ($item) {
                return $item['amount'] > 0;
            })
        // Reset key array agar mulai dari 0 lagi

        // nah jadi gini kenapa disini itu kita rapihin lagi arraynya
        // karena lit disini kita itu filter, jadi misalnya ada index 0,1,2,3,4,5 n ternyata selteah fildter ituhanya ada
        // 0,3,5 nah 2 dan 1 nya kan hilang
        // nah seharunya kaloada tiga item gini itu akn berati ada 3 ya panjangnya berati harus di ubah lagi jadi
        // 0,1,2 bukan 0,3,5

        // makanya kita pake values agar bisa rapih lagi

        // lalu kita pake toArray karena sebelumnya itu adlah laravel/collection dan bukan array
        // makanya ubah lagi ek array
            ->values()
            ->toArray();

        return $summary;
    }

    // bisa juga kaya gini ya
    private function getSummaryByType2(Request $request, string $type)
    {
        $query = Transaction::with('category')
            ->whereHas('wallet', function ($q) {
                $q->where('user_id', auth()->id());
            })
            ->whereHas('category', function ($q) use ($type) {
                $q->where('type', $type);
            });

        // filter bulan
        if ($request->filled('month')) {
            $query->whereMonth('date', $request->month);
        }

        // filter tahun
        if ($request->filled('year')) {
            $query->whereYear('date', $request->year);
        }

        //  INI INTI PERBEDAAN
        $summary = $query
            ->selectRaw('category_id, SUM(amount) as total')
            ->groupBy('category_id')
            ->get();

            // >selectRaw('category_id, SUM(amount) as total')
            // Ini berarti:
            // “Saya mau ambil:
            // category_id
            // total amount (hasil penjumlahan)”

        return $summary;
    }
}


// JAID GINI INI PENTING BANGET, JADI DI LARAVEL UNTUK NGAMIBL DATA QUERY ITU BSIA PAKE
// INPUT(), QUERY(), ATAU BISA LANGSUNG AJA REQUEST->NAMA

// NAH TAPI KALO SAYA MAU NGECEK qury itu bsia pake has atau filled