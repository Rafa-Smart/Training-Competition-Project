// ============================================================
// FILE: src/components/AddWalletModal.jsx
// FUNGSI: Modal popup untuk menambah wallet baru.
//
// TEMPLATE YANG DIPAKAI:
// Ambil bagian <div class="modal is-open"> pertama dari template index.html
// yang berisi form "Add Wallet" dengan select currency dan input nama wallet.
//
// ALUR KERJA:
// 1. User klik tombol "+" di bagian Balance section (Overview)
// 2. Modal ini muncul (prop isOpen = true)
// 3. User pilih currency dan isi nama wallet, lalu klik "Save"
// 4. Fungsi handleSubmit() memanggil addWallet() dari API
// 5. Kalau sukses → tutup modal + panggil onSuccess() supaya Overview refresh
// 6. Kalau gagal → tampilkan pesan error via komponen Alert
//
// KEYBOARD SHORTCUT: Alt+W membuka modal ini (dihandle di Overview.jsx)
// ESC menutup modal (dihandle via prop onClose)
//
// PROPS:
// - isOpen    : boolean, apakah modal ditampilkan
// - onClose   : fungsi untuk menutup modal
// - onSuccess : fungsi yang dipanggil setelah berhasil menambah wallet
// ============================================================

import { useState, useEffect } from "react";
import { addWallet } from "../api/wallets";
import { getCurrencies } from "../api/categories";
import Alert from "../utils/Alert";
import { parseErrors } from "../utils/format";

export default function AddWalletModal({ isOpen, onClose, onSuccess }) {
  const [form, setForm] = useState({ currency_code: "", name: "" });
  const [currencies, setCurrencies] = useState([]);
  const [errors, setErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Ambil daftar currency saat modal pertama kali dibuka
  useEffect(() => {
    if (isOpen) {
      getCurrencies()
        .then((res) => setCurrencies(res.data.data.currencies))
        .catch(() => {});
    }
  }, [isOpen]);

  // Reset form saat modal dibuka ulang
  useEffect(() => {
    if (isOpen) {
      setForm({ currency_code: "", name: "" });
      setErrors([]);
    }
  }, [isOpen]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors([]);
    try {
      await addWallet(form); // Kirim ke POST /api/wallets
      onSuccess();           // Refresh daftar wallet di Overview
      onClose();             // Tutup modal
    } catch (err) {
      // Backend mengirim errors sebagai objek, kita flatten jadi array
      setErrors(parseErrors(err.response?.data?.errors) || ["Terjadi kesalahan"]);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    // Overlay gelap di belakang modal
    <div className="modal is-open" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-header">
        <div></div>
        <h3 className="text-lg">Add Wallet</h3>
        <button className="modal-close" onClick={onClose}>×</button>
      </div>
      <div className="modal-body">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <Alert messages={errors} />

          {/* Group input dirangkum dalam rounded-xl sesuai template */}
          <div className="rounded-xl overflow-hidden">
            <select
              name="currency_code"
              value={form.currency_code}
              onChange={handleChange}
              className="form-input"
              required
            >
              <option value="" disabled>Select Currency</option>
              {currencies.map((c) => (
                <option key={c.id} value={c.code}>
                  {c.code} - {c.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="form-input"
              placeholder="Wallet Name"
              required
            />
          </div>

          <button type="submit" className="btn btn-lg w-full mt-4" disabled={submitting}>
            {submitting ? "Saving..." : "Save"}
          </button>
        </form>
      </div>
    </div>
  );
}
