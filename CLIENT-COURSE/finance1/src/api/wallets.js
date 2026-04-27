// ============================================================
// FILE: src/api/wallets.js
// FUNGSI: Semua fungsi yang berhubungan dengan manajemen wallet.
//
// DIPAKAI DI:
// - src/pages/Overview.jsx       → getWallets(), addWallet()
// - src/pages/WalletDetail.jsx   → getWalletDetail(), updateWallet(), deleteWallet()
// ============================================================

import api from "./axios";

// Ambil semua wallet milik user yang sedang login
export const getWallets = () => api.get("/wallets");

// Ambil detail 1 wallet berdasarkan ID-nya
// walletId: angka ID wallet yang ingin dilihat
export const getWalletDetail = (walletId) => api.get(`/wallets/${walletId}`);

// Tambah wallet baru
// data: { name, currency_code }
export const addWallet = (data) => api.post("/wallets", data);

// Update nama wallet
// walletId: ID wallet yang ingin diupdate
// data: { name }
export const updateWallet = (walletId, data) => api.put(`/wallets/${walletId}`, data);

// Hapus wallet berdasarkan ID
export const deleteWallet = (walletId) => api.delete(`/wallets/${walletId}`);
