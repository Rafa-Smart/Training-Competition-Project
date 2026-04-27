// ============================================================
// FILE: tailwind.config.js
// FUNGSI: Konfigurasi Tailwind CSS.
//
// "content" memberitahu Tailwind file mana saja yang perlu di-scan
// untuk mencari class yang dipakai. Kalau file tidak terdaftar di sini,
// class Tailwind di dalamnya tidak akan di-generate ke CSS final.
// ============================================================

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Scan semua file JS/JSX di dalam src/
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
