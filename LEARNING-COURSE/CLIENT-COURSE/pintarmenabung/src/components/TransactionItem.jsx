// ============================================================
// FILE: src/components/TransactionItem.jsx
// FUNGSI: Satu baris transaksi (dipakai berulang untuk setiap transaksi).
//
// TEMPLATE YANG DIPAKAI:
// Ambil satu blok <div class="cursor-pointer flex lg:items-center..."> dari
// template index.html (bagian Recent Transactions). Strukturnya:
// [Icon Kategori] [Nama Kategori + Wallet + Note] [Jumlah]
//
// LOGIKA WARNA:
// - Kategori EXPENSE → icon background merah (bg-red-200 border-red-300)
// - Kategori INCOME  → icon background hijau (bg-green-200 border-green-300)
// - Amount EXPENSE   → teks merah dengan prefix "-"
// - Amount INCOME    → teks hijau dengan prefix "+"
//
// HAPUS TRANSAKSI:
// Double-click pada baris ini → muncul dialog konfirmasi → kalau Ok → hapus
//
// PROPS:
// - transaction : object data transaksi dari API
// - onDelete    : fungsi yang dipanggil setelah berhasil hapus (untuk refresh)
// - showDate    : boolean, apakah tampilkan tanggal di atas baris ini
//                (false jika tanggalnya sama dengan transaksi sebelumnya)
// ============================================================

import { deleteTransaction } from "../api/transactions";
import { formatCurrency, formatDate } from "../utils/format";

export default function TransactionItem({ transaction, onDelete, showDate }) {
  const isExpense = transaction.category?.type === "EXPENSE";

  // Double-click → konfirmasi → hapus
  const handleDoubleClick = async () => {
    const confirmed = window.confirm(
      `Hapus transaksi "${transaction.category?.name}" sebesar ${transaction.amount}?`
    );
    if (!confirmed) return;

    try {
      await deleteTransaction(transaction.id); // DELETE /api/transactions/:id
      onDelete(); // Panggil reload di parent
    } catch (e) {
      alert("Gagal menghapus transaksi.");
    }
  };

  return (
    <>
      {/* Tampilkan tanggal hanya sekali per kelompok tanggal yang sama */}
      {showDate && (
        <div className="text-slate-400 text-xs pt-4 pb-1">
          {formatDate(transaction.date)}
        </div>
      )}

      {/* Baris transaksi — persis dari template HTML */}
      <div
        className="cursor-pointer flex lg:items-center justify-between border-b border-slate-700 py-3 lg:py-4 gap-3 text-lg"
        onDoubleClick={handleDoubleClick}
        title="Double-click untuk hapus"
      >
        <div className="flex lg:items-center gap-3">
          {/* Icon kategori — merah untuk expense, hijau untuk income */}
          <div
            className={`aspect-[1/1] h-[40px] flex items-center justify-center border-2 rounded-full text-lg ${
              isExpense
                ? "bg-red-200 border-red-300"
                : "bg-green-200 border-green-300"
            }`}
          >
            {transaction.category?.icon}
          </div>

          <div>
            <div className="flex flex-col lg:flex-row lg:items-center lg:gap-3">
              {/* Nama kategori */}
              <div className="font-medium">{transaction.category?.name}</div>
              {/* Nama wallet */}
              <div className="text-slate-400 text-sm lg:text-[1rem]">
                {transaction.wallet?.name}
              </div>
            </div>
            {/* Catatan jika ada */}
            {transaction.note && (
              <div className="text-slate-400 text-xs lg:text-sm">
                {transaction.note}
              </div>
            )}
          </div>
        </div>

        {/* Jumlah dengan prefix + atau - dan warna sesuai tipe */}
        <div className={`amount font-medium whitespace-nowrap ${isExpense ? "text-red-400" : "text-green-400"}`}>
          {isExpense ? "-" : "+"}
          {formatCurrency(transaction.amount, transaction.wallet?.currency_code)}
        </div>
      </div>
    </>
  );
}
