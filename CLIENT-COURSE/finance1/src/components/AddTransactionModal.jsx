// ============================================================
// FILE: src/components/AddTransactionModal.jsx
// FUNGSI: Modal popup untuk menambah transaksi baru (income atau expense).
//
// TEMPLATE YANG DIPAKAI:
// Modal "Add Transaction" yang strukturnya mirip dengan template index.html —
// kita buat modal sendiri dengan structure yang sama (modal-header, modal-body).
// Form berisi: wallet, category, amount, date, note.
//
// ALUR KERJA:
// 1. User klik "Add Transaction"
// 2. Modal muncul. Kalau ada prop defaultWalletId (dari WalletDetail),
//    field wallet langsung ter-select otomatis.
// 3. User isi form → klik Save
// 4. addTransaction() dipanggil ke POST /api/transactions
// 5. Sukses → onSuccess() dipanggil → tutup modal
//
// KEYBOARD SHORTCUT: Alt+N (dihandle di halaman yang memakainya)
//
// PROPS:
// - isOpen          : boolean
// - onClose         : fungsi tutup modal
// - onSuccess       : fungsi refresh data setelah berhasil
// - defaultWalletId : (opsional) ID wallet yang otomatis dipilih
// ============================================================

import { useState, useEffect } from "react";
import { addTransaction } from "../api/transactions";
import { getWallets } from "../api/wallets";
import { getCategories } from "../api/categories";
import Alert from "../utils/Alert";
import { parseErrors, getTodayDate } from "../utils/format";

export default function AddTransactionModal({ isOpen, onClose, onSuccess, defaultWalletId }) {
  const [form, setForm] = useState({
    wallet_id: "",
    category_id: "",
    amount: "",
    date: getTodayDate(), // Default: hari ini
    note: "",
  });
  const [wallets, setWallets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Ambil wallets dan categories saat modal dibuka
  useEffect(() => {
    if (isOpen) {
      getWallets().then((res) => setWallets(res.data.data.wallets)).catch(() => {});
      getCategories().then((res) => setCategories(res.data.data.categories)).catch(() => {});
    }
  }, [isOpen]);

  // Reset form dan set default wallet saat modal dibuka
  useEffect(() => {
    if (isOpen) {
      setForm({
        wallet_id: defaultWalletId || "", // Auto-select wallet jika dari WalletDetail
        category_id: "",
        amount: "",
        date: getTodayDate(),
        note: "",
      });
      setErrors([]);
    }
  }, [isOpen, defaultWalletId]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors([]);
    try {
      await addTransaction({
        ...form,
        amount: parseInt(form.amount), // Backend minta integer
      });
      onSuccess();
      onClose();
    } catch (err) {
      setErrors(parseErrors(err.response?.data?.errors) || ["Terjadi kesalahan"]);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal is-open" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-header">
        <div></div>
        <h3 className="text-lg">Add Transaction</h3>
        <button className="modal-close" onClick={onClose}>×</button>
      </div>
      <div className="modal-body overflow-y-auto max-h-[calc(100vh_-_80px_-_77px)]">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <Alert messages={errors} />

          <div className="rounded-xl overflow-hidden">
            {/* Pilih Wallet */}
            <select name="wallet_id" value={form.wallet_id} onChange={handleChange} className="form-input" required>
              <option value="" disabled>Select Wallet</option>
              {wallets.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.currency_code})
                </option>
              ))}
            </select>

            {/* Pilih Category */}
            <select name="category_id" value={form.category_id} onChange={handleChange} className="form-input form-input-lg" required>
              <option value="" disabled>Select Category</option>
              {/* Kelompokkan kategori berdasarkan tipe supaya mudah dibaca */}
              <optgroup label="INCOME">
                {categories.filter((c) => c.type === "INCOME").map((c) => (
                  <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                ))}
              </optgroup>
              <optgroup label="EXPENSE">
                {categories.filter((c) => c.type === "EXPENSE").map((c) => (
                  <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                ))}
              </optgroup>
            </select>

            {/* Amount */}
            <input
              type="number"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              className="form-input form-input-xl"
              placeholder="Enter amount"
              min="1"
              required
            />

            {/* Tanggal */}
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              className="form-input"
              required
            />

            {/* Catatan (opsional) */}
            <textarea
              name="note"
              value={form.note}
              onChange={handleChange}
              rows="3"
              className="form-input"
              placeholder="Note (optional)"
            />
          </div>

          <button type="submit" className="btn btn-lg mt-4" disabled={submitting}>
            {submitting ? "Saving..." : "Save"}
          </button>
        </form>
      </div>
    </div>
  );
}
