// ============================================================
// FILE: src/components/TransferModal.jsx
// FUNGSI: Modal untuk transfer uang antar wallet.
//
// TEMPLATE YANG DIPAKAI:
// Ambil bagian modal "Transfer Money" dari template index.html yang diberikan.
// Strukturnya ada dua bagian: FROM (asal) dan TO (tujuan), masing-masing
// punya wallet selector, category selector, dan textarea untuk note.
// Plus input tanggal di bawah.
//
// ALUR KERJA:
// 1. User klik "Transfer Money"
// 2. Modal muncul. Kalau ada defaultWalletId (dari WalletDetail),
//    field "From Wallet" otomatis terisi.
// 3. User isi form (from wallet, from category EXPENSE, to wallet, to category INCOME, amount, date)
// 4. Klik "Transfer" → fungsi transferMoney() di transactions.js membuat 2 transaksi:
//    - Transaksi EXPENSE di wallet asal
//    - Transaksi INCOME di wallet tujuan
// 5. Sukses → onSuccess() dipanggil → tutup modal
//
// KEYBOARD SHORTCUT: Alt+T (dihandle di halaman yang memakainya)
//
// PROPS:
// - isOpen          : boolean
// - onClose         : fungsi tutup modal
// - onSuccess       : fungsi refresh data
// - defaultWalletId : (opsional) wallet asal otomatis dipilih
// ============================================================

import { useState, useEffect } from "react";
import { transferMoney } from "../api/transactions";
import { getWallets } from "../api/wallets";
import { getCategories } from "../api/categories";
import Alert from "../utils/Alert";
import { parseErrors, getTodayDate } from "../utils/format";

export default function TransferModal({ isOpen, onClose, onSuccess, defaultWalletId }) {
  const [form, setForm] = useState({
    amount: "",
    from_wallet_id: "",
    from_category_id: "",
    from_note: "",
    to_wallet_id: "",
    to_category_id: "",
    to_note: "",
    date: getTodayDate(),
  });
  const [wallets, setWallets] = useState([]);
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [incomeCategories, setIncomeCategories] = useState([]);
  const [errors, setErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      getWallets().then((res) => setWallets(res.data.data.wallets)).catch(() => {});
      getCategories().then((res) => {
        const cats = res.data.data.categories;
        // Pisahkan kategori expense dan income
        setExpenseCategories(cats.filter((c) => c.type === "EXPENSE"));
        setIncomeCategories(cats.filter((c) => c.type === "INCOME"));
      }).catch(() => {});
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setForm({
        amount: "",
        from_wallet_id: defaultWalletId || "", // Auto-select jika dari WalletDetail
        from_category_id: "",
        from_note: "",
        to_wallet_id: "",
        to_category_id: "",
        to_note: "",
        date: getTodayDate(),
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

    // Validasi sederhana: dari dan tujuan tidak boleh sama
    if (form.from_wallet_id === form.to_wallet_id) {
      setErrors(["Wallet asal dan tujuan tidak boleh sama"]);
      setSubmitting(false);
      return;
    }

    try {
      await transferMoney({
        ...form,
        amount: parseInt(form.amount),
      });
      onSuccess();
      onClose();
    } catch (err) {
      setErrors(parseErrors(err.response?.data?.errors) || ["Terjadi kesalahan saat transfer"]);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal is-open" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-header">
        <div></div>
        <h3 className="text-lg">Transfer Money</h3>
        <button className="modal-close" onClick={onClose}>×</button>
      </div>
      <div className="modal-body overflow-y-auto max-h-[calc(100vh_-_80px_-_77px)]">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <Alert messages={errors} />

          {/* === BAGIAN FROM (ASAL) === */}
          <div>
            <h3 className="mb-2">FROM</h3>
            <div className="rounded-xl overflow-hidden">
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
              <select name="from_wallet_id" value={form.from_wallet_id} onChange={handleChange} className="form-input" required>
                <option value="" disabled hidden>From Wallet</option>
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>{w.name} ({w.currency_code})</option>
                ))}
              </select>
              <select name="from_category_id" value={form.from_category_id} onChange={handleChange} className="form-input form-input-lg" required>
                <option value="" disabled hidden>Select Expense Category</option>
                {expenseCategories.map((c) => (
                  <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                ))}
              </select>
              <textarea name="from_note" value={form.from_note} onChange={handleChange} rows="3" className="form-input" placeholder="Enter note (optional)" />
            </div>
          </div>

          {/* === BAGIAN TO (TUJUAN) === */}
          <div>
            <h3 className="mb-2">TO</h3>
            <div className="rounded-xl overflow-hidden">
              <select name="to_wallet_id" value={form.to_wallet_id} onChange={handleChange} className="form-input" required>
                <option value="" disabled hidden>Destination Wallet</option>
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>{w.name} ({w.currency_code})</option>
                ))}
              </select>
              <select name="to_category_id" value={form.to_category_id} onChange={handleChange} className="form-input form-input-lg" required>
                <option value="" disabled hidden>Select Income Category</option>
                {incomeCategories.map((c) => (
                  <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                ))}
              </select>
              <textarea name="to_note" value={form.to_note} onChange={handleChange} rows="3" className="form-input" placeholder="Enter note (optional)" />
            </div>
          </div>

          {/* === TANGGAL === */}
          <div>
            <h3 className="mb-2">DATE</h3>
            <div className="rounded-xl overflow-hidden">
              <input type="date" name="date" value={form.date} onChange={handleChange} className="form-input" required />
            </div>
          </div>

          <button type="submit" className="btn btn-lg mt-4" disabled={submitting}>
            {submitting ? "Transferring..." : "Transfer"}
          </button>
        </form>
      </div>
    </div>
  );
}
