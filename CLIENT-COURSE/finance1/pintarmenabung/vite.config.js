// ============================================================
// FILE: vite.config.js
// FUNGSI: Konfigurasi Vite (build tool / dev server untuk React).
//
// Plugin react() diperlukan supaya Vite bisa memahami sintaks JSX.
// ============================================================

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
});
