// ============================================================
// FILE: src/utils/Alert.jsx
// FUNGSI: Komponen untuk menampilkan pesan error validasi.
//
// KONSEP:
// Saat register atau login gagal, backend mengirim objek "errors" yang
// isinya array pesan error per field. Komponen ini menerima array pesan
// tersebut (prop "messages") dan menampilkannya dalam satu kotak merah.
// Ada tombol × untuk menyembunyikan alertnya.
//
// CARA PAKAI (contoh di Login.jsx):
//   const [errors, setErrors] = useState([]);
//   <Alert messages={errors} />
//
// Kalau errors kosong atau sudah ditutup, komponen ini tidak render apapun.
//
// DIPAKAI DI:
// - src/pages/Login.jsx
// - src/pages/Register.jsx
// - src/components/AddWalletModal.jsx
// - src/components/AddTransactionModal.jsx
// - src/components/TransferModal.jsx
// ============================================================

 
import { useState, useEffect } from "react";

export default function Alert({ messages }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (messages && messages.length > 0) {
      setVisible(true);
    }
  }, [messages]);

  if (!visible) return null;

  return (
    <div className="bg-red-500 text-white p-3 rounded-xl text-sm relative">
      <button
        onClick={() => setVisible(false)}
        className="absolute right-3 top-2 text-white font-bold text-lg"
      >
        ×
      </button>

      {messages.map((msg, i) => (
        <div key={i}>{msg}</div>
      ))}
    </div>
  );
}
