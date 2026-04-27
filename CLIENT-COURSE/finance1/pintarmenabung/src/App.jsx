// ============================================================
// FILE: src/App.jsx
// FUNGSI: Komponen root yang mengatur semua routing halaman.
//
// KONSEP - ROUTING:
// React Router menentukan halaman mana yang tampil berdasarkan URL.
// Kita punya 3 jenis route:
//
// 1. GuestRoute (/login, /register):
//    Hanya bisa diakses kalau BELUM login.
//    Kalau sudah login → otomatis redirect ke "/"
//
// 2. ProtectedRoute (/, /wallets/:walletId):
//    Hanya bisa diakses kalau SUDAH login.
//    Kalau belum login → otomatis redirect ke "/login"
//
// 3. Navbar:
//    Muncul di SEMUA halaman karena diletakkan di LUAR <Routes>.
//    Isinya berubah otomatis tergantung status login.
//
// STRUKTUR HTML AKHIR:
// <div class="max-w-[768px] mx-auto">   ← dari template
//   <Navbar />                           ← header
//   <halaman yang sesuai URL />          ← main content
// </div>
// ============================================================

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute, GuestRoute } from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Overview from "./pages/Overview";
import WalletDetail from "./pages/WalletDetail";

export default function App() {
  return (
    // AuthProvider membungkus segalanya supaya context tersedia di mana saja
    <AuthProvider>
      <BrowserRouter>
        {/* Wrapper max-w-[768px] mx-auto sesuai template HTML yang diberikan */}
        <div className="max-w-[768px] mx-auto">
          
          {/* Navbar selalu muncul di semua halaman */}
          <Navbar />

          {/* Definisi semua route */}
          <Routes>
            {/* Halaman login — hanya untuk yang belum login */}
            <Route
              path="/login"
              element={
                <GuestRoute>
                  <Login />
                </GuestRoute>
              }
            />

            {/* Halaman register — hanya untuk yang belum login */}
            <Route
              path="/register"
              element={
                <GuestRoute>
                  <Register />
                </GuestRoute>
              }
            />

            {/* Halaman overview — hanya untuk yang sudah login */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Overview />
                </ProtectedRoute>
              }
            />

            {/* Halaman detail wallet — hanya untuk yang sudah login */}
            <Route
              path="/wallets/:walletId"
              element={
                <ProtectedRoute>
                  <WalletDetail />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
