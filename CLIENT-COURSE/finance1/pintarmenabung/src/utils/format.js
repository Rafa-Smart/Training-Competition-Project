// ============================================================
// FILE: src/utils/format.js
// FUNGSI: Fungsi-fungsi pembantu untuk formatting tampilan.
//
// KONSEP:
// Daripada menulis logika format yang sama berkali-kali di banyak komponen,
// kita kumpulkan di sini. Import sesuai kebutuhan.
//
// DIPAKAI DI: Hampir semua komponen yang menampilkan angka atau tanggal
// (Overview.jsx, WalletDetail.jsx, TransactionItem.jsx, dll)
// ============================================================

// FORMAT CURRENCY
// Mengubah angka menjadi format mata uang yang manusiawi
// Contoh: formatCurrency(250000, "IDR") → "IDR 250.000"
//         formatCurrency(12.5, "USD")   → "USD 12,50"
export function formatCurrency(amount, currencyCode = "IDR") {
  // Gunakan Intl.NumberFormat bawaan browser untuk format angka
  const formatted = new Intl.NumberFormat("id-ID").format(amount);
  return `${currencyCode} ${formatted}`;
}

// FORMAT DATE (Human Readable)
// Mengubah string tanggal "YYYY-MM-DD" menjadi format mudah dibaca
// Contoh: formatDate("2025-06-07") → "Jun 7, 2025"
export function formatDate(dateString) {
  const date = new Date(dateString + "T00:00:00"); // Paksa timezone lokal
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// PARSE ERRORS dari response backend
// Backend mengirim errors sebagai objek: { email: ["msg1"], password: ["msg2"] }
// Fungsi ini mengubahnya menjadi array flat: ["msg1", "msg2"]
// Contoh input:  { email: ["Email sudah dipakai"], password: ["Terlalu pendek"] }
// Contoh output: ["Email sudah dipakai", "Terlalu pendek"]
export function parseErrors(errorsObject) {
  if (!errorsObject) return [];
  return Object.values(errorsObject).flat();
}

// GET TODAY DATE dalam format YYYY-MM-DD (dipakai sebagai default value input date)
export function getTodayDate() {
  return new Date().toISOString().split("T")[0];
}
