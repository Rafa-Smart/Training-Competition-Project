# 📖 PENJELASAN LENGKAP: Aplikasi Peta Interaktif Indonesia

> **Target pembaca**: Kamu yang ingin benar-benar paham setiap baris kode di proyek ini.
> Penjelasan ini ditulis dengan bahasa yang santai dan mudah dipahami, dilengkapi visualisasi ASCII agar kamu bisa "melihat" apa yang terjadi di dalam kode.

---

## 📋 DAFTAR ISI

1. [Gambaran Besar Aplikasi](#-1-gambaran-besar-aplikasi)
2. [Struktur File Proyek](#-2-struktur-file-proyek)
3. [HTML — Kerangka Halaman](#-3-html--kerangka-halaman)
4. [CSS — Tampilan Visual](#-4-css--tampilan-visual)
5. [MapView.js — Otak Visual Peta](#-5-mapviewjs--otak-visual-peta)
6. [App.js — Otak Logika Aplikasi](#-6-appjs--otak-logika-aplikasi)
7. [Alur Program dari Awal Sampai Akhir](#-7-alur-program-dari-awal-sampai-akhir)
8. [Rangkuman Algoritma Penting](#-8-rangkuman-algoritma-penting)

---

## 🌍 1. GAMBARAN BESAR APLIKASI

### Apa sih aplikasi ini?

Bayangkan kamu buka Google Maps. Kamu bisa:
- Melihat peta
- Menambahkan titik lokasi (pinpoint)
- Menghubungkan lokasi-lokasi dengan garis
- Mencari rute tercepat atau termurah

Nah, aplikasi ini persis seperti itu, tapi versi sederhana yang kamu buat sendiri!

### Fitur-fitur utama:

```
┌─────────────────────────────────────────────────────────────┐
│                    FITUR APLIKASI                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. 🗺️  Peta interaktif yang bisa di-zoom dan di-geser     │
│  2. 📌  Menambah pinpoint (titik lokasi) di peta            │
│  3. 🔗  Menghubungkan dua pinpoint dengan garis koneksi     │
│  4. 🚂  Memilih jenis transportasi (kereta/bus/pesawat)     │
│  5. 🔍  Mencari semua rute dari kota A ke kota B            │
│  6. 📊  Mengurutkan rute: tercepat atau termurah            │
│  7. 🗑️  Menghapus pinpoint atau garis koneksi               │
│  8. 💾  Data tersimpan otomatis di browser (localStorage)   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Arsitektur Kode (cara kode diorganisir):

```
┌──────────────────────────────────────────────────┐
│                   index.html                     │
│         (Kerangka / Struktur halaman)            │
│                                                  │
│    ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│    │ style.css│  │MapView.js│  │  app.js  │     │
│    │(Tampilan)│  │(Peta)    │  │(Logika)  │     │
│    └──────────┘  └──────────┘  └──────────┘     │
│                       │              │           │
│                       │    memanggil │           │
│                       │◄─────────────┘           │
│                       │                          │
│                  MapView digunakan               │
│                  oleh App untuk                  │
│                  menggambar peta                  │
└──────────────────────────────────────────────────┘
```

Ada 2 class JavaScript utama:
- **MapView** = Bertanggung jawab soal TAMPILAN peta (zoom, geser, gambar pinpoint, gambar garis)
- **App** = Bertanggung jawab soal LOGIKA (data, event klik, pencarian rute)

Analogi: Kalau MapView itu tukang gambar (dia cuma bisa gambar apa yang disuruh), maka App itu mandornya (dia yang memutuskan APA yang harus digambar dan KAPAN).

---

## 📁 2. STRUKTUR FILE PROYEK

```
game1/
├── index.html              ← Halaman utama (kerangka)
├── style/
│   └── style.css           ← Semua styling / tampilan
├── js/
│   ├── MapView.js          ← Class untuk visual peta
│   └── app.js              ← Class controller utama
└── assets/                 ← Gambar-gambar (SVG icons)
    ├── indonesia.svg       ← Gambar peta Indonesia
    ├── MaterialSymbolsLocationOn.svg
    ├── MaterialSymbolsLocationOnOutline.svg
    ├── MdiTransitConnectionVariant.svg
    ├── MdiTrashCanOutline.svg
    └── BiXLg.svg
```

---

## 🏗️ 3. HTML — KERANGKA HALAMAN

### 3.1 Head — Pengaturan Awal

```html
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Peta Interaktif Indonesia</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="style/style.css">
</head>
```

**Penjelasan baris per baris:**

| Baris | Kode | Fungsi |
|-------|------|--------|
| 1 | `<!DOCTYPE html>` | Memberitahu browser: "Ini dokumen HTML5" |
| 2 | `<html lang="id">` | Bahasa halaman = Indonesia |
| 4 | `<meta charset="UTF-8">` | Encoding karakter. Supaya huruf Indonesia (é, ñ, dll) tampil benar |
| 5 | `<meta name="viewport" ...>` | Supaya halaman responsive di HP/tablet |
| 6 | `<title>` | Judul yang muncul di tab browser |
| 7-9 | `<link ... fonts.googleapis ...>` | Memuat font "Outfit" dari Google Fonts |
| 10 | `<link rel="stylesheet" ...>` | Menghubungkan file CSS |

**Kenapa ada `preconnect`?**

Bayangkan kamu mau mengirim surat ke seseorang di kota lain. `preconnect` itu seperti kamu menelepon kantor pos duluan dan bilang "Siapkan ya, sebentar lagi saya kirim surat!" Jadi saat kamu benar-benar mengirim (memuat font), prosesnya lebih cepat karena koneksi sudah siap.

### 3.2 Panel Pencarian Rute (Sidebar Kiri)

```html
<aside id="route-panel">
    <h2>Find Route</h2>

    <!-- Input kota asal -->
    <div class="input-group">
        <img src="assets/MaterialSymbolsLocationOn.svg" alt="from">
        <input type="text" id="input-from" placeholder="From" autocomplete="off">
    </div>

    <!-- Input kota tujuan -->
    <div class="input-group">
        <img src="assets/MaterialSymbolsLocationOnOutline.svg" alt="to">
        <input type="text" id="input-to" placeholder="To" autocomplete="off">
    </div>

    <!-- Tombol cari -->
    <button id="btn-search" disabled>Search</button>

    <!-- Tombol sortir -->
    <div id="sort-controls" class="hidden">
        <span>Sort by:</span>
        <button class="sort-btn active" data-sort="fastest">Fastest</button>
        <button class="sort-btn" data-sort="cheapest">Cheapest</button>
    </div>

    <!-- Hasil pencarian -->
    <div id="route-results"></div>
</aside>
```

**Visualisasi tampilan panel ini:**

```
┌──────────────────────┐
│   Find Route         │
│                      │
│ ┌──────────────────┐ │
│ │ 📍 From          │ │ ← input kota asal
│ └──────────────────┘ │
│                      │
│ ┌──────────────────┐ │
│ │ 📍 To            │ │ ← input kota tujuan
│ └──────────────────┘ │
│                      │
│ ┌──────────────────┐ │
│ │     Search       │ │ ← tombol cari (disabled sampai input valid)
│ └──────────────────┘ │
│                      │
│ Sort by: Fastest     │ ← muncul setelah pencarian
│          Cheapest    │
│                      │
│ ┌──────────────────┐ │
│ │ Route 1          │ │ ← hasil rute ditampilkan di sini
│ │ Jakarta → Bandung│ │
│ │ 2h 30min  Rp50rb │ │
│ └──────────────────┘ │
│                      │
│ ┌──────────────────┐ │
│ │ Route 2          │ │
│ │ ...              │ │
│ └──────────────────┘ │
└──────────────────────┘
```

**Hal penting:**
- `disabled` pada `<button id="btn-search" disabled>` → Tombol ini awalnya tidak bisa diklik. Baru aktif ketika kedua input diisi dengan nama kota yang valid.
- `class="hidden"` pada sort-controls → Tersembunyi dulu, baru muncul setelah pencarian dilakukan.
- `data-sort="fastest"` → Atribut custom HTML5. Kita bisa baca nilainya di JavaScript dengan `element.dataset.sort`.
- `autocomplete="off"` → Mencegah browser menampilkan saran otomatis dari riwayat input sebelumnya.

### 3.3 Area Peta (Bagian Utama)

```html
<main id="map-area">
    <div id="map-container">
        <!-- Layer 1: Gambar peta -->
        <img id="map-img" src="assets/indonesia.svg" draggable="false" alt="Peta Indonesia">

        <!-- Layer 2: Garis koneksi (SVG) -->
        <svg id="lines-layer" xmlns="http://www.w3.org/2000/svg"></svg>

        <!-- Layer 3: Pinpoint / marker -->
        <div id="pinpoints-layer"></div>
    </div>
</main>
```

**Konsep Layer (Lapisan):**

Bayangkan kamu menggambar di 3 lembar kertas transparan yang ditumpuk:

```
   ┌─────────────────────────┐
   │   LAYER 3: Pinpoints    │  ← Paling atas, titik-titik lokasi
   │   📌   📌       📌     │
   ├─────────────────────────┤
   │   LAYER 2: Lines        │  ← Tengah, garis penghubung
   │   ────────  ──────      │
   ├─────────────────────────┤
   │   LAYER 1: Map Image    │  ← Paling bawah, gambar peta
   │   🗺️🗺️🗺️🗺️🗺️🗺️         │
   └─────────────────────────┘
```

Ketiga layer ini ditumpuk di dalam `#map-container`. Saat kamu zoom atau geser peta, yang bergerak adalah `#map-container` (wadahnya), sehingga ketiga layer ikut bergerak bersama!

**Kenapa garis pakai SVG, bukan `<div>`?**

SVG (Scalable Vector Graphics) itu format gambar yang berbasis matematika, bukan pixel. Jadi saat kamu zoom in, garisnya tetap tajam dan tidak pecah. Sangat cocok untuk menggambar garis, lingkaran, dan bentuk geometri.

### 3.4 Popup Tambah Pinpoint

```html
<div id="popup-add" class="popup hidden">
    <div class="popup-header">
        <span>Add pinpoint</span>
        <img src="assets/BiXLg.svg" class="popup-close" id="close-add" alt="close">
    </div>
    <form id="form-add">
        <input type="text" id="input-name" placeholder="Enter location name" required autocomplete="off">
    </form>
</div>
```

Popup ini muncul saat kamu **double-click** di peta. Kamu ketik nama lokasi, tekan Enter, dan pinpoint langsung muncul di posisi yang kamu klik.

**Kenapa pakai `<form>` bukan `<div>` biasa?**

Karena `<form>` punya perilaku bawaan: saat kamu tekan Enter di dalam input, form otomatis melakukan "submit". Kita memanfaatkan ini supaya kamu tidak perlu klik tombol — cukup tekan Enter.

### 3.5 Popup Koneksi

```html
<div id="popup-connect" class="popup hidden">
    <div class="popup-header">
        <span>Connect</span>
        <img src="assets/BiXLg.svg" class="popup-close" id="close-connect" alt="close">
    </div>
    <form id="form-connect">
        <input type="number" id="input-distance" placeholder="Distance (km)" required min="1">
        <select id="input-mode" required>
            <option value="">Select transport</option>
            <option value="train">Train</option>
            <option value="bus">Bus</option>
            <option value="airplane">Airplane</option>
        </select>
        <button type="submit">Connect</button>
    </form>
</div>
```

Popup ini muncul saat kamu mau menghubungkan dua pinpoint. Kamu perlu mengisi:
1. **Jarak** (dalam km)
2. **Jenis transportasi** (kereta/bus/pesawat)

### 3.6 Script Loading

```html
<script src="js/MapView.js"></script>
<script src="js/app.js"></script>
```

**PENTING: Urutan script sangat penting!**

`MapView.js` harus dimuat DULUAN karena `app.js` menggunakan class `MapView`. Kalau dibalik, browser akan error: "MapView is not defined".

Analoginya: Kamu harus belajar alfabet dulu sebelum belajar membaca. MapView = alfabet, App = membaca.

---

## 🎨 4. CSS — TAMPILAN VISUAL

### 4.1 CSS Variables (Variabel CSS)

```css
:root {
    --primary: #7B2FF2;        /* Warna utama: ungu */
    --primary-hover: #6320d0;  /* Warna hover: ungu lebih gelap */
    --bg-map: #C8EBFF;         /* Warna background peta: biru muda */
    --radius: 6px;             /* Radius sudut tombol/input */
    --shadow: 0 2px 10px rgba(0,0,0,0.12);
    --font: 'Outfit', 'Segoe UI', sans-serif;
}
```

**Apa itu CSS Variables?**

Bayangkan kamu sedang mewarnai 100 tombol dengan warna ungu. Tanpa variabel, kamu harus menulis `#7B2FF2` di 100 tempat. Kalau mau ganti warna, kamu harus edit 100 tempat!

Dengan variabel, kamu cukup tulis `--primary: #7B2FF2` sekali di `:root`, lalu pakai `var(--primary)` di mana-mana. Mau ganti warna? Cukup ubah 1 baris!

```
TANPA VARIABEL:                    DENGAN VARIABEL:
──────────────                     ────────────────
tombol-1: #7B2FF2                  :root { --primary: #7B2FF2 }
tombol-2: #7B2FF2                  
tombol-3: #7B2FF2                  tombol-1: var(--primary)
...                                tombol-2: var(--primary)
tombol-100: #7B2FF2                tombol-3: var(--primary)
                                   
Mau ganti? Edit 100 tempat!        Mau ganti? Edit 1 tempat!
```

### 4.2 Reset & Base

```css
* { margin: 0; padding: 0; box-sizing: border-box; }
body { width: 100%; height: 100vh; overflow: hidden; font-family: var(--font); background: var(--bg-map); }
```

**`* { margin: 0; padding: 0; }`** — Setiap browser punya "default styling". Misalnya, `<h1>` punya margin atas dan bawah. `<body>` punya margin 8px. Reset ini menghilangkan semua default itu supaya kita mulai dari nol.

**`box-sizing: border-box`** — Ini penting banget!

```
TANPA border-box:                   DENGAN border-box:
──────────────────                  ──────────────────
width: 100px                        width: 100px
padding: 10px                       padding: 10px
border: 2px                         border: 2px

Total lebar = 100 + 20 + 4 = 124px  Total lebar = 100px (padding & border masuk ke dalam)
```

**`overflow: hidden`** — Menyembunyikan scroll bar supaya peta tidak bisa discroll (kita pakai zoom/pan custom).

**`100vh`** — vh = viewport height. `100vh` = 100% tinggi layar browser.

### 4.3 CSS Nesting (Sarang CSS)

Ini fitur CSS modern yang membuat kode lebih rapi. Perhatikan contoh di `#route-panel`:

```css
#route-panel {
    /* styling panel */
    
    h2 { /* styling h2 yang ADA DI DALAM #route-panel */ }
    
    .input-group {
        /* styling input-group yang ADA DI DALAM #route-panel */
        
        &:focus-within { /* saat ada input di dalamnya yang difokuskan */ }
        img { /* styling img yang ADA DI DALAM .input-group */ }
        input { /* styling input yang ADA DI DALAM .input-group */ }
    }
}
```

Tanpa nesting, kamu harus menulis:
```css
#route-panel { ... }
#route-panel h2 { ... }
#route-panel .input-group { ... }
#route-panel .input-group:focus-within { ... }
#route-panel .input-group img { ... }
#route-panel .input-group input { ... }
```

Dengan nesting, kode jadi lebih:
1. **Singkat** — Tidak perlu mengulang `#route-panel` berkali-kali
2. **Terstruktur** — Bisa langsung lihat hierarki elemen
3. **Mudah dibaca** — Mirip struktur HTML-nya

**Simbol `&` dalam nesting:**

`&` artinya "elemen saat ini". Contoh:

```css
#btn-search {
    &:hover:not(:disabled) { ... }
    /* Sama dengan: #btn-search:hover:not(:disabled) { ... } */
    
    &:disabled { ... }
    /* Sama dengan: #btn-search:disabled { ... } */
}

#sort-controls {
    &.hidden { ... }
    /* Sama dengan: #sort-controls.hidden { ... } */
    /* PERHATIKAN: tidak ada spasi antara & dan .hidden */
    /* Ini artinya ELEMEN YANG SAMA punya class "hidden" */
}
```

### 4.4 Tombol Search dan State-nya

```css
#btn-search {
    width: 100%; padding: 12px; background: var(--primary); color: #fff; border: none;
    border-radius: var(--radius); font-weight: 600; cursor: pointer; transition: 0.2s;
    &:hover:not(:disabled) { background: var(--primary-hover); transform: translateY(-1px); }
    &:active:not(:disabled) { transform: translateY(0); }
    &:disabled { background: #e0e0e0; cursor: not-allowed; color: #aaa; }
}
```

**Penjelasan setiap state:**

```
┌──────────────────────────────────────────────────────┐
│                 STATE TOMBOL SEARCH                   │
├──────────────────────────────────────────────────────┤
│                                                      │
│  NORMAL (enabled):                                   │
│  ┌──────────────┐                                    │
│  │   Search     │  ← Background ungu, teks putih    │
│  └──────────────┘                                    │
│                                                      │
│  HOVER (kursor di atas, enabled):                    │
│  ┌──────────────┐                                    │
│  │   Search  ↑  │  ← Ungu lebih gelap               │
│  └──────────────┘    + naik 1px (translateY(-1px))   │
│                                                      │
│  ACTIVE (diklik):                                    │
│  ┌──────────────┐                                    │
│  │   Search  ↓  │  ← Kembali ke posisi asli          │
│  └──────────────┘    (translateY(0)) → efek "tekan"  │
│                                                      │
│  DISABLED (belum valid):                             │
│  ┌──────────────┐                                    │
│  │   Search     │  ← Abu-abu, cursor "not-allowed"  │
│  └──────────────┘    Tidak bisa diklik               │
│                                                      │
└──────────────────────────────────────────────────────┘
```

**`:not(:disabled)` itu apa?**

Artinya "SELAMA BUKAN disabled". Jadi hover effect dan active effect hanya berlaku kalau tombolnya enabled (aktif). Kalau disabled, hover tidak mengubah apa-apa.

### 4.5 Area Peta dan Layer-layernya

```css
#map-area {
    position: fixed; left: 280px; inset: 0 0 0 280px; overflow: hidden;
    background: var(--bg-map); cursor: grab;
    &.dragging { cursor: grabbing; }
}
```

**`inset: 0 0 0 280px`** — Ini shorthand untuk `top: 0; right: 0; bottom: 0; left: 280px;`

```
Visualisasi layout:
┌────────┬────────────────────────────────┐
│        │                                │
│ 280px  │     MAP AREA                   │
│        │    (sisa layar)                │
│ Panel  │                                │
│  Rute  │     cursor: grab 👋            │
│        │     (bisa digenggam & digeser) │
│        │                                │
│        │                                │
└────────┴────────────────────────────────┘
   left:280px
```

**`cursor: grab` dan `cursor: grabbing`:**

- `grab` 👋 = Tangan terbuka → "Kamu bisa genggam peta ini"
- `grabbing` ✊ = Tangan menggenggam → "Kamu sedang menggeser peta"

**`pointer-events: none`** pada `#lines-layer` dan `#pinpoints-layer`:

Ini membuat layer tersebut "tembus klik". Bayangkan ada kaca di depan peta. Kaca itu ada (`pointer-events: none`), kamu bisa lihat menembus kaca, tapi kalau kamu klik, kliknya menembus kaca dan mengenai peta di belakangnya.

Tapi di `.pinpoint`, ada `pointer-events: auto` yang artinya "pinpoint ini BISA diklik, meskipun layer induknya tembus klik".

### 4.6 Animasi Glow pada Pinpoint

```css
.pinpoint-label {
    &.connecting {
        border-color: var(--primary);
        background: #f5f0ff;
        animation: glow 1s infinite alternate;
    }
}

@keyframes glow {
    from { box-shadow: 0 0 4px #7b2ff266; }
    to   { box-shadow: 0 0 16px #7b2ff2aa; }
}
```

**Apa yang terjadi:**

Saat kamu memulai mode "connecting" (menghubungkan pinpoint), pinpoint sumber akan bersinar (glow) dengan warna ungu yang berkedip-kedip.

```
Animasi glow (1 detik, bolak-balik tanpa henti):

Detik 0.0 →  (cahaya kecil)     box-shadow: 0 0 4px
Detik 0.5 →  (cahaya sedang)    box-shadow: 0 0 10px
Detik 1.0 →  (cahaya besar)     box-shadow: 0 0 16px
Detik 1.5 →  (cahaya sedang)    box-shadow: 0 0 10px  ← kembali (alternate)
Detik 2.0 →  (cahaya kecil)     box-shadow: 0 0 4px   ← ulangi
...
```

- `infinite` = Terus berulang tanpa henti
- `alternate` = Bolak-balik (from → to → from → to → ...)
- `#7b2ff266` = Warna ungu dengan transparansi 40% (66 dalam hex = 40% opacity)
- `#7b2ff2aa` = Warna ungu dengan transparansi 67% (aa dalam hex = 67% opacity)

---

## 🔭 5. MapView.js — OTAK VISUAL PETA

Class `MapView` bertanggung jawab untuk semua hal VISUAL pada peta. Dia tidak tahu apa-apa soal data, rute, atau logika bisnis. Dia cuma tahu cara MENGGAMBAR.

### 5.1 Constructor — Menyimpan Referensi

```javascript
class MapView {
    constructor(area, container, linesEl, pinsEl) {
        this.area = area;           // Elemen #map-area (viewport)
        this.container = container; // Elemen #map-container (wadah yang di-transform)
        this.linesEl = linesEl;     // Elemen SVG #lines-layer
        this.pinsEl = pinsEl;       // Elemen #pinpoints-layer
        this.scale = 1;             // Tingkat zoom (1 = 100%)
        this.ox = 0;                // Offset horizontal (geser kiri-kanan)
        this.oy = 0;                // Offset vertikal (geser atas-bawah)
        this.dragging = false;      // Apakah sedang di-drag?
    }
```

**Variabel `scale`, `ox`, `oy`:**

Ini adalah 3 angka yang menentukan posisi dan ukuran peta di layar.

```
Bayangkan peta sebagai foto yang kamu pegang:

scale = 1.0          scale = 2.0          scale = 0.5
(ukuran asli)        (zoom in 2x)         (zoom out 0.5x)
┌──────────┐         ┌──────────────────┐  ┌─────┐
│          │         │                  │  │     │
│   PETA   │         │                  │  │PETA │
│          │         │      PETA        │  │     │
└──────────┘         │                  │  └─────┘
                     │                  │
                     └──────────────────┘

ox = 0, oy = 0       ox = 100, oy = 50
(pojok kiri atas)     (digeser ke kanan dan bawah)
┌──────────┐         ┌──────────┐
│PETA      │         │          │
│          │         │   PETA   │ ← peta geser 100px kanan, 50px bawah
└──────────┘         └──────────┘
```

### 5.2 fitToScreen — Zoom Pertama Kali

```javascript
fitToScreen(w, h) {
    const aw = this.area.clientWidth, ah = this.area.clientHeight;
    
    this.scale = Math.max(aw / w, ah / h);// dia akna kembaliakan nilai tertingginya diantara arry ini
    this.ox = (aw - w * this.scale) / 2;
    this.oy = (ah - h * this.scale) / 2;
}
```

**Fungsi ini dipanggil saat halaman dibuka pertama kali.** Tujuannya: membuat peta mengisi seluruh layar.

**Parameter:**
- `w` = 982 (lebar peta asli dalam pixel)
- `h` = 450 (tinggi peta asli dalam pixel)

**Langkah-langkah perhitungan:**

```
Contoh: layar kamu 1200 x 600 pixel, peta asli 982 x 450 pixel

Langkah 1: Hitung ukuran area yang tersedia
   aw = area.clientWidth  = 1200 - 280 (panel) = 920 px
   ah = area.clientHeight = 600 px

Langkah 2: Hitung rasio zoom
   Rasio horizontal = aw / w = 920 / 982 = 0.937
   Rasio vertikal   = ah / h = 600 / 450 = 1.333
   
   Math.max(0.937, 1.333) = 1.333
   
   Kenapa Math.max (bukan Math.min)?
   → Karena kita mau peta MENGISI seluruh layar (cover, bukan contain)
   → Kalau pakai Math.min, peta akan pas di dalam tapi ada ruang kosong
   → Kalau pakai Math.max, peta akan menutupi seluruh layar tapi mungkin ada bagian terpotong

Langkah 3: Hitung offset supaya peta di tengah
   Lebar peta setelah zoom = w * scale = 982 * 1.333 = 1309 px
   Kelebihan horizontal    = aw - 1309 = 920 - 1309  = -389 px
   ox = -389 / 2 = -194.5 px (geser ke kiri supaya center)

   Tinggi peta setelah zoom = h * scale = 450 * 1.333 = 600 px
   Kelebihan vertikal       = ah - 600  = 600 - 600   = 0 px
   oy = 0 / 2 = 0 px (sudah pas tengah)
```

**Visualisasi:**

```
SEBELUM fitToScreen:                SETELAH fitToScreen:
┌────────────────────┐              ┌────────────────────┐
│                    │              │████████████████████│
│    ┌──────────┐    │              │████████████████████│
│    │   PETA   │    │              │████ PETA █████████│
│    └──────────┘    │              │████████████████████│
│                    │              │████████████████████│
└────────────────────┘              └────────────────────┘
   Peta kecil, banyak               Peta mengisi layar,
   ruang kosong                      di-center
```

### 5.3 applyTransform — Menerapkan Posisi ke Layar

```javascript
applyTransform(w, h) {
    this.container.style.transform = `translate(${this.ox}px,${this.oy}px) scale(${this.scale})`;
    this.linesEl.setAttribute('width', w);
    this.linesEl.setAttribute('height', h);
}
```

**Apa yang terjadi:**

Fungsi ini mengubah CSS `transform` pada `#map-container`. Ini membuat SELURUH isi container (peta, garis, pinpoint) bergerak dan berubah ukuran sekaligus.

```
CSS transform yang dihasilkan:
transform: translate(-194.5px, 0px) scale(1.333);

Artinya:
1. Geser container -194.5px ke kiri, 0px ke bawah
2. Perbesar container 1.333x dari ukuran asli

PENTING: Urutan transform itu PENTING!
- translate dulu, baru scale → peta digeser dulu, lalu diperbesar
```

Selain itu, fungsi ini juga mengatur ukuran SVG `lines-layer` supaya sesuai dengan ukuran peta asli.

### 5.4 zoomAt — Zoom Mengikuti Posisi Cursor ⭐ (ALGORITMA PENTING!)

```javascript
zoomAt(cx, cy, factor, w, h) {
    const r = this.area.getBoundingClientRect();
    const mx = cx - r.left, my = cy - r.top;
    const px = (mx - this.ox) / this.scale, py = (my - this.oy) / this.scale;
    this.scale = Math.max(0.3, Math.min(15, this.scale * factor));
    this.ox = mx - px * this.scale;
    this.oy = my - py * this.scale;
    this.applyTransform(w, h);
}
```

**Ini adalah salah satu fungsi PALING PENTING dan PALING RUMIT di seluruh aplikasi.** Mari kita bongkar baris per baris.

**Tujuan:** Saat kamu zoom in/out dengan scroll wheel, titik di bawah cursor kamu harus tetap di posisinya. Seperti Google Maps — kalau kamu zoom in ke Jakarta, Jakarta tetap di bawah cursor kamu.

**Parameter:**
- `cx, cy` = Posisi cursor di layar (clientX, clientY)
- `factor` = Faktor zoom (1.15 = zoom in 15%, 0.85 = zoom out 15%)
- `w, h` = Ukuran peta asli (982, 450)

**Baris 1: Dapatkan posisi area peta di layar**
```javascript
const r = this.area.getBoundingClientRect();
```
`getBoundingClientRect()` mengembalikan posisi dan ukuran elemen di layar.

```
┌──────────────────────────────────────────┐
│ Browser window                           │
│                                          │
│   ┌──────────────────────────────────┐   │
│   │ #map-area                        │   │
│   │                                  │   │
│   │     r.left = 280                 │   │
│   │     r.top = 0                    │   │
│   │                                  │   │
│   └──────────────────────────────────┘   │
└──────────────────────────────────────────┘
```

**Baris 2: Hitung posisi cursor RELATIF terhadap area peta**
```javascript
const mx = cx - r.left, my = cy - r.top;
```

```
Contoh: cursor di posisi layar (500, 300), area mulai di (280, 0)
mx = 500 - 280 = 220   ← cursor ada 220px dari kiri area
my = 300 - 0   = 300   ← cursor ada 300px dari atas area
```

**Baris 3: Konversi posisi cursor ke KOORDINAT PETA ⭐**
```javascript
const px = (mx - this.ox) / this.scale;
const py = (my - this.oy) / this.scale;
```

Ini adalah "rumus terbalik" dari transform. Kalau transform mengubah koordinat peta → posisi layar, maka rumus ini mengubah posisi layar → koordinat peta.

```
Rumus transform (peta → layar):
   layarX = petaX * scale + ox
   layarY = petaY * scale + oy

Rumus terbalik (layar → peta):
   petaX = (layarX - ox) / scale
   petaY = (layarY - oy) / scale

Contoh: mx=220, my=300, ox=-194.5, oy=0, scale=1.333
   px = (220 - (-194.5)) / 1.333 = 414.5 / 1.333 = 310.9
   py = (300 - 0) / 1.333 = 300 / 1.333 = 225.1
   
   Artinya: cursor kamu menunjuk titik (310.9, 225.1) di peta asli
```

**Baris 4: Update scale dengan batasan**
```javascript
this.scale = Math.max(0.3, Math.min(15, this.scale * factor));
```

```
                Math.min(15, ...)         Math.max(0.3, ...)
                ↓                         ↓
Nilai scale:  0.3 ────────────────────── 15
              (zoom out max)            (zoom in max)

Contoh: scale=1.333, factor=1.15 (zoom in)
   1.333 * 1.15 = 1.533
   Math.min(15, 1.533) = 1.533  ← belum melebihi batas
   Math.max(0.3, 1.533) = 1.533 ← aman

Contoh: scale=0.35, factor=0.85 (zoom out)
   0.35 * 0.85 = 0.2975
   Math.min(15, 0.2975) = 0.2975
   Math.max(0.3, 0.2975) = 0.3  ← dibatasi, tidak boleh kurang dari 0.3
```

**Baris 5-6: Hitung offset baru agar titik cursor tetap di posisinya ⭐**
```javascript
this.ox = mx - px * this.scale;
this.oy = my - py * this.scale;
```

Ini KUNCI dari zoom yang "smooth". Mari lihat logikanya:

```
SEBELUM zoom:
- Titik peta (px, py) muncul di posisi layar (mx, my)
- Karena: mx = px * oldScale + oldOx

SETELAH zoom (scale berubah):
- Kita INGIN titik peta (px, py) TETAP muncul di posisi layar (mx, my)
- Maka: mx = px * newScale + newOx
- Jadi: newOx = mx - px * newScale

Visualisasi:
SEBELUM (scale=1.0):          SETELAH (scale=2.0, zoom in):
    cursor                         cursor
      ↓                             ↓
┌─────●─────┐                ┌─────●────────────┐
│  Jakarta  │                │  Jakarta          │
│           │                │                   │
└───────────┘                │                   │
                             └───────────────────┘
                             Jakarta tetap di bawah cursor!
```

### 5.5 zoomCenter — Zoom dari Tengah Layar

```javascript
zoomCenter(factor, w, h) {
    const r = this.area.getBoundingClientRect();
    this.zoomAt(r.left + r.width / 2, r.top + r.height / 2, factor, w, h);
}
```

Fungsi ini dipakai saat user menekan **CTRL + Plus** atau **CTRL + Minus**. Karena tidak ada posisi cursor (keyboard kan tidak punya posisi), kita zoom dari titik TENGAH layar.

```
┌────────────────────────────────┐
│                                │
│                                │
│            zoom dari           │
│         titik tengah ●         │
│                                │
│                                │
└────────────────────────────────┘
```

### 5.6 screenToMap — Konversi Posisi Layar ke Koordinat Peta

```javascript
screenToMap(cx, cy) {
    const r = this.area.getBoundingClientRect();
    return {
        x: (cx - r.left - this.ox) / this.scale,
        y: (cy - r.top - this.oy) / this.scale
    };
}
```

Fungsi ini dipakai saat user **double-click** di peta untuk menambah pinpoint. Kita perlu tahu: "di koordinat peta berapa user mengklik?"

Rumusnya SAMA persis dengan yang di `zoomAt` baris 3.

```
Contoh: Klik di layar (500, 300)
   r.left = 280, r.top = 0
   ox = -194.5, oy = 0, scale = 1.333

   x = (500 - 280 - (-194.5)) / 1.333 = 414.5 / 1.333 = 310.9
   y = (300 - 0 - 0) / 1.333 = 225.1

   Hasil: { x: 310.9, y: 225.1 }
   → Pinpoint akan ditaruh di koordinat (310.9, 225.1) di peta
```

### 5.7 Pan (Geser Peta) — startDrag, moveDrag, stopDrag

```javascript
startDrag(e) {
    this.dragging = true;
    this._dx = e.clientX; this._dy = e.clientY;      // Posisi awal mouse
    this._sox = this.ox; this._soy = this.oy;         // Posisi awal peta
}

moveDrag(e, w, h) {
    if (!this.dragging) return;
    this.ox = this._sox + (e.clientX - this._dx);     // Peta ikut pergerakan mouse
    this.oy = this._soy + (e.clientY - this._dy);
    this.applyTransform(w, h);
}

stopDrag() { this.dragging = false; }
```

**Alur pan (geser peta):**

```
1. User TEKAN mouse (mousedown)
   → startDrag() dipanggil
   → Simpan posisi awal mouse (_dx, _dy) dan posisi awal peta (_sox, _soy)
   → dragging = true

2. User GERAKKAN mouse (mousemove)
   → moveDrag() dipanggil
   → Hitung berapa pixel mouse bergerak: (clientX - _dx)
   → Tambahkan ke posisi awal peta: _sox + pergerakan
   → Hasilnya: peta ikut bergerak sejauh mouse bergerak!

3. User LEPAS mouse (mouseup)
   → stopDrag() dipanggil
   → dragging = false
   → Berhenti menggeser

Visualisasi:
START:  Mouse di (400, 200), Peta di (ox=100, oy=50)
        _dx=400, _dy=200, _sox=100, _soy=50

MOVE:   Mouse pindah ke (450, 220)
        ox = 100 + (450 - 400) = 100 + 50 = 150
        oy = 50 + (220 - 200) = 50 + 20 = 70
        → Peta bergerak 50px ke kanan dan 20px ke bawah
```

### 5.8 renderPins — Menggambar Semua Pinpoint ⭐

```javascript
renderPins(pins, { connectingId, onConnect, onDelete, onTarget }) {
    this.pinsEl.innerHTML = '';    // Hapus semua pinpoint lama
    pins.forEach(pin => {
        // 1. Buat container pinpoint
        const el = document.createElement('div');
        el.className = 'pinpoint';
        el.style.left = pin.x + 'px';
        el.style.top = pin.y + 'px';

        // 2. Buat label (nama + tombol)
        const label = document.createElement('div');
        label.className = 'pinpoint-label' + (connectingId === pin.id ? ' connecting' : '');
        label.innerHTML = `<span>${pin.name}</span>
            <img src="assets/MdiTransitConnectionVariant.svg" class="btn-icon" title="Connect">
            <img src="assets/MdiTrashCanOutline.svg" class="btn-icon" title="Delete">`;

        // 3. Pasang event: tombol connect dan delete
        const btns = label.querySelectorAll('.btn-icon');
        btns[0].onclick = e => { e.stopPropagation(); onConnect(pin.id); };
        btns[1].onclick = e => { e.stopPropagation(); onDelete(pin.id); };
        el.appendChild(label);

        // 4. Buat marker (ikon pin merah)
        const marker = document.createElement('div');
        marker.className = 'pinpoint-marker';
        marker.innerHTML = '<svg viewBox="0 0 24 24">...</svg>';
        el.appendChild(marker);

        // 5. Event klik: untuk memilih sebagai target koneksi
        el.onclick = e => { e.stopPropagation(); onTarget(pin.id, e); };
        this.pinsEl.appendChild(el);
    });
}
```

**Penjelasan detail:**

**`this.pinsEl.innerHTML = ''`** — Menghapus SEMUA pinpoint lama. Kenapa? Karena setiap kali ada perubahan (tambah, hapus, connect), kita menggambar ulang SEMUA pinpoint dari awal. Ini disebut pendekatan "re-render".

**`forEach`** — Loop yang menjalankan fungsi untuk setiap item dalam array.

```
pins = [
    { id: 'p1', name: 'Jakarta', x: 200, y: 300 },
    { id: 'p2', name: 'Bandung', x: 350, y: 320 },
    { id: 'p3', name: 'Surabaya', x: 500, y: 310 }
]

forEach loop:
Iterasi 1: pin = { id: 'p1', name: 'Jakarta', ... }  → Gambar pinpoint Jakarta
Iterasi 2: pin = { id: 'p2', name: 'Bandung', ... }  → Gambar pinpoint Bandung
Iterasi 3: pin = { id: 'p3', name: 'Surabaya', ... } → Gambar pinpoint Surabaya
```

**`e.stopPropagation()`** — Ini SANGAT PENTING!

Bayangkan pinpoint ada DI DALAM area peta. Saat kamu klik tombol delete di pinpoint, tanpa `stopPropagation`, kliknya akan "merembet" ke area peta juga. Akibatnya, area peta menangkap klik itu dan melakukan hal lain (misalnya deselect garis).

```
TANPA stopPropagation:
   Klik tombol delete
   → onClick tombol delete (hapus pinpoint) ✅
   → onClick pinpoint (pilih sebagai target) ❌ tidak diinginkan!
   → onClick area peta (deselect garis) ❌ tidak diinginkan!

DENGAN stopPropagation:
   Klik tombol delete
   → onClick tombol delete (hapus pinpoint) ✅
   → STOP! Tidak melanjutkan ke parent. ✅
```

**Callback Pattern (`onConnect`, `onDelete`, `onTarget`):**

MapView TIDAK TAHU apa yang harus dilakukan saat tombol diklik. Dia hanya tahu cara MENGGAMBAR. Jadi, App memberi tahu MapView: "Kalau tombol connect diklik, panggil fungsi ini." Ini disebut **callback pattern**.

```
App bilang ke MapView:
"Gambar semua pinpoint ini. Kalau ada yang klik connect, panggil onConnect.
 Kalau ada yang klik delete, panggil onDelete."

MapView menggambar, dan saat ada klik:
"Eh App, user klik connect di pinpoint p1!" → App.startConn('p1')
```

### 5.9 renderLines — Menggambar Semua Garis Koneksi ⭐

```javascript
renderLines(conns, pins, TR, selectedId) {
    this.linesEl.innerHTML = '';    // Hapus semua garis lama
    conns.forEach(conn => {
        const a = pins.find(p => p.id === conn.fromId);
        const b = pins.find(p => p.id === conn.toId);
        if (!a || !b) return;      // Kalau pinpoint tidak ditemukan, skip

        const n = conn.transports.length;
        conn.transports.forEach((t, i) => {
            const off = this._offset(a, b, i, n);
            const x1 = a.x + off.x, y1 = a.y + off.y;
            const x2 = b.x + off.x, y2 = b.y + off.y;

            // Gambar garis
            const line = this._svgLine(x1, y1, x2, y2);
            line.setAttribute('stroke', TR[t.mode].color);
            line.classList.add('line-visible');
            if (selectedId === conn.id) line.classList.add('selected');
            this.linesEl.appendChild(line);

            // Gambar teks jarak
            const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            txt.setAttribute('x', (x1 + x2) / 2);    // Tengah garis
            txt.setAttribute('y', (y1 + y2) / 2 - 5); // Sedikit di atas tengah
            txt.setAttribute('text-anchor', 'middle');
            txt.setAttribute('fill', TR[t.mode].color);
            txt.textContent = t.distance;
            this.linesEl.appendChild(txt);
        });
    });
}
```

**Penjelasan alur:**

```
conns = [
    {
        id: 'c1',
        fromId: 'p1',    // Jakarta
        toId: 'p2',      // Bandung
        transports: [
            { mode: 'train', distance: 150 },   // Kereta 150km
            { mode: 'bus', distance: 160 }       // Bus 160km
        ]
    }
]

Loop pertama (conn): Untuk setiap KONEKSI antara 2 kota
   → Cari pinpoint A (Jakarta) dan B (Bandung)
   → n = 2 (ada 2 transportasi)

   Loop kedua (transport): Untuk setiap TRANSPORTASI di koneksi ini
      Iterasi 1: train, i=0
         → Hitung offset supaya garis tidak tumpang tindih
         → Gambar garis HIJAU (train color) dari Jakarta ke Bandung
         → Tulis "150" di tengah garis

      Iterasi 2: bus, i=1
         → Hitung offset (paralel di samping garis kereta)
         → Gambar garis UNGU (bus color) dari Jakarta ke Bandung
         → Tulis "160" di tengah garis
```

**Teks jarak di tengah garis:**

```javascript
txt.setAttribute('x', (x1 + x2) / 2);    // Titik tengah horizontal
txt.setAttribute('y', (y1 + y2) / 2 - 5); // Titik tengah vertikal - 5px
```

```
   A ●──────────150──────────● B
                ↑
        (x1+x2)/2, (y1+y2)/2 - 5
        Teks diletakkan di tengah garis, sedikit naik 5px
        supaya tidak menimpa garisnya
```

### 5.10 _offset — Menggeser Garis Paralel ⭐⭐ (ALGORITMA BERAT!)

```javascript
_offset(a, b, i, n) {
    if (n <= 1) return { x: 0, y: 0 };     // 1 garis? Tidak perlu offset
    const dx = b.x - a.x, dy = b.y - a.y;  // Vektor arah garis
    const len = Math.sqrt(dx * dx + dy * dy) || 1;  // Panjang garis
    const s = -(n - 1) * 3 + i * 6;        // Jarak offset
    return { x: (-dy / len) * s, y: (dx / len) * s };
}
```

**Masalah yang diselesaikan:**

Kalau Jakarta dan Bandung dihubungkan oleh kereta DAN bus, kita perlu MENGGAMBAR DUA GARIS. Tapi kalau keduanya diletakkan di posisi yang sama, mereka akan tumpang tindih dan hanya terlihat satu garis!

Solusi: Geser satu garis ke kiri dan satu ke kanan, sehingga mereka PARALEL (sejajar) tapi tidak tumpang tindih.

**Langkah 1: Vektor arah**
```javascript
const dx = b.x - a.x, dy = b.y - a.y;
```

```
Kalau A di (100, 200) dan B di (300, 250):
dx = 300 - 100 = 200  (jarak horizontal)
dy = 250 - 200 = 50   (jarak vertikal)
```

**Langkah 2: Panjang garis (Teorema Pythagoras)**
```javascript
const len = Math.sqrt(dx * dx + dy * dy) || 1;
```

```
            B (300, 250)
           /│
     len  / │ dy = 50
         /  │
        /   │
A (100,200)──┘
      dx = 200

len = √(200² + 50²) = √(40000 + 2500) = √42500 ≈ 206.2

"|| 1" → Kalau len = 0 (A dan B di posisi sama), gunakan 1 untuk menghindari pembagian nol
```

**Langkah 3: Hitung jarak offset**
```javascript
const s = -(n - 1) * 3 + i * 6;
```

Rumus ini menghitung berapa pixel garis harus digeser. Mari kita lihat pola-nya:

```
Kalau n = 2 (2 garis), rumus: -(2-1)*3 + i*6 = -3 + i*6
   i=0: s = -3 + 0 = -3   (garis pertama geser -3 pixel)
   i=1: s = -3 + 6 = +3   (garis kedua geser +3 pixel)
   
   Hasilnya: 2 garis sejajar, jarak 6 pixel

Kalau n = 3 (3 garis), rumus: -(3-1)*3 + i*6 = -6 + i*6
   i=0: s = -6 + 0  = -6  (garis 1 geser -6 pixel)
   i=1: s = -6 + 6  = 0   (garis 2 di tengah)
   i=2: s = -6 + 12 = +6  (garis 3 geser +6 pixel)
   
   Hasilnya: 3 garis sejajar, masing-masing jarak 6 pixel

Visualisasi (n=3):
   garis 1 ───────────── (off = -6)
   garis 2 ───────────── (off = 0, di tengah)
   garis 3 ───────────── (off = +6)
```

**Langkah 4: Hitung vektor tegak lurus**
```javascript
return { x: (-dy / len) * s, y: (dx / len) * s };
```

Ini adalah bagian PALING CERDAS dari fungsi ini. Kita perlu menggeser garis ke arah TEGAK LURUS dari garis itu sendiri.

```
Vektor arah garis:       (dx, dy)
Vektor tegak lurus:      (-dy, dx)  ← Ini rumus matematika standar!

Kenapa? Bayangkan panah menunjuk ke kanan-atas (dx=2, dy=1):
   Arah asli:    →↗  = (2, 1)
   Tegak lurus:  ↑←  = (-1, 2)  ← Putar 90° berlawanan jarum jam

Untuk mendapatkan vektor SATUAN (panjang = 1):
   (-dy / len, dx / len)

Lalu kalikan dengan s (jarak geser):
   (-dy / len * s,  dx / len * s)
```

**Contoh konkret lengkap:**

```
A = (100, 200), B = (300, 250), n = 2, i = 0 (garis pertama)

dx = 200, dy = 50, len = 206.2
s = -3

offset_x = (-50 / 206.2) * (-3) = 0.242 * 3 = 0.73
offset_y = (200 / 206.2) * (-3) = 0.970 * (-3) = -2.91

Garis pertama: dari (100.73, 197.09) ke (300.73, 247.09)
→ Sedikit bergeser ke atas-kanan dari garis asli

Untuk i = 1 (garis kedua), s = +3:
offset_x = (-50 / 206.2) * 3 = -0.73
offset_y = (200 / 206.2) * 3 = 2.91

Garis kedua: dari (99.27, 202.91) ke (299.27, 252.91)
→ Sedikit bergeser ke bawah-kiri dari garis asli

Hasil:
        A●───────────────────●B     (garis 1, hijau = train)
        A●───────────────────●B     (garis 2, ungu = bus)
        ↑ paralel, tidak tumpang tindih!
```

### 5.11 _svgLine — Helper Membuat Elemen SVG Line

```javascript
_svgLine(x1, y1, x2, y2) {
    const l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    l.setAttribute('x1', x1); l.setAttribute('y1', y1);
    l.setAttribute('x2', x2); l.setAttribute('y2', y2);
    return l;
}
```

**Kenapa `createElementNS` bukan `createElement`?**

SVG elemen berbeda dari HTML elemen. SVG punya namespace-nya sendiri (`http://www.w3.org/2000/svg`). Kalau pakai `createElement('line')`, browser bingung: "line apa? HTML line? SVG line?" Dengan `createElementNS`, kita bilang jelas: "Ini SVG line."

---

## 🧠 6. App.js — OTAK LOGIKA APLIKASI

Class App adalah "otak" dari seluruh aplikasi. Dia mengatur:
- Data (pinpoint dan koneksi)
- Event (klik, keyboard, scroll)
- Logika bisnis (pencarian rute)

### 6.1 Konstanta Transport

```javascript
const W = 982, H = 450; // Ukuran SVG peta dalam pixel

const TR = {
    train:    { color: '#33E339', speed: 120, cost: 500,  label: 'Train' },
    bus:      { color: '#A83BE8', speed: 80,  cost: 100,  label: 'Bus' },
    airplane: { color: '#000000', speed: 800, cost: 1000, label: 'Airplane' }
};
```

**Tabel transportasi:**

```
┌───────────┬───────────┬──────────────┬──────────────┬─────────┐
│  Mode     │  Warna    │  Kecepatan   │  Biaya       │  Label  │
│           │  Garis    │  (km/jam)    │  (Rp/km)     │         │
├───────────┼───────────┼──────────────┼──────────────┼─────────┤
│  train    │  #33E339  │  120 km/jam  │  Rp 500/km   │  Train  │
│           │  (hijau)  │              │              │         │
├───────────┼───────────┼──────────────┼──────────────┼─────────┤
│  bus      │  #A83BE8  │  80 km/jam   │  Rp 100/km   │  Bus    │
│           │  (ungu)   │              │              │         │
├───────────┼───────────┼──────────────┼──────────────┼─────────┤
│  airplane │  #000000  │  800 km/jam  │  Rp 1000/km  │ Airplane│
│           │  (hitam)  │              │              │         │
└───────────┴───────────┴──────────────┴──────────────┴─────────┘

Contoh perhitungan:
Jakarta → Bandung, jarak 150 km

Kereta:  durasi = 150 / 120 = 1.25 jam, biaya = 150 × 500 = Rp 75.000
Bus:     durasi = 150 / 80  = 1.875 jam, biaya = 150 × 100 = Rp 15.000
Pesawat: durasi = 150 / 800 = 0.1875 jam, biaya = 150 × 1000 = Rp 150.000
```

### 6.2 Constructor App

```javascript
class App {
    constructor() {
        this.pins = [];          // Array semua pinpoint
        this.conns = [];         // Array semua koneksi
        this.connFrom = null;    // ID pinpoint sumber (mode connecting)
        this.connTo = null;      // ID pinpoint tujuan
        this.selLine = null;     // ID garis yang sedang dipilih
        this.sortMode = 'fastest';
        this.routes = [];        // Hasil pencarian rute
        this.clickPos = { x: 0, y: 0 }; // Posisi klik terakhir (untuk popup)

        // Simpan referensi ke elemen DOM
        this.d = {
            popupAdd:  document.getElementById('popup-add'),
            popupConn: document.getElementById('popup-connect'),
            name:      document.getElementById('input-name'),
            dist:      document.getElementById('input-distance'),
            mode:      document.getElementById('input-mode'),
            from:      document.getElementById('input-from'),
            to:        document.getElementById('input-to'),
            search:    document.getElementById('btn-search'),
            sortCtrl:  document.getElementById('sort-controls'),
            results:   document.getElementById('route-results')
        };

        // Buat instance MapView
        this.map = new MapView(
            document.getElementById('map-area'),
            document.getElementById('map-container'),
            document.getElementById('lines-layer'),
            document.getElementById('pinpoints-layer')
        );

        this.load();              // 1. Muat data dari localStorage
        this.map.fitToScreen(W, H); // 2. Sesuaikan zoom dengan layar
        this.render();            // 3. Gambar semua yang ada
        this.events();            // 4. Pasang event listener
    }
```

**Struktur data `pins` dan `conns`:**

```javascript
// pins (Array of object):
this.pins = [
    { id: 'p1682345678', name: 'Jakarta',  x: 200.5, y: 300.2 },
    { id: 'p1682345679', name: 'Bandung',  x: 350.1, y: 320.8 },
    { id: 'p1682345680', name: 'Surabaya', x: 500.3, y: 310.5 }
];

// conns (Array of object):
this.conns = [
    {
        id: 'c1682345700',
        fromId: 'p1682345678',      // Jakarta
        toId: 'p1682345679',        // Bandung
        transports: [
            { mode: 'train', distance: 150 },
            { mode: 'bus',   distance: 160 }
        ]
    },
    {
        id: 'c1682345701',
        fromId: 'p1682345679',      // Bandung
        toId: 'p1682345680',        // Surabaya
        transports: [
            { mode: 'airplane', distance: 600 }
        ]
    }
];
```

**ID menggunakan timestamp:**

```javascript
'p' + Date.now()  // contoh: 'p1682345678901'
'c' + Date.now()  // contoh: 'c1682345678902'
```

`Date.now()` mengembalikan jumlah milidetik sejak 1 Januari 1970. Setiap milidetik berbeda, jadi ID selalu unik. Huruf 'p' (pinpoint) dan 'c' (connection) membantu membedakan jenis ID.

### 6.3 save() dan load() — Penyimpanan Data

```javascript
save() {
    localStorage.setItem('pins', JSON.stringify(this.pins));
    localStorage.setItem('conns', JSON.stringify(this.conns));
}

load() {
    this.pins = JSON.parse(localStorage.getItem('pins') || '[]');
    this.conns = JSON.parse(localStorage.getItem('conns') || '[]');
}
```

**Apa itu localStorage?**

`localStorage` adalah "gudang penyimpanan" di browser. Data disimpan bahkan setelah browser ditutup!

```
SAVE:
   this.pins (JavaScript object) 
   → JSON.stringify → '[ {"id":"p1","name":"Jakarta"} ]' (string)
   → localStorage.setItem('pins', ...) → Disimpan di browser

LOAD:
   localStorage.getItem('pins') → '[ {"id":"p1","name":"Jakarta"} ]' (string)
   → JSON.parse → [{ id: 'p1', name: 'Jakarta' }] (JavaScript object)
   → this.pins

"|| '[]'" → Kalau belum pernah disimpan (null), gunakan array kosong '[]'
```

### 6.4 render() — Menggambar Ulang Semuanya

```javascript
render() {
    this.map.renderPins(this.pins, {
        connectingId: this.connFrom,
        onConnect: id => this.startConn(id),
        onDelete: id => this.delPin(id),
        onTarget: (id, e) => {
            if (this.connFrom && this.connFrom !== id) {
                this.connTo = id;
                this.popup(this.d.popupConn, e);
                this.d.dist.value = ''; this.d.mode.value = '';
                this.d.dist.focus();
            }
        }
    });
    this.map.renderLines(this.conns, this.pins, TR, this.selLine);
    this.map.applyTransform(W, H);
}
```

**Kapan render() dipanggil?**

Setiap kali ada PERUBAHAN yang mempengaruhi tampilan:
- Tambah pinpoint → render()
- Hapus pinpoint → render()
- Start connecting → render()
- Cancel connecting → render()
- Submit koneksi → render()
- Pilih garis → render()
- Hapus garis → render()

**Callback `onTarget` yang paling rumit:**

```javascript
onTarget: (id, e) => {
    if (this.connFrom && this.connFrom !== id) {
        // Dipanggil saat user KLIK pinpoint SAAT mode connecting aktif
        // DAN pinpoint yang diklik BUKAN pinpoint sumber
        
        this.connTo = id;                    // Set tujuan
        this.popup(this.d.popupConn, e);     // Tampilkan popup koneksi
        this.d.dist.value = '';              // Kosongkan input jarak
        this.d.mode.value = '';              // Kosongkan pilihan transport
        this.d.dist.focus();                 // Fokus ke input jarak
    }
}
```

```
Alur connecting:

1. Klik tombol ⚡ di Jakarta  → startConn('p1')  → connFrom = 'p1'
   Jakarta mulai bersinar (glow) ✨

2. Klik pinpoint Bandung       → onTarget('p2', event)
   Cek: connFrom ('p1') ada? ✅  connFrom !== 'p2'? ✅
   → connTo = 'p2'
   → Tampilkan popup koneksi

3. Isi jarak (150) + pilih transport (train) → submitConn(150, 'train')
   → Buat koneksi Jakarta ↔ Bandung via kereta 150km
```

### 6.5 addPin — Tambah Pinpoint

```javascript
addPin(name, x, y) {
    this.pins.push({ id: 'p' + Date.now(), name, x, y });
    this.save(); this.render(); this.checkSearch();
}
```

Singkat tapi penting. `push` menambahkan objek baru ke akhir array `pins`. Lalu data disimpan, tampilan digambar ulang, dan tombol search dicek ulang.

### 6.6 delPin — Hapus Pinpoint

```javascript
delPin(id) {
    this.pins = this.pins.filter(p => p.id !== id);
    this.conns = this.conns.filter(c => c.fromId !== id && c.toId !== id);
    this.save(); this.render(); this.checkSearch();
}
```

**`filter` — Menyaring array:**

```javascript
// filter membuat array BARU yang hanya berisi elemen yang lolos kondisi

// Hapus pinpoint 'p2' (Bandung)
this.pins.filter(p => p.id !== 'p2')
// "Ambil semua pinpoint yang ID-nya BUKAN 'p2'"
// Hasilnya: [Jakarta, Surabaya] ← Bandung dihapus

// Hapus koneksi yang terhubung ke 'p2'
this.conns.filter(c => c.fromId !== 'p2' && c.toId !== 'p2')
// "Ambil semua koneksi yang BUKAN dari p2 DAN BUKAN ke p2"
// Koneksi Jakarta↔Bandung → fromId='p1', toId='p2' → toId==='p2' → DIHAPUS
// Koneksi Bandung↔Surabaya → fromId='p2' → DIHAPUS
// Hasilnya: semua koneksi ke/dari Bandung dihapus
```

**Kenapa koneksi juga dihapus?**

Kalau pinpoint dihapus tapi koneksinya masih ada, nanti garis akan menghubungkan ke "hantu" (pinpoint yang sudah tidak ada). Jadi koneksi yang berhubungan juga harus ikut dihapus.

### 6.7 Koneksi: startConn, cancelConn, submitConn

```javascript
startConn(id) {
    if (this.connFrom === id) { this.cancelConn(); return; }
    this.connFrom = id;
    this.render();
}

cancelConn() {
    this.connFrom = null; this.connTo = null;
    this.render();
}
```

**`startConn` — Toggle connecting mode:**

```
Klik ⚡ di Jakarta (pertama kali):
   connFrom === 'p1'? Belum, connFrom masih null → SET connFrom = 'p1'
   Jakarta bersinar ✨

Klik ⚡ di Jakarta (kedua kali):
   connFrom === 'p1'? YA! → cancelConn() → Matikan mode connecting
   Jakarta berhenti bersinar
```

```javascript
submitConn(distance, mode) {
    // 1. Cari koneksi yang sudah ada antara 2 pinpoint ini
    let c = this.conns.find(c =>
        (c.fromId === this.connFrom && c.toId === this.connTo) ||
        (c.fromId === this.connTo && c.toId === this.connFrom)
    );
    
    // 2A. Kalau koneksi sudah ada → tambahkan transport baru
    if (c) {
        if (c.transports.find(t => t.mode === mode)) {
            alert(mode + ' sudah ada!');
            return;
        }
        c.transports.push({ mode, distance });
    }
    // 2B. Kalau belum ada → buat koneksi baru
    else {
        this.conns.push({
            id: 'c' + Date.now(),
            fromId: this.connFrom,
            toId: this.connTo,
            transports: [{ mode, distance }]
        });
    }
    
    // 3. Tutup popup, reset mode, simpan, render
    this.hide(this.d.popupConn);
    this.cancelConn();
    this.save();
    this.render();
}
```

**Alur logika detail:**

```
Skenario 1: Jakarta dan Bandung BELUM terhubung
   → find() tidak menemukan apa-apa (c = undefined)
   → Masuk ke else → Push koneksi baru
   → Hasilnya: { fromId: 'p1', toId: 'p2', transports: [{ mode: 'train', distance: 150 }] }

Skenario 2: Jakarta dan Bandung SUDAH terhubung via kereta, user tambah bus
   → find() menemukan koneksi yang ada (c = koneksi JKT↔BDG)
   → Cek: ada bus di transports? BELUM → Push { mode: 'bus', distance: 160 }
   → Hasilnya: transports = [{ train, 150 }, { bus, 160 }] ← 2 transportasi!

Skenario 3: Jakarta dan Bandung SUDAH terhubung via kereta, user coba tambah kereta lagi
   → find() menemukan koneksi
   → Cek: ada train? ADA! → alert('train sudah ada!') → return (batal)
```

**Perhatikan pengecekan dua arah:**

```javascript
(c.fromId === this.connFrom && c.toId === this.connTo) ||
(c.fromId === this.connTo && c.toId === this.connFrom)
```

Koneksi Jakarta→Bandung dan Bandung→Jakarta itu SAMA. Jadi kita cek kedua arah.

### 6.8 clickedLine — Deteksi Klik pada Garis ⭐⭐ (ALGORITMA GEOMETRI!)

```javascript
clickedLine(e) {
    const pos = this.map.screenToMap(e.clientX, e.clientY);
    const thr = 8 / this.map.scale;    // Threshold disesuaikan dengan zoom
    
    for (const c of this.conns) {
        const a = this.pins.find(p => p.id === c.fromId);
        const b = this.pins.find(p => p.id === c.toId);
        if (!a || !b) continue;
        
        const dx = b.x - a.x, dy = b.y - a.y;
        const lSq = dx * dx + dy * dy;
        if (lSq === 0) continue;
        
        const t = Math.max(0, Math.min(1,
            ((pos.x - a.x) * dx + (pos.y - a.y) * dy) / lSq
        ));
        
        if (Math.sqrt((pos.x - a.x - t * dx) ** 2 + (pos.y - a.y - t * dy) ** 2) < thr)
            return c.id;
    }
    return null;
}
```

**Ini adalah algoritma "JARAK TITIK KE SEGMEN GARIS" (Point-to-Line-Segment Distance).**

Mari kita bongkar SELURUH matematikanya!

**Langkah 1: Konversi posisi klik ke koordinat peta**
```javascript
const pos = this.map.screenToMap(e.clientX, e.clientY);
```

**Langkah 2: Tentukan threshold (batas toleransi)**
```javascript
const thr = 8 / this.map.scale;
```

```
Kalau scale = 1.0 → threshold = 8 pixel (normal)
Kalau scale = 2.0 → threshold = 4 pixel (zoom in, lebih presisi)
Kalau scale = 0.5 → threshold = 16 pixel (zoom out, lebih toleran)

Kenapa? Saat zoom in, garis terlihat lebih besar, jadi threshold perlu lebih kecil.
Saat zoom out, garis sangat kecil, jadi threshold perlu lebih besar agar mudah diklik.
```

**Langkah 3: Loop setiap koneksi**

Untuk setiap koneksi, kita hitung: "Seberapa dekat titik klik ke garis ini?"

**Langkah 4: Vektor dan panjang kuadrat**
```javascript
const dx = b.x - a.x, dy = b.y - a.y;
const lSq = dx * dx + dy * dy;    // Panjang kuadrat (tanpa sqrt, lebih efisien)
```

**Langkah 5: Proyeksi titik ke garis (INTI ALGORITMA!)**
```javascript
const t = Math.max(0, Math.min(1,
    ((pos.x - a.x) * dx + (pos.y - a.y) * dy) / lSq
));
```

`t` adalah **parameter proyeksi**. Ini menunjukkan di mana titik terdekat pada garis berada.

```
t = 0.0 → Titik terdekat ada di ujung A
t = 0.5 → Titik terdekat ada di tengah garis (antara A dan B)
t = 1.0 → Titik terdekat ada di ujung B

Visualisasi:
    A ●───────────●───────────● B
   t=0          t=0.5         t=1

Kalau user klik di titik P:

Kasus 1: P ada di atas tengah garis
A ●──────────────────● B
              ↑
              P (klik)    t ≈ 0.5, jarak kecil → TERDETEKSI

Kasus 2: P jauh dari garis
A ●──────────────────● B

         P (klik)         t ≈ 0.3, jarak besar → TIDAK terdeteksi

Kasus 3: P di luar segmen
              A ●──────● B
P (klik) 
↑ t < 0, di-clamp ke 0    → cek jarak ke titik A
```

**Rumus matematika di balik `t`:**

```
Ini adalah DOT PRODUCT (perkalian titik) dua vektor:

AP = (pos.x - a.x, pos.y - a.y)   ← vektor dari A ke titik klik P
AB = (dx, dy)                       ← vektor dari A ke B

t = (AP · AB) / (AB · AB)
  = ((pos.x - a.x) * dx + (pos.y - a.y) * dy) / (dx*dx + dy*dy)

Dot product memberi tahu kita "seberapa searah" dua vektor.
Hasilnya dinormalisasi oleh panjang AB kuadrat sehingga t berada di range [0, 1].

Math.max(0, Math.min(1, t)) → Membatasi t antara 0 dan 1
(supaya tidak keluar dari segmen garis)
```

**Langkah 6: Hitung jarak titik klik ke titik terdekat pada garis**
```javascript
Math.sqrt((pos.x - a.x - t * dx) ** 2 + (pos.y - a.y - t * dy) ** 2)
```

```
Titik terdekat pada garis: Q = (a.x + t * dx,  a.y + t * dy)

Jarak PQ = √((pos.x - Q.x)² + (pos.y - Q.y)²)
         = √((pos.x - a.x - t*dx)² + (pos.y - a.y - t*dy)²)

Kalau jarak < threshold → User mengklik garis ini! Return ID-nya.
```

**Contoh konkret:**

```
A = (100, 200), B = (300, 200)  ← Garis horizontal
User klik P = (200, 205)        ← Sedikit di bawah tengah garis

dx = 200, dy = 0, lSq = 40000

t = ((200-100)*200 + (205-200)*0) / 40000
  = (100*200 + 5*0) / 40000
  = 20000 / 40000
  = 0.5  (tepat di tengah garis)

Titik terdekat Q = (100 + 0.5*200, 200 + 0.5*0) = (200, 200)

Jarak = √((200-200)² + (205-200)²) = √(0 + 25) = 5

Threshold = 8 (misalnya)
5 < 8 → TRUE → Garis ini yang diklik!
```

### 6.9 Pencarian Rute — DFS + Kombinasi ⭐⭐⭐ (ALGORITMA TERPENTING!)

Ini adalah bagian PALING KOMPLEKS dari seluruh aplikasi.

#### 6.9.1 checkSearch — Validasi Input

```javascript
checkSearch() {
    const f = this.d.from.value.trim(), t = this.d.to.value.trim();
    this.d.search.disabled = !(
        f !== t &&
        this.pins.some(p => p.name === f) &&
        this.pins.some(p => p.name === t)
    );
}
```

**Tombol Search HANYA bisa diklik jika:**
1. Nama asal ≠ nama tujuan (`f !== t`)
2. Ada pinpoint dengan nama sesuai input "From"
3. Ada pinpoint dengan nama sesuai input "To"

```
Contoh:
From = "Jakarta", To = "Bandung"
→ f !== t? ✅ ("Jakarta" ≠ "Bandung")
→ Ada pinpoint "Jakarta"? ✅
→ Ada pinpoint "Bandung"? ✅
→ disabled = !(true && true && true) = !true = false → Tombol AKTIF!

From = "Jakarta", To = "Jakarta"
→ f !== t? ❌ ("Jakarta" = "Jakarta")
→ disabled = !(false && ...) = !false = true → Tombol DISABLED

From = "Jakarta", To = "Mars"
→ Ada pinpoint "Mars"? ❌
→ disabled = !(... && false) = !false = true → Tombol DISABLED
```

#### 6.9.2 search — Fungsi Utama Pencarian Rute ⭐⭐⭐

```javascript
search() {
    const from = this.pins.find(p => p.name === this.d.from.value.trim());
    const to = this.pins.find(p => p.name === this.d.to.value.trim());
    if (!from || !to) return;

    // === FASE 1: DFS — Cari semua JALUR yang mungkin ===
    const paths = [], visited = new Set([from.id]);
    
    const dfs = (cur, path) => {
        if (cur === to.id) { paths.push([...path]); return; }
        
        for (const c of this.conns) {
            const nid = c.fromId === cur ? c.toId : c.toId === cur ? c.fromId : null;
            if (nid && !visited.has(nid)) {
                visited.add(nid);
                path.push({ from: cur, to: nid, conn: c });
                dfs(nid, path);
                path.pop(); visited.delete(nid);
            }
        }
    };
    dfs(from.id, []);

    // === FASE 2: Kombinasi — Untuk setiap jalur, coba semua kombinasi transport ===
    this.routes = [];
    
    const combo = (path, i, cur) => {
        if (i === path.length) {
            let dur = 0, cost = 0;
            const steps = cur.map(s => {
                const cfg = TR[s.mode];
                dur += s.dist / cfg.speed;
                cost += s.dist * cfg.cost;
                return {
                    from: this.pins.find(p => p.id === s.from).name,
                    to: this.pins.find(p => p.id === s.to).name,
                    label: cfg.label
                };
            });
            this.routes.push({
                name: steps[0].from + ' - ' + steps[steps.length - 1].to,
                steps, dur, cost
            });
            return;
        }
        for (const t of path[i].conn.transports)
            combo(path, i + 1, [...cur, { from: path[i].from, to: path[i].to, mode: t.mode, dist: t.distance }]);
    };
    paths.forEach(p => combo(p, 0, []));

    this.d.sortCtrl.classList.remove('hidden');
    this.display();
}
```

Ini sangat kompleks, jadi mari kita pecah menjadi dua fase.

---

### 🔍 FASE 1: DFS (Depth-First Search) — Mencari Semua Jalur

**Apa itu DFS?**

DFS adalah cara "menjelajahi" graf (jaringan) dengan prinsip: **jalan sedalam mungkin dulu, baru balik dan coba jalur lain.**

Bayangkan kamu mencari jalan keluar labirin. DFS itu seperti: kamu terus jalan lurus, kalau mentok belok, kalau mentok lagi mundur dan coba arah lain.

**Contoh graf (peta):**

```
         Jakarta
        /       \
     Bandung   Semarang
        \       /
        Surabaya
```

**Mencari rute Jakarta → Surabaya:**

```
DFS dimulai dari Jakarta (visited = {Jakarta})

1. Coba ke Bandung (belum dikunjungi)
   visited = {Jakarta, Bandung}
   path = [{Jakarta→Bandung}]
   
   1.1 Dari Bandung, coba ke Surabaya (belum dikunjungi)
       visited = {Jakarta, Bandung, Surabaya}
       path = [{Jakarta→Bandung}, {Bandung→Surabaya}]
       
       cur === to.id? YA! → SIMPAN jalur ini ✅
       paths = [  [{Jakarta→Bandung}, {Bandung→Surabaya}]  ]
       
       BACKTRACK: hapus Surabaya dari visited, pop path
       visited = {Jakarta, Bandung}
       path = [{Jakarta→Bandung}]
   
   BACKTRACK: hapus Bandung dari visited, pop path
   visited = {Jakarta}
   path = []

2. Coba ke Semarang (belum dikunjungi)
   visited = {Jakarta, Semarang}
   path = [{Jakarta→Semarang}]
   
   2.1 Dari Semarang, coba ke Surabaya (belum dikunjungi)
       visited = {Jakarta, Semarang, Surabaya}
       path = [{Jakarta→Semarang}, {Semarang→Surabaya}]
       
       cur === to.id? YA! → SIMPAN jalur ini ✅
       paths = [
           [{Jakarta→Bandung}, {Bandung→Surabaya}],
           [{Jakarta→Semarang}, {Semarang→Surabaya}]
       ]
       
       BACKTRACK...

HASIL: 2 jalur ditemukan!
   Jalur 1: Jakarta → Bandung → Surabaya
   Jalur 2: Jakarta → Semarang → Surabaya
```

**Penjelasan kode baris per baris:**

```javascript
const paths = [], visited = new Set([from.id]);
```

- `paths` = Array untuk menyimpan semua jalur yang ditemukan
- `visited` = Set (kumpulan unik) berisi ID pinpoint yang sudah dikunjungi
- Set dimulai dengan from.id (kota asal sudah "dikunjungi")

**Kenapa pakai Set bukan Array?**

Set lebih cepat untuk operasi `has()` (mencari apakah elemen ada). O(1) vs O(n) untuk array.

```javascript
const dfs = (cur, path) => {
    // Base case: sudah sampai tujuan!
    if (cur === to.id) { paths.push([...path]); return; }
```

- `cur` = ID pinpoint saat ini
- `path` = Jalur yang sudah dilalui sejauh ini
- Kalau `cur` sudah = tujuan, simpan salinan jalur ke `paths`
- `[...path]` = spread operator, membuat SALINAN array (bukan referensi)

**Kenapa perlu salinan?** Karena setelah return, kita akan `path.pop()` yang mengubah array asli. Tanpa salinan, data yang disimpan di `paths` juga ikut berubah!

```javascript
    for (const c of this.conns) {
        const nid = c.fromId === cur ? c.toId : c.toId === cur ? c.fromId : null;
```

Loop setiap koneksi dan lihat apakah koneksi ini berhubungan dengan pinpoint saat ini.

```
Ternary bersarang (nested ternary):

c.fromId === cur ? c.toId        ← Koneksi DARI cur → tetangganya adalah toId
: c.toId === cur ? c.fromId      ← Koneksi KE cur → tetangganya adalah fromId
: null                            ← Tidak berhubungan → null

Contoh: cur = 'p1' (Jakarta)
Koneksi: { fromId: 'p1', toId: 'p2' }
→ fromId === cur? YA → nid = 'p2' (Bandung)

Koneksi: { fromId: 'p3', toId: 'p1' }
→ fromId === cur? TIDAK → toId === cur? YA → nid = 'p3'

Koneksi: { fromId: 'p4', toId: 'p5' }
→ fromId === cur? TIDAK → toId === cur? TIDAK → nid = null (bukan tetangga)
```

```javascript
        if (nid && !visited.has(nid)) {
            visited.add(nid);       // Tandai sebagai "sudah dikunjungi"
            path.push({ from: cur, to: nid, conn: c });  // Catat langkah
            dfs(nid, path);         // REKURSI: lanjut ke tetangga
            path.pop();             // BACKTRACK: hapus langkah terakhir
            visited.delete(nid);    // BACKTRACK: tandai "belum dikunjungi"
        }
```

**Kenapa perlu `!visited.has(nid)`?**

Untuk mencegah LOOP TANPA AKHIR! Bayangkan:
```
Jakarta → Bandung → Jakarta → Bandung → Jakarta → ...
```

Tanpa visited check, DFS akan berputar-putar selamanya.

**Kenapa perlu backtrack (pop dan delete)?**

Karena kita mencari SEMUA jalur, bukan cuma satu. Setelah menemukan satu jalur, kita harus "mundur" dan mencoba jalur lain.

```
Tanpa backtrack:
   Jakarta → Bandung → Surabaya ✅ (jalur 1 ditemukan)
   visited = {Jakarta, Bandung, Surabaya}
   
   Mau coba Jakarta → Semarang → Surabaya?
   Surabaya sudah di visited! → GAGAL ❌

Dengan backtrack:
   Jakarta → Bandung → Surabaya ✅ (jalur 1 ditemukan)
   BACKTRACK → visited = {Jakarta, Bandung}
   BACKTRACK → visited = {Jakarta}
   
   Jakarta → Semarang → Surabaya ✅ (jalur 2 ditemukan)
```

---

### 🔄 FASE 2: Kombinasi Transport — Recursive Combination Generator

Setelah mendapatkan semua JALUR, sekarang kita perlu membuat semua KOMBINASI transportasi untuk setiap jalur.

**Contoh masalah:**

```
Jalur: Jakarta → Bandung → Surabaya

Koneksi Jakarta↔Bandung punya: train (150km), bus (160km)
Koneksi Bandung↔Surabaya punya: train (300km), airplane (280km)

Kombinasi yang mungkin:
1. Jakarta →[train]→ Bandung →[train]→ Surabaya
2. Jakarta →[train]→ Bandung →[airplane]→ Surabaya
3. Jakarta →[bus]→ Bandung →[train]→ Surabaya
4. Jakarta →[bus]→ Bandung →[airplane]→ Surabaya

Total: 2 × 2 = 4 kombinasi
```

**Kode dan visualisasi:**

```javascript
const combo = (path, i, cur) => {
    // BASE CASE: Semua langkah sudah dipilih transportnya
    if (i === path.length) {
        // Hitung durasi dan biaya
        let dur = 0, cost = 0;
        const steps = cur.map(s => {
            const cfg = TR[s.mode];
            dur += s.dist / cfg.speed;    // Durasi = jarak / kecepatan
            cost += s.dist * cfg.cost;     // Biaya = jarak × biaya per km
            return { from: ..., to: ..., label: cfg.label };
        });
        
        // Simpan rute
        this.routes.push({ name: ..., steps, dur, cost });
        return;
    }
    
    // RECURSIVE CASE: Untuk langkah ke-i, coba SETIAP transportasi
    for (const t of path[i].conn.transports)
        combo(path, i + 1, [...cur, { 
            from: path[i].from, to: path[i].to, 
            mode: t.mode, dist: t.distance 
        }]);
};
```

**Visualisasi pohon rekursi:**

```
combo(path, 0, [])  ← Mulai dari langkah 0 dengan array kosong
│
├── transport = train (Jakarta→Bandung, 150km)
│   combo(path, 1, [{train, 150}])  ← Langkah 1
│   │
│   ├── transport = train (Bandung→Surabaya, 300km)
│   │   combo(path, 2, [{train,150}, {train,300}])
│   │   i === path.length → SIMPAN RUTE! ✅
│   │   durasi = 150/120 + 300/120 = 1.25 + 2.5 = 3.75 jam
│   │   biaya = 150×500 + 300×500 = 75000 + 150000 = Rp225.000
│   │
│   └── transport = airplane (Bandung→Surabaya, 280km)
│       combo(path, 2, [{train,150}, {airplane,280}])
│       i === path.length → SIMPAN RUTE! ✅
│       durasi = 150/120 + 280/800 = 1.25 + 0.35 = 1.6 jam
│       biaya = 150×500 + 280×1000 = 75000 + 280000 = Rp355.000
│
└── transport = bus (Jakarta→Bandung, 160km)
    combo(path, 1, [{bus, 160}])  ← Langkah 1
    │
    ├── transport = train (Bandung→Surabaya, 300km)
    │   combo(path, 2, [{bus,160}, {train,300}])
    │   i === path.length → SIMPAN RUTE! ✅
    │   durasi = 160/80 + 300/120 = 2.0 + 2.5 = 4.5 jam
    │   biaya = 160×100 + 300×500 = 16000 + 150000 = Rp166.000
    │
    └── transport = airplane (Bandung→Surabaya, 280km)
        combo(path, 2, [{bus,160}, {airplane,280}])
        i === path.length → SIMPAN RUTE! ✅
        durasi = 160/80 + 280/800 = 2.0 + 0.35 = 2.35 jam
        biaya = 160×100 + 280×1000 = 16000 + 280000 = Rp296.000
```

**Rumus perhitungan:**

```
DURASI (jam):
   durasi = jarak (km) / kecepatan (km/jam)
   
   Contoh: 150 km naik kereta (120 km/jam)
   durasi = 150 / 120 = 1.25 jam = 1 jam 15 menit

BIAYA (Rupiah):
   biaya = jarak (km) × tarif (Rp/km)
   
   Contoh: 150 km naik kereta (Rp 500/km)
   biaya = 150 × 500 = Rp 75.000
```

### 6.10 display — Menampilkan Hasil Pencarian

```javascript
display() {
    const sorted = [...this.routes]
        .sort((a, b) => this.sortMode === 'fastest' ? a.dur - b.dur : a.cost - b.cost)
        .slice(0, 10);
    
    this.d.results.innerHTML = sorted.length === 0 
        ? '<p style="color:#999">No routes found</p>'
        : sorted.map(r => `...HTML card...`).join('');
}
```

**`.sort()` — Mengurutkan array:**

```javascript
.sort((a, b) => a.dur - b.dur)  // Urutkan dari durasi TERKECIL
```

```
Cara kerja sort:
   Kalau a.dur - b.dur < 0  → a ditaruh SEBELUM b (a lebih cepat)
   Kalau a.dur - b.dur > 0  → a ditaruh SETELAH b (a lebih lambat)
   Kalau a.dur - b.dur = 0  → Tidak diubah

Contoh:
   Rute 1: dur = 3.75
   Rute 2: dur = 1.6
   Rute 3: dur = 4.5
   Rute 4: dur = 2.35

   Sorted (fastest): [1.6, 2.35, 3.75, 4.5]
   → Rute 2, Rute 4, Rute 1, Rute 3
```

**`.slice(0, 10)` — Ambil maksimal 10 hasil:**

Supaya panel tidak terlalu panjang, hanya 10 rute terbaik yang ditampilkan.

### 6.11 _dur — Format Durasi

```javascript
_dur(h) {
    const hr = Math.floor(h);                    // Bagian jam (bulatkan ke bawah)
    const m = Math.round((h - hr) * 60);         // Sisa menit
    return hr ? (m ? hr + 'h ' + m + 'min' : hr + 'h') : m + 'min';
}
```

**Contoh perhitungan:**

```
h = 2.75 (2.75 jam)
hr = Math.floor(2.75) = 2
m  = Math.round((2.75 - 2) * 60) = Math.round(0.75 * 60) = Math.round(45) = 45
Output: "2h 45min"

h = 3.0 (3 jam tepat)
hr = 3
m  = Math.round(0 * 60) = 0
Output: "3h" (tanpa menit karena m = 0)

h = 0.25 (15 menit)
hr = 0
m  = Math.round(0.25 * 60) = 15
Output: "15min" (tanpa jam karena hr = 0)
```

**Ternary bersarang:**

```
hr ? (m ? hr + 'h ' + m + 'min' : hr + 'h') : m + 'min'

Dibaca:
IF hr tidak nol (ada jam)?
    YES → IF m tidak nol (ada menit)?
              YES → "2h 45min"
              NO  → "3h"
    NO  → "15min"
```

### 6.12 popup & hide — Menampilkan/Menyembunyikan Popup

```javascript
popup(el, e) {
    el.style.left = (e.clientX + 10) + 'px';  // Posisi cursor + 10px ke kanan
    el.style.top = (e.clientY - 10) + 'px';   // Posisi cursor - 10px ke atas
    el.classList.remove('hidden');              // Menampilkan popup
}

hide(el) {
    el.classList.add('hidden');                 // Menyembunyikan popup
}
```

Popup muncul DI DEKAT posisi klik kursor (10px ke kanan, 10px ke atas dari titik klik).

### 6.13 events — Memasang SEMUA Event Listener ⭐

```javascript
events() {
    const area = this.map.area;
```

Mari kita bahas SETIAP event satu per satu:

#### Event 1: Zoom dengan CTRL + Scroll

```javascript
area.addEventListener('wheel', e => {
    if (!e.ctrlKey) return;     // Hanya zoom kalau CTRL ditekan
    e.preventDefault();          // Cegah browser zoom (default behavior)
    this.map.zoomAt(e.clientX, e.clientY, e.deltaY < 0 ? 1.15 : 0.85, W, H);
}, { passive: false });
```

```
e.deltaY < 0 → Scroll KE ATAS   → Zoom IN  (factor = 1.15, perbesar 15%)
e.deltaY > 0 → Scroll KE BAWAH  → Zoom OUT (factor = 0.85, perkecil 15%)

{ passive: false } → Memberitahu browser bahwa kita MUNGKIN akan memanggil
                      preventDefault(). Tanpa ini, beberapa browser mengabaikan
                      preventDefault() untuk performa.
```

#### Event 2: Zoom dengan CTRL + Plus/Minus

```javascript
document.addEventListener('keydown', e => {
    if (!e.ctrlKey) return;
    if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        this.map.zoomCenter(1.15, W, H);
    }
    if (e.key === '-') {
        e.preventDefault();
        this.map.zoomCenter(0.85, W, H);
    }
});
```

```
CTRL + '+' atau CTRL + '=' → Zoom in dari tengah layar
CTRL + '-'                  → Zoom out dari tengah layar

Kenapa '=' juga dicek? Karena pada keyboard, tombol + biasanya ada di tombol
yang sama dengan =. Jadi tanpa Shift, yang terdeteksi adalah '='.
```

#### Event 3: Pan (Geser Peta)

```javascript
area.addEventListener('mousedown', e => {
    if (e.target.closest('.pinpoint,.popup') || e.button !== 0) return;
    this.map.startDrag(e);
});
document.addEventListener('mousemove', e => this.map.moveDrag(e, W, H));
document.addEventListener('mouseup', () => this.map.stopDrag());
```

**`e.target.closest('.pinpoint,.popup')`:**

Cek apakah yang diklik adalah bagian dari pinpoint atau popup. Kalau ya, JANGAN mulai drag (karena klik itu ditujukan untuk pinpoint/popup, bukan untuk menggeser peta).

**`e.button !== 0`:**

`e.button` menunjukkan tombol mouse mana yang ditekan:
- 0 = Klik kiri (tombol utama)
- 1 = Klik tengah (scroll wheel)
- 2 = Klik kanan

Kita hanya mulai drag saat klik KIRI.

**Kenapa `mousemove` dan `mouseup` di `document`, bukan di `area`?**

Karena saat drag, mouse bisa keluar dari area peta! Kalau listener di `area` saja, begitu mouse keluar dari area, drag berhenti tiba-tiba.

```
LISTENER DI AREA SAJA:              LISTENER DI DOCUMENT:
                                     
┌──────────────┐                     ┌──────────────┐
│   MAP AREA   │                     │   MAP AREA   │
│    drag ok   │                     │    drag ok   │
│    ←→↑↓      │                     │    ←→↑↓      │
│              │─ mouse keluar       │              │─ mouse keluar
└──────────────┘  drag BERHENTI ❌   └──────────────┘  drag TETAP ✅
```

#### Event 4: Double-Click untuk Tambah Pinpoint

```javascript
area.addEventListener('dblclick', e => {
    if (e.target.closest('.pinpoint,.popup,#route-panel')) return;
    this.clickPos = this.map.screenToMap(e.clientX, e.clientY);
    this.popup(this.d.popupAdd, e);
    this.d.name.value = ''; this.d.name.focus();
});
```

```
1. Double-click di peta (bukan di pinpoint/popup/panel)
2. Konversi posisi klik ke koordinat peta → simpan di this.clickPos
3. Tampilkan popup "Add pinpoint" di dekat posisi klik
4. Kosongkan input nama & fokus cursor ke sana
```

#### Event 5: Form Submit — Add Pinpoint

```javascript
document.getElementById('form-add').onsubmit = e => {
    e.preventDefault();    // Cegah halaman refresh (default form behavior)
    const n = this.d.name.value.trim();
    if (!n) return;        // Nama tidak boleh kosong
    this.addPin(n, this.clickPos.x, this.clickPos.y);
    this.hide(this.d.popupAdd);
};
```

**`e.preventDefault()`** — Tanpa ini, form akan melakukan "submit" ke server (behavior default HTML), yang menyebabkan halaman refresh. Kita tidak mau itu — kita handle sendiri di JavaScript.

#### Event 6: Form Submit — Connect

```javascript
document.getElementById('form-connect').onsubmit = e => {
    e.preventDefault();
    const dist = parseInt(this.d.dist.value), mode = this.d.mode.value;
    if (dist && mode) this.submitConn(dist, mode);
};
```

**`parseInt()`** — Mengubah string "150" menjadi number 150.

**`if (dist && mode)`** — Dua-duanya harus ada. `dist` harus bukan 0/NaN, `mode` harus bukan string kosong.

#### Event 7: Close Popup

```javascript
document.getElementById('close-add').onclick = () => this.hide(this.d.popupAdd);
document.getElementById('close-connect').onclick = () => {
    this.hide(this.d.popupConn);
    this.cancelConn();     // Juga cancel mode connecting
};
```

#### Event 8: Delete Line & Escape

```javascript
document.addEventListener('keydown', e => {
    if ((e.key === 'Delete' || e.key === 'Backspace') && this.selLine 
        && !e.target.matches('input,select,textarea')) {
        e.preventDefault();
        this.delLine();
    }
    if (e.key === 'Escape') {
        this.hide(this.d.popupAdd);
        this.hide(this.d.popupConn);
        this.cancelConn();
        this.selLine = null;
        this.render();
    }
});
```

**`!e.target.matches('input,select,textarea')`:**

Cegah delete line saat user sedang mengetik di input! Bayangkan kamu mengetik nama kota dan menekan Backspace untuk menghapus huruf — tanpa pengecekan ini, garis yang dipilih akan ikut terhapus!

**Escape = "Batalkan semua":**

- Sembunyikan semua popup
- Batalkan mode connecting
- Deselect garis
- Render ulang

#### Event 9: Klik pada Peta (Select/Deselect)

```javascript
area.addEventListener('click', e => {
    if (e.target.closest('.pinpoint,.popup')) return;  // Skip kalau klik di pinpoint/popup
    
    const lid = this.clickedLine(e);
    if (lid) { this.selectLine(lid); return; }         // Klik garis → select garis
    
    if (this.connFrom) this.cancelConn();              // Klik kosong → cancel connect
    if (this.selLine) { this.selLine = null; this.render(); }  // Klik kosong → deselect
});
```

```
Alur keputusan saat klik di peta:

   Klik di area peta
        │
        ├─ Klik di pinpoint/popup? → ABAIKAN (event pinpoint yang handle)
        │
        ├─ Klik dekat garis? → SELECT garis itu (highlight kuning)
        │
        ├─ Mode connecting aktif? → CANCEL connecting
        │
        └─ Ada garis terpilih? → DESELECT garis
```

#### Event 10: Route Search

```javascript
this.d.from.oninput = () => this.checkSearch();
this.d.to.oninput = () => this.checkSearch();
this.d.search.onclick = () => this.search();
```

`oninput` dipanggil SETIAP kali input berubah (setiap ketikan). Jadi tombol Search otomatis enable/disable saat user mengetik.

#### Event 11: Sort Buttons

```javascript
document.querySelectorAll('.sort-btn').forEach(btn => {
    btn.onclick = () => {
        document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.sortMode = btn.dataset.sort;
        this.display();
    };
});
```

```
Klik "Cheapest":
1. Hapus class 'active' dari SEMUA tombol sort
2. Tambah class 'active' ke tombol yang diklik
3. Set sortMode = 'cheapest'
4. Tampilkan ulang hasil (sudah diurutkan berdasarkan biaya)
```

### 6.14 Inisialisasi — Titik Awal Segalanya

```javascript
window.addEventListener('load', () => new App());
```

Satu baris ini memulai SELURUH aplikasi. Saat halaman selesai dimuat (semua gambar, CSS, script sudah siap), buat instance baru dari class App, yang otomatis menjalankan constructor-nya.

---

## 🔄 7. ALUR PROGRAM DARI AWAL SAMPAI AKHIR

### 7.1 Saat Halaman Dibuka

```
Browser membuka index.html
    │
    ├── 1. Parse HTML → Buat DOM tree
    ├── 2. Muat CSS → Style elemen
    ├── 3. Muat MapView.js → Class MapView tersedia
    ├── 4. Muat app.js → Class App tersedia
    │
    └── 5. Event 'load' → new App()
            │
            ├── 5a. Constructor App()
            │    ├── Inisialisasi variabel (pins, conns, dll)
            │    ├── Simpan referensi DOM (this.d = {...})
            │    ├── Buat MapView instance
            │    │
            │    ├── load() → Baca data dari localStorage
            │    │    └── pins & conns terisi dari data sebelumnya (atau kosong)
            │    │
            │    ├── fitToScreen(982, 450) → Hitung zoom & posisi awal
            │    │    └── scale, ox, oy dihitung
            │    │
            │    ├── render() → Gambar semua
            │    │    ├── renderPins() → Gambar semua pinpoint
            │    │    ├── renderLines() → Gambar semua garis
            │    │    └── applyTransform() → Terapkan zoom & pan ke CSS
            │    │
            │    └── events() → Pasang semua event listener
            │         ├── wheel (zoom)
            │         ├── keydown (zoom, delete, escape)
            │         ├── mousedown/move/up (pan)
            │         ├── dblclick (add pinpoint)
            │         ├── form submit (add/connect)
            │         ├── click (select line)
            │         └── input/click (search/sort)
            │
            └── APLIKASI SIAP DIGUNAKAN! 🎉
```

### 7.2 Saat User Menambah Pinpoint

```
User double-click di peta
    │
    ├── Event: dblclick pada #map-area
    │    ├── Cek: klik di pinpoint/popup? → TIDAK
    │    ├── screenToMap() → Hitung koordinat peta dari posisi klik
    │    ├── popup() → Tampilkan popup "Add pinpoint"
    │    └── Focus ke input nama
    │
    ├── User ketik "Jakarta" dan tekan Enter
    │    ├── Event: form-add.onsubmit
    │    ├── preventDefault() → Cegah refresh
    │    ├── Ambil nama: "Jakarta"
    │    ├── addPin("Jakarta", x, y)
    │    │    ├── Push ke array pins
    │    │    ├── save() → Simpan ke localStorage
    │    │    ├── render() → Gambar ulang semua
    │    │    └── checkSearch() → Cek tombol search
    │    └── hide() → Sembunyikan popup
    │
    └── Pinpoint "Jakarta" muncul di peta! 📌
```

### 7.3 Saat User Menghubungkan Dua Pinpoint

```
User klik tombol ⚡ di Jakarta
    │
    ├── onConnect('p1') → startConn('p1')
    │    ├── connFrom = 'p1'
    │    └── render() → Jakarta bersinar ✨
    │
    ├── User klik pinpoint Bandung
    │    ├── onTarget('p2', event)
    │    ├── Cek: connFrom ada? ✅  connFrom !== 'p2'? ✅
    │    ├── connTo = 'p2'
    │    ├── Tampilkan popup Connect
    │    └── Focus ke input jarak
    │
    ├── User isi: jarak = 150, transport = train, klik Connect
    │    ├── Event: form-connect.onsubmit
    │    ├── parseInt("150") = 150, mode = "train"
    │    ├── submitConn(150, "train")
    │    │    ├── Cari koneksi Jakarta↔Bandung → Tidak ditemukan
    │    │    ├── Push koneksi baru ke array conns
    │    │    ├── hide() → Sembunyikan popup
    │    │    ├── cancelConn() → Reset connecting state
    │    │    ├── save() → Simpan ke localStorage
    │    │    └── render() → Gambar ulang semua
    │    │
    │    └── Garis hijau muncul antara Jakarta dan Bandung! ──
    │
    └── SELESAI ✅
```

### 7.4 Saat User Mencari Rute

```
User ketik "Jakarta" di From, "Surabaya" di To
    │
    ├── oninput event → checkSearch()
    │    ├── "Jakarta" ada di pins? ✅
    │    ├── "Surabaya" ada di pins? ✅
    │    ├── "Jakarta" ≠ "Surabaya"? ✅
    │    └── Tombol Search → ENABLED
    │
    ├── User klik Search
    │    ├── search()
    │    │    ├── FASE 1: DFS
    │    │    │    ├── Mulai dari Jakarta
    │    │    │    ├── Jelajahi semua jalur ke Surabaya
    │    │    │    └── Hasilnya: [Jalur1, Jalur2, ...]
    │    │    │
    │    │    ├── FASE 2: Kombinasi Transport
    │    │    │    ├── Untuk setiap jalur, coba semua kombinasi
    │    │    │    ├── Hitung durasi dan biaya setiap kombinasi
    │    │    │    └── Simpan ke this.routes
    │    │    │
    │    │    ├── Tampilkan sort controls
    │    │    └── display()
    │    │         ├── Sort berdasarkan sortMode
    │    │         ├── Ambil 10 terbaik
    │    │         └── Render HTML cards
    │    │
    │    └── Hasil rute muncul di panel! 📊
    │
    └── User bisa klik "Cheapest" untuk urutkan berdasarkan harga
```

---

## 📐 8. RANGKUMAN ALGORITMA PENTING

### 8.1 Tabel Ringkasan

```
┌────────────────────────┬──────────────────────────────────────────┐
│ Algoritma              │ Digunakan untuk                         │
├────────────────────────┼──────────────────────────────────────────┤
│ Zoom at Point          │ Zoom peta tapi titik cursor tetap diam  │
│ Screen ↔ Map Convert   │ Konversi koordinat layar ↔ peta         │
│ Point-to-Segment Dist  │ Deteksi apakah klik mengenai garis      │
│ Perpendicular Offset   │ Menggambar garis paralel (multi-transport)│
│ DFS (Depth-First Search)│ Mencari semua jalur dari A ke B        │
│ Recursive Combination  │ Generate semua kombinasi transportasi   │
│ Sort + Slice           │ Mengurutkan dan membatasi hasil         │
│ Duration Formatting    │ Mengubah desimal jam → format "Xh Ymin" │
└────────────────────────┴──────────────────────────────────────────┘
```

### 8.2 Kompleksitas Perhitungan

```
Zoom at Point:
   Operasi: 6 perkalian, 4 pengurangan, 2 Math.max/min
   Waktu: O(1) — konstan, sangat cepat

Screen to Map:
   Operasi: 2 pengurangan, 2 pembagian
   Waktu: O(1)

Point-to-Segment:
   Per garis: 6 perkalian, 5 pengurangan, 1 sqrt, 2 Math.max/min
   Total: O(n) dimana n = jumlah koneksi

Perpendicular Offset:
   Per garis: 1 sqrt, 4 perkalian, 2 pengurangan
   Waktu: O(1)

DFS:
   Worst case: O(V! / (V-E)!) dimana V = jumlah pinpoint, E = edge
   Untuk graf kecil (< 20 node): sangat cepat

Recursive Combination:
   Worst case: O(T^E) dimana T = max transport per koneksi, E = edge di jalur
   Contoh: 3 transport × 5 edge = 3^5 = 243 kombinasi
```

### 8.3 Pola Pemrograman yang Digunakan

```
1. OOP (Object-Oriented Programming)
   → Class MapView dan App
   → Enkapsulasi: setiap class punya tanggung jawab sendiri

2. Separation of Concerns
   → MapView = View (tampilan)
   → App = Controller (logika)
   → Mirip pola MVC (Model-View-Controller)

3. Callback Pattern
   → App memberi fungsi ke MapView (onConnect, onDelete, onTarget)
   → MapView memanggil fungsi itu saat event terjadi

4. Re-render Pattern
   → Setiap perubahan → gambar ulang SEMUA dari awal
   → Sederhana & aman (tidak perlu track perubahan individual)

5. Backtracking
   → DFS menggunakan backtrack untuk menjelajahi semua kemungkinan
   → visited.add → rekursi → visited.delete (undo)

6. Recursive Combination Generation
   → combo() menghasilkan semua kombinasi transport
   → Mirip teknik "Generate All Permutations"
```

---

## 🎯 TIPS BELAJAR

### Cara Memahami Kode yang Rumit

1. **Mulai dari yang mudah** — HTML dulu, baru CSS, baru JS sederhana, baru algoritma
2. **Console.log** — Tambahkan `console.log(variabel)` untuk melihat nilai saat runtime
3. **Gambar di kertas** — Untuk DFS dan rekursi, GAMBAR pohon rekursinya di kertas
4. **Breakpoint** — Gunakan DevTools browser (F12 → Sources → klik nomor baris)
5. **Baca dari `window.addEventListener('load', ...)`** — Ini titik awal program
6. **Ikuti alur event** — Bayangkan: "Kalau saya klik ini, fungsi apa yang dipanggil?"

### Konsep Kunci yang Harus Dikuasai

```
LEVEL 1 (Dasar):
├── Variabel, Array, Object
├── if/else, for, forEach
├── Function / Arrow function
└── DOM manipulation (getElementById, createElement, innerHTML)

LEVEL 2 (Menengah):
├── Class & Constructor
├── Event Listener & e.preventDefault/stopPropagation
├── Array methods: filter, find, map, some, sort
├── localStorage
└── CSS Variables & Nesting

LEVEL 3 (Lanjut):
├── Rekursi (DFS, Combination)
├── Backtracking
├── Vektor matematika (dot product, perpendicular)
├── Coordinate transformation (zoom & pan)
└── Callback pattern
```

---

> **Catatan terakhir**: Kalau kamu membaca sampai sini, kamu SUDAH HEBAT! 💪 Kode ini memang tidak sederhana — ada matematika, algoritma graf, rekursi, dan banyak event handling. Tapi dengan memahami setiap bagian secara bertahap, kamu pasti bisa menguasainya. Semangat! 🚀
