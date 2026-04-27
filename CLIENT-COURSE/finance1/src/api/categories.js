// ============================================================
// FILE: src/api/categories.js
// FUNGSI: Ambil semua kategori dan currency dari backend.
//
// DIPAKAI DI:
// - src/components/AddTransactionModal.jsx → getCategories(), getCurrencies()
// - src/components/AddWalletModal.jsx      → getCurrencies()
// - src/components/TransferModal.jsx       → getCategories()
// ============================================================

import api from "./axios";

// Ambil semua kategori (INCOME dan EXPENSE)
// Response berisi: id, name, icon, type ("INCOME" atau "EXPENSE")
export const getCategories = () => api.get("/categories");

// Ambil semua currency yang tersedia (IDR, USD, dll)
// Response berisi: id, name, symbol, code
export const getCurrencies = () => api.get("/currencies");
