// ============================================================
// FILE: src/api/transactions.js
// FUNGSI: Semua fungsi yang berhubungan dengan transaksi keuangan.
//
// DIPAKAI DI:
// - src/pages/Overview.jsx      → getTransactions(), addTransaction(), deleteTransaction()
// - src/pages/WalletDetail.jsx  → getTransactions(), addTransaction(), deleteTransaction(), transferMoney()
// - src/hooks/useInfiniteTransactions.js → getTransactions()
// ============================================================

import api from "./axios";

// Ambil daftar transaksi dengan opsi filter dan pagination
// params contoh: { page: 1, per_page: 25, month: 7, year: 2025, wallet_id: 1 }
export const getTransactions = (params = {}) => api.get("/transactions", { params });

// Tambah transaksi baru
// data: { wallet_id, category_id, amount, date, note (opsional) }
export const addTransaction = (data) => api.post("/transactions", data);

// Hapus transaksi berdasarkan ID
export const deleteTransaction = (transactionId) => api.delete(`/transactions/${transactionId}`);

// Transfer uang antar wallet (sebenarnya membuat 2 transaksi sekaligus)
// data: { from_wallet_id, from_category_id, to_wallet_id, to_category_id, amount, date, from_note, to_note }
// Catatan: Backend tidak punya endpoint khusus transfer, jadi kita buat 2 transaksi:
//   1. Expense di wallet asal (pengeluaran)
//   2. Income di wallet tujuan (pemasukan)
export const transferMoney = async (data) => {
  // Transaksi 1: Kurangi saldo wallet asal (EXPENSE)
  await api.post("/transactions", {
    wallet_id: data.from_wallet_id,
    category_id: data.from_category_id,
    amount: data.amount,
    date: data.date,
    note: data.from_note || "",
  });

  // Transaksi 2: Tambah saldo wallet tujuan (INCOME)
  await api.post("/transactions", {
    wallet_id: data.to_wallet_id,
    category_id: data.to_category_id,
    amount: data.amount,
    date: data.date,
    note: data.to_note || "",
  });
};
