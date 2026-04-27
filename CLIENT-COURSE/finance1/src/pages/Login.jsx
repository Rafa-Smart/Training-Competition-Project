// ============================================================
// FILE: src/pages/Login.jsx
// FUNGSI: Halaman login untuk user masuk ke aplikasi.
// PATH: /login
//
// TEMPLATE YANG DIPAKAI:
// Ambil dari template "login.html" yang diberikan.
// Strukturnya: form di dalam <main>, berisi input email, password, dan tombol Login.
// Di bawah form ada link "Don't have an account? Register".
//
// ALUR KERJA:
// 1. User isi email + password → klik "Login"
// 2. handleSubmit() memanggil login() dari api/auth.js
// 3. Kalau SUKSES (200): simpan token + user via loginUser() dari AuthContext
//    → redirect ke "/" (Overview)
// 4. Kalau GAGAL (401 / 422): tampilkan error via komponen Alert
//
// PROTEKSI: Halaman ini dibungkus GuestRoute, jadi kalau sudah login
// → otomatis redirect ke "/" tanpa bisa masuk ke sini lagi.
// ============================================================

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../api/auth";
import { useAuth } from "../context/AuthContext";
import Alert from "../utils/Alert";
import { parseErrors } from "../utils/format";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    // setErrors([]);

    try {
      const res = await login(form); // POST /api/auth/login
      const { token, ...userData } = res.data.data;

      // Simpan token dan user ke context + localStorage
      loginUser(userData, token);

      // Redirect ke Overview
      navigate("/");
    } catch (err) {
      if (err.response?.status === 401) {
        // Username atau password salah
        setErrors([err.response.data.message || "Email atau password salah"]);
      } else {
        // Validasi field (422)
        setErrors(parseErrors(err.response?.data?.errors) || ["Terjadi kesalahan"]);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    // Struktur max-w-[768px] mx-auto sesuai template
    <main className="px-5 py-8 lg:p-10 bg-slate-900 border border-slate-800 rounded-tl-3xl rounded-tr-3xl shadow flex flex-col gap-10 h-[calc(100vh_-_80px)] overflow-y-auto">
      <form onSubmit={handleSubmit} className="max-w-[500px] mx-auto w-full flex flex-col gap-5">
        <h2 className="text-2xl font-semibold text-center">Login</h2>

        {/* Tampilkan error jika ada */}
        <Alert messages={errors} />

        {/* Group input sesuai template: rounded-xl overflow-hidden */}
        <div className="rounded-xl overflow-hidden">
          <input
            id="email"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            className="form-input"
            required
          />
          <input
            id="password"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password"
            className="form-input"
            required
          />
        </div>

        <div>
          <button type="submit" className="btn btn-lg w-full" disabled={submitting}>
            {submitting ? "Logging in..." : "Login"}
          </button>
        </div>
      </form>

      {/* Link ke halaman register */}
      <div className="text-center text-gray-300 mt-5">
        Don't have an account?{" "}
        <Link to="/register" className="text-blue-400 hover:underline">
          Register
        </Link>
      </div>
    </main>
  );
}
