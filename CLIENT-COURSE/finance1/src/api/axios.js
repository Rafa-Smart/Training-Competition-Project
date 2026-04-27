// ============================================================
// FILE: src/api/axios.js
// FUNGSI: Konfigurasi utama Axios untuk semua request ke backend.
//
// KONSEP PENTING - INTERCEPTOR:
// Interceptor itu seperti "pintu masuk dan pintu keluar" untuk setiap request.
// - Request : InterceptorSebelum request dikirim ke server, kita sisipkan
//   token otomatis ke header Authorization. Jadi kamu tidak perlu
//   menulis `Authorization: Bearer xxx` secara manual di setiap file.
// - Response Interceptor: Setelah response datang, jika statusnya 401
//   (token tidak valid / expired), kita otomatis hapus token dari
//   localStorage dan redirect user ke halaman /login.
//
// DIPAKAI DI: Semua file di folder src/api/ (auth.js, wallets.js, dll)
// ============================================================

import axios from "axios";

// Ganti XX dengan nomor komputer kamu
const API_URL = "http://127.0.0.1:8000/api";

// Buat instance axios khusus dengan base URL sudah terset
const api = axios.create({
  baseURL: API_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// REQUEST INTERCEPTOR
// Setiap kali ada request keluar, fungsi ini dijalankan DULU sebelum request dikirim.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // Ambil token dari penyimpanan browser
  if (token) {
    config.headers.Authorization = `Bearer ${token}`; // Tempel token ke header
  }
  return config; // Lanjutkan request
});

// RESPONSE INTERCEPTOR
// Setiap kali response datang, fungsi ini dijalankan.
api.interceptors.response.use(
  (response) => response, // Kalau sukses, langsung kembalikan responsenya
  (error) => {
    if (error.response?.status === 401) {
      // Token tidak valid atau expired → paksa logout
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error); // Teruskan error supaya bisa ditangkap di catch()
  }
);

export default api;
