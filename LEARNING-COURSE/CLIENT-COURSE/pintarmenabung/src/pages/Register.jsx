// ============================================================
// FILE: src/pages/Register.jsx
// FUNGSI: Halaman registrasi untuk membuat akun baru.
// PATH: /register
//
// TEMPLATE YANG DIPAKAI:
// Ambil dari template "register.html" yang diberikan.
// Strukturnya: form berisi input name, email, password, tombol Register,
// dan link "Already registered? Login" di bawah.
//
// PERBEDAAN DENGAN LOGIN:
// Field tambahan: full_name (di backend namanya "full_name" tapi response
// mengembalikan "name", jadi kita kirim "full_name")
//
// ALUR KERJA:
// 1. User isi name, email, password → klik "Register"
// 2. handleSubmit() memanggil register() dari api/auth.js
// 3. Kalau SUKSES (201): login otomatis (token sudah ada di response)
//    → loginUser() → redirect ke "/" (Overview)
// 4. Kalau GAGAL (422): tampilkan error spesifik per field via Alert
//
// PROTEKSI: Halaman ini dibungkus GuestRoute.
// ============================================================

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../api/auth";
import { useAuth } from "../context/AuthContext";
import Alert from "../utils/Alert";
import { parseErrors } from "../utils/format";

export default function Register() {
  const [form, setForm] = useState({ full_name: "", email: "", password: "" });
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
    setErrors([]);

    try {
      const res = await register(form); // POST /api/auth/register
      const { token, ...userData } = res.data.data;

      // Register sukses → langsung login (tidak perlu ke halaman login dulu)
      loginUser(userData, token);
      navigate("/");
    } catch (err) {
      // 422: validasi gagal, tampilkan semua pesan error dari backend
      setErrors(parseErrors(err.response?.data?.errors) || ["Terjadi kesalahan"]);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="px-5 py-8 lg:p-10 bg-slate-900 border border-slate-800 rounded-tl-3xl rounded-tr-3xl shadow flex flex-col gap-10 h-[calc(100vh_-_80px)] overflow-y-auto">
      <form onSubmit={handleSubmit} className="max-w-[500px] mx-auto w-full flex flex-col gap-5">
        <h2 className="text-2xl font-semibold text-center">Register</h2>

        <Alert messages={errors} />

        {/* Group input sesuai template */}
        <div className="rounded-xl overflow-hidden">
          <input
            id="name"
            type="text"
            name="full_name"
            value={form.full_name}
            onChange={handleChange}
            placeholder="Name"
            className="form-input"
            required
          />
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
            {submitting ? "Registering..." : "Register"}
          </button>
        </div>
      </form>

      <div className="text-center text-gray-300 mt-5">
        Already registered?{" "}
        <Link to="/login" className="text-blue-400 hover:underline">
          Login
        </Link>
      </div>
    </main>
  );
}
