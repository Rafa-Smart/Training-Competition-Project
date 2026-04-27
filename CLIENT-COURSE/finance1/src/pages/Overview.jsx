// ============================================================
// FILE: src/pages/Overview.jsx
// FUNGSI: Halaman utama setelah login — menampilkan semua wallet dan
//         recent transactions dari seluruh wallet.
// PATH: /
//
// TEMPLATE YANG DIPAKAI:
// Ambil dari template "index.html" yang diberikan.
// Strukturnya:
//   - Greeting (Hi [nama]!)
//   - Tombol "Add Transaction"
//   - Section "Balance" → daftar wallet horizontal scrollable + tombol "+"
//   - Section "Recent Transactions" → daftar transaksi
//
// FITUR YANG ADA:
// - Tampilkan semua wallet user (klik wallet → ke WalletDetail)
// - Klik "+" → buka AddWalletModal
// - Klik "Add Transaction" → buka AddTransactionModal
// - Recent transactions dari semua wallet, dikelompokkan per tanggal
// - Double-click transaksi → hapus (ada di TransactionItem)
// - Load More button untuk pagination
//
// KEYBOARD SHORTCUTS:
// - Alt+W → buka Add Wallet modal
// - Alt+N → buka Add Transaction modal
// - Esc   → tutup semua modal
// ============================================================

import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getWallets } from "../api/wallets";
import { useInfiniteTransactions } from "../context/hooks/useInfiniteTransactions.js";
import { formatCurrency } from "../utils/format";
import TransactionItem from "../components/TransactionItem";
import AddWalletModal from "../components/AddWalletModal";
import AddTransactionModal from "../components/AddTransactionModal";

export default function Overview() {
  const { user } = useAuth();
  const [wallets, setWallets] = useState([]);
  const [showAddWallet, setShowAddWallet] = useState(false);
  const [showAddTransaction, setShowAddTransaction] = useState(false);

  // Hook infinite scroll untuk transaksi (tanpa filter wallet tertentu)
  const { transactions, loading, hasMore, loadMore, reload, fetchPage } =
    useInfiniteTransactions({});

  // Ambil daftar wallet saat halaman pertama dibuka
  const loadWallets = useCallback(() => {
    getWallets()
      .then((res) => setWallets(res.data.data.wallets))
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadWallets();
    fetchPage(1, true); // Ambil transaksi halaman pertama
  }, []);

  // Keyboard shortcuts: Alt+W, Alt+N, Esc
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.altKey && e.key === "w") {
        e.preventDefault();
        setShowAddWallet(true);
      }
      if (e.altKey && e.key === "n") {
        e.preventDefault();
        setShowAddTransaction(true);
      }
      if (e.key === "Escape") {
        setShowAddWallet(false);
        setShowAddTransaction(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Setelah berhasil tambah/hapus data → refresh wallet dan transaksi
  const handleDataChange = () => {
    loadWallets();
    reload();
  };

  // Logika "tampilkan tanggal hanya sekali":
  // Bandingkan tanggal transaksi saat ini dengan yang sebelumnya.
  // Kalau beda → tampilkan tanggal. Kalau sama → sembunyikan.
  const shouldShowDate = (index) => {
    if (index === 0) return true;
    return transactions[index].date !== transactions[index - 1].date;
  };

  return (
    <>
      {/* Konten utama — sesuai template index.html */}
      <main className="px-5 py-8 lg:p-10 bg-slate-900 border border-slate-800 rounded-tl-3xl rounded-tr-3xl shadow flex flex-col gap-10 h-[calc(100vh_-_80px)] overflow-y-auto">
        
        {/* Header: Greeting + tombol Add Transaction */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <h2 className="text-2xl font-semibold">Hi {user?.name}👋</h2>
            <p className="text-sm text-slate-400 mt-0.5">
              Let's check where your money's going and growing.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddTransaction(true)}
              className="btn"
            >
              Add Transaction
            </button>
          </div>
        </div>

        {/* === SECTION BALANCE === */}
        <div className="-mb-3">
          <h3 className="text-xl font-medium mb-3">Balance</h3>
          <div className="flex flex-nowrap overflow-x-auto gap-3 lg:gap-4 pb-3 lg:pb-5">
            
            {/* Tombol "+" untuk tambah wallet baru */}
            <button
              onClick={() => setShowAddWallet(true)}
              className="border border-slate-700 p-5 rounded-xl flex items-center justify-center aspect-[5/2] text-4xl font-light hover:bg-slate-800"
            >
              +
            </button>

            {/* Daftar wallet yang dimiliki user */}
            {wallets.map((wallet) => (
              <Link
                key={wallet.id}
                to={`/wallets/${wallet.id}`}
                className="p-5 border border-slate-700 rounded-xl inline-block pe-12 whitespace-nowrap hover:bg-slate-800"
              >
                <div className="font-medium text-slate-400 mb-1.5">
                  {wallet.name}
                </div>
                <div className="font-semibold amount line-clamp-1 text-2xl lg:text-3xl">
                  {formatCurrency(wallet.balance, wallet.currency_code)}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* === SECTION RECENT TRANSACTIONS === */}
        <div className="w-full max-w-[700px]">
          <h3 className="text-xl font-medium">Recent Transactions</h3>

          {/* Daftar transaksi — gunakan komponen TransactionItem */}
          {transactions.map((trx, index) => (
            <TransactionItem
              key={trx.id}
              transaction={trx}
              onDelete={handleDataChange}
              showDate={shouldShowDate(index)}
            />
          ))}

          {/* Pesan loading */}
          {loading && (
            <div className="text-center text-slate-400 py-4">Loading...</div>
          )}

          {/* Kalau tidak ada transaksi sama sekali */}
          {!loading && transactions.length === 0 && (
            <div className="text-center text-slate-400 py-8">
              Belum ada transaksi. Tambahkan transaksi pertamamu!
            </div>
          )}

          {/* Tombol Load More — muncul kalau masih ada halaman berikutnya */}
          {hasMore && !loading && (
            <button
              onClick={loadMore}
              className="w-full py-3 text-slate-400 hover:text-white text-sm mt-2"
            >
              Load More
            </button>
          )}
        </div>
      </main>

      {/* Modal Add Wallet */}
      <AddWalletModal
        isOpen={showAddWallet}
        onClose={() => setShowAddWallet(false)}
        onSuccess={handleDataChange}
      />

      {/* Modal Add Transaction */}
      <AddTransactionModal
        isOpen={showAddTransaction}
        onClose={() => setShowAddTransaction(false)}
        onSuccess={handleDataChange}
      />
    </>
  );
}
