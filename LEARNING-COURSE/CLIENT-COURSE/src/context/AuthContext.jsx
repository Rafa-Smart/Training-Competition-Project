// ============================================================
// FILE: src/context/AuthContext.jsx
// FUNGSI: Menyimpan dan menyebarkan "status login user" ke seluruh aplikasi.
//
// KONSEP - CONTEXT:
// Bayangkan Context seperti "papan pengumuman global". Setiap komponen yang
// butuh tahu apakah user sudah login atau belum, bisa langsung "baca papan
// pengumuman" ini tanpa harus ngirim data dari parent ke child terus-menerus.
//
// ISI CONTEXT INI:
// - user       : data user yang sedang login ({ id, name, email })
// - token      : token Sanctum yang tersimpan
// - loginUser  : fungsi untuk set user setelah login berhasil
// - logoutUser : fungsi untuk hapus user dan token (logout)
// - loading    : true saat pertama kali app dibuka (cek apakah sudah login)
//
// DIPAKAI DI:
// - src/main.jsx (membungkus seluruh app)
// - src/components/Navbar.jsx (tampilkan nama user & tombol logout)
// - src/pages/Login.jsx (panggil loginUser setelah login sukses)
// - src/pages/Register.jsx (panggil loginUser setelah register sukses)
// - Semua Protected Route (cek apakah user sudah login)
// ============================================================

import { createContext, useContext, useState, useEffect } from "react";
import { logout } from "../api/auth";

// Buat "papan pengumuman" kosong dulu
const AuthContext = createContext(null);

// AuthProvider = komponen pembungkus yang menyediakan data ke seluruh app
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);   // Data user (null = belum login)
  const [token, setToken] = useState(null); // Token Sanctum
  const [loading, setLoading] = useState(true); // Sedang cek status login?

  // Saat pertama kali app dibuka, cek apakah ada token di localStorage
  // Ini penting supaya user tidak logout sendiri tiap kali refresh browser
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser)); // Parse kembali dari string JSON
    }
    setLoading(false); // Selesai ngecek, loading selesai
  }, []);

  // Dipanggil setelah login/register berhasil
  // Menyimpan token dan user ke state DAN localStorage
  const loginUser = (userData, tokenValue) => {
    setUser(userData);
    setToken(tokenValue);
    localStorage.setItem("token", tokenValue);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  // Dipanggil saat user klik tombol Logout
  // Menghapus token di server, lalu bersihkan state lokal
  const logoutUser = async () => {
    try {
      await logout(); // Hapus token di server backend
    } catch (e) {
      // Kalau server error pun, tetap lanjutkan logout di sisi client
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  // Sediakan semua data dan fungsi ke komponen-komponen di bawahnya
  return (
    <AuthContext.Provider value={{ user, token, loginUser, logoutUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook kustom supaya penggunaannya lebih mudah
// Alih-alih tulis useContext(AuthContext), cukup tulis useAuth()
export function useAuth() {
  return useContext(AuthContext);
}
