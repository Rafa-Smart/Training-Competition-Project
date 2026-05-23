// ============================================================
// FILE: src/hooks/useInfiniteTransactions.js
// FUNGSI: Custom hook untuk mengambil transaksi dengan sistem "load more"
//         (infinite scroll / pagination manual).
//
// KONSEP - CUSTOM HOOK:
// Hook ini seperti "remote control" untuk data transaksi. Dia menyimpan
// state transaksi, halaman saat ini, apakah masih ada data berikutnya, dll.
// Kamu tinggal panggil hook ini di komponen, lalu pakai data dan fungsinya.
//
// MENGAPA PERLU INI?
// Transaksi bisa sangat banyak (ratusan/ribuan). Kalau semua diambil sekaligus,
// loading jadi lambat. Dengan sistem "load more", kita ambil 25 dulu,
// lalu kalau user scroll ke bawah/klik "Load More", baru ambil 25 berikutnya.
//
// ISI YANG DIKEMBALIKAN:
// - transactions : array semua transaksi yang sudah diambil
// - loading      : true saat sedang fetch data
// - hasMore      : true jika masih ada halaman berikutnya
// - loadMore     : fungsi untuk fetch halaman berikutnya
// - reload       : fungsi untuk reset dan fetch ulang dari awal
//
// DIPAKAI DI:
// - src/pages/Overview.jsx
// - src/pages/WalletDetail.jsx
// ============================================================

import { useState, useCallback } from "react";
import { getTransactions } from "../api/transactions";

export function useInfiniteTransactions(params = {}) {
  const [transactions, setTransactions] = useState([]); // Semua transaksi yang terkumpul
  const [page, setPage] = useState(1);                  // Halaman saat ini
  const [hasMore, setHasMore] = useState(true);         // Masih ada halaman berikutnya?
  const [loading, setLoading] = useState(false);        // Sedang loading?

  // Fungsi utama: fetch transaksi untuk halaman tertentu
  const fetchPage = useCallback(
    async (pageNumber, reset = false) => {
      setLoading(true);
      try {
        const res = await getTransactions({
          ...params,          // Filter dari luar (misal: month, year, wallet_id)
          page: pageNumber,
          per_page: 25,
        });

        const data = res.data; // { current_page, data: [...], last_page, total }

        if (reset) {
          // Jika reload dari awal, buang semua data lama
          setTransactions(data.data);
        } else {
          // Kalau load more, tambahkan di belakang data lama
          setTransactions((prev) => [...prev, ...data.data]);
        }

        // Cek apakah ini halaman terakhir
        setHasMore(data.current_page < data.last_page);
        setPage(data.current_page);
      } catch (e) {
        console.error("Gagal ambil transaksi:", e);
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(params)] // Re-create fungsi kalau params berubah
  );

  // Load halaman berikutnya (dipanggil saat klik "Load More")
  const loadMore = () => {
    if (!loading && hasMore) {
      fetchPage(page + 1, false);
    }
  };

  // Reset dan muat ulang dari halaman 1 (dipanggil setelah add/delete transaksi)
  const reload = () => {
    setTransactions([]);
    setPage(1);
    setHasMore(true);
    fetchPage(1, true);
  };

  return { transactions, loading, hasMore, loadMore, reload, fetchPage };
}
