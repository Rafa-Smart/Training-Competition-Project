// ============================================================
// FILE: src/api/auth.js
// FUNGSI: Berisi semua fungsi yang berhubungan dengan autentikasi user.
//
// KONSEP: File ini hanya bertugas "berbicara" dengan backend.
// Setiap fungsi di sini memanggil endpoint tertentu dan mengembalikan
// hasilnya. Logika UI (tampilkan error, redirect, dll) ada di halaman/komponen.
//
// DIPAKAI DI:
// - src/pages/Login.jsx      → pakai fungsi login()
// - src/pages/Register.jsx   → pakai fungsi register()
// - src/context/AuthContext.jsx → pakai fungsi logout()
// ============================================================

import api from "./axios";

// REGISTER: Mengirim data pendaftaran user baru
// Parameter: { full_name, email, password }
// Return: response dari server (berisi token jika sukses)
export const register = (data) => api.post("/auth/register", data);

// LOGIN: Mengirim email + password untuk mendapatkan token
// Parameter: { email, password }
// Return: response dari server (berisi token jika sukses)
export const login = (data) => api.post("/auth/login", data);

// LOGOUT: Menghapus token aktif di server (hanya device ini)
// Token dikirim otomatis via interceptor di axios.js
// Return: response konfirmasi logout
export const logout = () => api.post("/auth/logout");
