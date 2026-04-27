// ============================================================
// FILE: src/main.jsx
// FUNGSI: Titik masuk (entry point) aplikasi React.
//
// Ini adalah file pertama yang dijalankan React.
// Tugasnya sederhana: render komponen <App /> ke dalam elemen
// <div id="root"> yang ada di file public/index.html.
//
// Kenapa ReactDOM.createRoot? Ini adalah cara modern React 18
// untuk me-render aplikasi dengan fitur terbaru (Concurrent Mode).
// ============================================================

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css"; // Import CSS dari template (style.css yang sudah ada)

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
