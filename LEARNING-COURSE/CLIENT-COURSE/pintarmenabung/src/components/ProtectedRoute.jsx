// ============================================================
// FILE: src/components/ProtectedRoute.jsx
// FUNGSI: Komponen "penjaga halaman" untuk 2 keperluan berbeda.
//
// KONSEP - ROUTE GUARD:
// Bayangkan ini seperti satpam di depan pintu.
// - ProtectedRoute: Halaman khusus user yang SUDAH login.
//   Kalau belum login → dikembalikan ke /login
//   Contoh: Overview (/), WalletDetail (/wallets/:id)
//
// - GuestRoute: Halaman khusus user yang BELUM login.
//   Kalau sudah login → dikembalikan ke / (overview)
//   Contoh: Login (/login), Register (/register)
//
// "loading" check: Kita tunggu dulu AuthContext selesai cek token di localStorage.
// Kalau tidak ada ini, user yang refresh browser akan terkejut di-redirect
// ke /login padahal sebenarnya sudah login.
//
// DIPAKAI DI: src/App.jsx
// ============================================================

import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Proteksi halaman: hanya bisa diakses user yang SUDAH login
export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  // Masih loading (cek localStorage)? Tampilkan blank dulu supaya tidak flicker
  if (loading) return null;

  // Belum login? Redirect ke /login
  if (!user) return <Navigate to="/login" replace />;

  // Sudah login? Tampilkan halaman yang diminta
  return children;
}

// Proteksi halaman: hanya bisa diakses user yang BELUM login
export function GuestRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return null;

  // Sudah login? Redirect ke overview (tidak perlu login/register lagi)
  if (user) return <Navigate to="/" replace />;

  return children;
}
