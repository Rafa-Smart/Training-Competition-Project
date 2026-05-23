// ============================================================
// FILE: src/components/Navbar.jsx
// FUNGSI: Header/navbar yang muncul di semua halaman.
//
// TEMPLATE YANG DIPAKAI:
// Ambil bagian <header> dari semua template HTML yang diberikan.
// Struktur: Logo "PintarMenabung" di kiri, navigasi di kanan.
//
// LOGIKA:
// - Kalau user BELUM login: tampilkan link "Login" dan "Register"
// - Kalau user SUDAH login: tampilkan nama user dan tombol "Logout"
// - Klik Logout → panggil logoutUser() dari AuthContext → redirect ke /login
//
// DIPAKAI DI: src/App.jsx (diletakkan di luar Routes supaya muncul di semua halaman)
// ============================================================

import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUser();
    navigate("/login"); // Setelah logout, paksa ke halaman login
  };

  return (
    // Struktur header persis dari template HTML yang diberikan
    <header className="h-[80px] px-5 flex items-center justify-between">
      <div className="flex items-center gap-5">
        {/* Logo - klik → kembali ke overview */}
        <Link to="/">
          <h1 className="text-xl tracking-wide font-medium">
            Pintar<span className="font-bold text-green-500">Menabung</span>
          </h1>
        </Link>
      </div>

      <nav className="flex gap-3 items-center">
        {user ? (
          // User sudah login: tampilkan nama + tombol logout
          <>
            <span className="text-slate-400 text-sm hidden sm:block">
              {user.name}
            </span>
            <button
              onClick={handleLogout}
              className="btn"
            >
              Logout
            </button>
          </>
        ) : (
          // User belum login: tampilkan link login & register
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </nav>
    </header>
  );
}
