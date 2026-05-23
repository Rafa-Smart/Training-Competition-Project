// ============================================================
// FILE: src/api/reports.js
// FUNGSI: Ambil data laporan keuangan (summary per kategori).
//         Data ini digunakan untuk menampilkan chart di halaman WalletDetail.
//
// DIPAKAI DI:
// - src/pages/WalletDetail.jsx → getExpenseSummary(), getIncomeSummary()
// ============================================================

import api from "./axios";

// Ambil ringkasan pengeluaran (EXPENSE) per kategori
// params contoh: { month: 7, year: 2025 }
// Response: array of { category: {...}, amount: number }
export const getExpenseSummary = (params = {}) =>
  api.get("/reports/summary-by-category/expense", { params });

// Ambil ringkasan pemasukan (INCOME) per kategori
// params contoh: { month: 7, year: 2025 }
// Response: array of { category: {...}, amount: number }
export const getIncomeSummary = (params = {}) =>
  api.get("/reports/summary-by-category/income", { params });
