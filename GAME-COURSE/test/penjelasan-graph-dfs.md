# 🧠 PENJELASAN LENGKAP: GRAPH, DFS & DIJKSTRA

> Dokumen ini menjelaskan **dari nol** tentang Graph, DFS, dan Dijkstra.
> Semua contoh menggunakan **data dari program peta kamu**.

---

## 📚 DAFTAR ISI

1. Apa itu Graph?
2. Graph di Program Kamu
3. Apa itu DFS?
4. DFS Step-by-Step di Program Kamu
5. Apa itu Dijkstra?
6. Dijkstra Step-by-Step
7. DFS vs Dijkstra — Apa Bedanya?
8. Kenapa Program Kamu Pakai DFS, Bukan Dijkstra?

---

## 1. APA ITU GRAPH?

### Definisi Simpel

**Graph = kumpulan TITIK yang dihubungkan oleh GARIS.**

Itu saja. Sesimpel itu.

```
Contoh paling sederhana:

    A ──── B
    │      │
    │      │
    C ──── D

A, B, C, D = TITIK (disebut "node" atau "vertex")
Garis-garis = HUBUNGAN (disebut "edge")
```

### Istilah Penting

| Istilah | Arti | Contoh di Program Kamu |
|---------|------|------------------------|
| **Node** (Vertex) | Titik | Pinpoint (Jakarta, Bandung, dll) |
| **Edge** | Garis penghubung | Connection (garis antara 2 pin) |
| **Weight** | Bobot/nilai di edge | Jarak (km), durasi, biaya |
| **Neighbor** | Tetangga langsung | Pin yang terhubung langsung |
| **Path** | Jalur dari A ke B | Urutan pin yang dilalui |
| **Undirected** | Bisa 2 arah | A→B = B→A (program kamu) |

### Jenis-Jenis Graph

```
1. UNDIRECTED (tak berarah) — bisa 2 arah
   A ──── B    (dari A bisa ke B, dari B bisa ke A)
   
   → PROGRAM KAMU PAKAI INI!

2. DIRECTED (berarah) — satu arah saja
   A ────→ B   (dari A bisa ke B, tapi B TIDAK bisa ke A)

3. WEIGHTED (berbobot) — ada nilai di garis
   A ──732── B  (jarak 732km)
   
   → PROGRAM KAMU JUGA PAKAI INI!

4. UNWEIGHTED (tanpa bobot) — semua garis sama
   A ───── B   (tidak ada jarak)
```

**Program kamu = UNDIRECTED + WEIGHTED graph.**
- Undirected: kalau Jakarta→Bandung ada, maka Bandung→Jakarta juga ada
- Weighted: setiap koneksi punya jarak (km)

---

## 2. GRAPH DI PROGRAM KAMU

### Data yang Membentuk Graph

Di program kamu, graph BUKAN dibuat dari library khusus. Graph terbentuk dari **2 array biasa**:

```javascript
// NODES = pin-pin di peta
this.pins = [
    { id: 'p1', name: 'Jakarta',   x: 155, y: 280 },
    { id: 'p2', name: 'Bandung',   x: 180, y: 275 },
    { id: 'p3', name: 'Semarang',  x: 240, y: 260 },
    { id: 'p4', name: 'Surabaya',  x: 310, y: 265 },
    { id: 'p5', name: 'Yogyakarta',x: 250, y: 270 }
]

// EDGES = koneksi antar pin
this.conns = [
    { id:'c1', fromId:'p1', toId:'p2', transports:[{ mode:'train', distance:150 }] },
    { id:'c2', fromId:'p1', toId:'p3', transports:[{ mode:'bus',   distance:450 }] },
    { id:'c3', fromId:'p2', toId:'p3', transports:[{ mode:'train', distance:330 }] },
    { id:'c4', fromId:'p3', toId:'p4', transports:[{ mode:'train', distance:310 }] },
    { id:'c5', fromId:'p3', toId:'p5', transports:[{ mode:'bus',   distance:120 }] },
    { id:'c6', fromId:'p5', toId:'p4', transports:[{ mode:'train', distance:260 }] }
]
```

### Visualisasi Graph-nya

Dari data di atas, graph-nya terlihat seperti ini:

```
                    450km (bus)
    Jakarta(p1) ─────────────────── Semarang(p3)
        │                          ╱     │
        │ 150km                  ╱       │ 310km
        │ (train)          330km╱        │ (train)
        │                (train)╱          │
    Bandung(p2) ───────────╱      Surabaya(p4)
                                    ╱
                                 ╱ 260km
                              ╱  (train)
                    Yogyakarta(p5)
                        │
                        │ 120km (bus)
                        │
                    Semarang(p3)  ← terhubung juga ke Semarang
```

Atau lebih rapi:

```
    p1 ──── p2
    │  ╲      │
    │   ╲     │
    │    ╲    │
    │     ╲   │
    │      ╲  │
    │       p3 ──── p4
    │       │      ╱
    │       │    ╱
    │       │  ╱
    │       p5
    │
    └── p3 (langsung)
```

### Tabel Tetangga (Adjacency List)

Cara lain lihat graph: **siapa tetangga siapa?**

| Node | Tetangga Langsung |
|------|-------------------|
| Jakarta (p1) | Bandung (p2), Semarang (p3) |
| Bandung (p2) | Jakarta (p1), Semarang (p3) |
| Semarang (p3) | Jakarta (p1), Bandung (p2), Surabaya (p4), Yogyakarta (p5) |
| Surabaya (p4) | Semarang (p3), Yogyakarta (p5) |
| Yogyakarta (p5) | Semarang (p3), Surabaya (p4) |

**Semarang (p3) punya tetangga paling banyak = 4.** Dia "hub" (pusat) dari graph ini.

### Bagaimana Program Kamu Menentukan Tetangga?

Di kode `searchRoutes()`, cara program cari tetangga SANGAT SIMPEL:

```javascript
for (var i = 0; i < self.conns.length; i++) {
    var c = self.conns[i], next = null;
    if (c.fromId === cur) next = c.toId;      // ← koneksi DARI pin saat ini
    else if (c.toId === cur) next = c.fromId;  // ← koneksi KE pin saat ini (karena undirected)
}
```

**Loop semua koneksi, cek apakah pin saat ini ada di `fromId` atau `toId`.**

Contoh: `cur = 'p3'` (Semarang), loop semua koneksi:

```
c1: fromId='p1', toId='p2' → p3 tidak ada     → skip
c2: fromId='p1', toId='p3' → toId === p3!      → next = p1 (Jakarta)
c3: fromId='p2', toId='p3' → toId === p3!      → next = p2 (Bandung)
c4: fromId='p3', toId='p4' → fromId === p3!    → next = p4 (Surabaya)
c5: fromId='p3', toId='p5' → fromId === p3!    → next = p5 (Yogyakarta)
c6: fromId='p5', toId='p4' → p3 tidak ada      → skip

Tetangga Semarang: [Jakarta, Bandung, Surabaya, Yogyakarta] ✅
```

---

## 3. APA ITU DFS?

### Definisi Simpel

**DFS = Depth First Search = "Coba satu jalan sedalam mungkin, kalau mentok BALIK, coba jalan lain"**

Bayangkan kamu di dalam **labirin**:

```
STRATEGI DFS:
1. Mulai dari pintu masuk
2. Pilih SATU jalan
3. Terus lurus sampai mentok (buntu atau sudah pernah lewat)
4. BALIK ke persimpangan terakhir
5. Coba jalan lain
6. Ulangi sampai ketemu pintu keluar
```

### Analogi Sederhana

```
Bayangkan kamu di mall, mau cari toko sepatu:

DFS: Kamu masuk lantai 1, belok kiri, jalan terus sampai ujung...
     Tidak ketemu? BALIK ke persimpangan, belok kanan...
     Masih tidak? BALIK ke pintu masuk, naik lantai 2...
     Ketemu! Stop.

Kamu selalu JALAN TERUS sedalam mungkin sebelum balik.
```

### Perbedaan DFS vs BFS

```
DFS (Depth First) = DALAM dulu
BFS (Breadth First) = LEBAR dulu

Contoh pohon:
         A
        / \
       B   C
      / \   \
     D   E   F

DFS: A → B → D → (balik) → E → (balik balik) → C → F
     (masuk sedalam mungkin ke kiri dulu)

BFS: A → B → C → D → E → F
     (selesaikan 1 level dulu baru turun)
```

### Konsep BACKTRACKING

DFS sangat erat dengan **backtracking** (mundur):

```
1. MAJU: vis[next] = true → path.push() → dfs(next)
   "Tandai sudah dikunjungi, catat langkah, lanjut ke berikutnya"

2. MUNDUR: path.pop() → delete vis[next]
   "Hapus langkah terakhir, un-tandai, supaya bisa dicoba dari jalan lain"
```

**Kenapa harus backtrack?**
→ Supaya kita bisa menemukan SEMUA jalur, bukan cuma 1.

---

## 4. DFS STEP-BY-STEP DI PROGRAM KAMU

### Skenario

User ingin cari rute: **Jakarta → Surabaya**

Data graph (dari contoh di atas):

```
    Jakarta(p1) ──150km── Bandung(p2)
        │                      │
      450km                  330km
        │                      │
    Semarang(p3) ─────────────┘
        │         ╲
      310km      120km
        │           ╲
    Surabaya(p4)  Yogyakarta(p5)
                  260km──┘
```

### Mulai DFS

```javascript
// Kode yang dijalankan:
dfs(fp.id, []);  // fp = Jakarta (p1)
```

**State awal:**
```
cur   = 'p1' (Jakarta)
path  = []
vis   = { p1: true }          ← Jakarta sudah dikunjungi
routes = []                    ← belum ada hasil
```

---

### LANGKAH 1: Di Jakarta, cari tetangga

```javascript
for (var i = 0; i < self.conns.length; i++) {
    var c = self.conns[i], next = null;
    if (c.fromId === cur) next = c.toId;
    else if (c.toId === cur) next = c.fromId;
```

```
Loop koneksi dari Jakarta (p1):
  c1: fromId=p1, toId=p2 → next = p2 (Bandung)     ✅ belum dikunjungi
  c2: fromId=p1, toId=p3 → next = p3 (Semarang)    ✅ belum dikunjungi
  (koneksi lain tidak melibatkan p1)
```

**Tetangga Jakarta: [Bandung, Semarang]**

### LANGKAH 2: Pilih Bandung (p2) — MASUK LEBIH DALAM

```javascript
if (next && !vis[next]) {     // p2 belum dikunjungi? YES
    vis[next] = true;          // vis = { p1:true, p2:true }
    path.push({ from: 'p1', to: 'p2', conn: c1 });
    dfs('p2', path);           // ← REKURSI! Masuk ke Bandung
```

**State sekarang:**
```
cur   = 'p2' (Bandung)        ← PINDAH ke Bandung
path  = [{ Jakarta → Bandung, c1 }]
vis   = { p1: true, p2: true }

Visualisasi perjalanan:
    [Jakarta] ══150km══> [Bandung] ──?──> ...
         ✓                   ✓
```

### LANGKAH 3: Di Bandung, cari tetangga

```
Loop koneksi dari Bandung (p2):
  c1: fromId=p1, toId=p2 → next = p1 (Jakarta)   ❌ SUDAH DIKUNJUNGI (vis[p1]=true)
  c3: fromId=p2, toId=p3 → next = p3 (Semarang)  ✅ belum dikunjungi
```

**Tetangga Bandung yang BELUM dikunjungi: [Semarang]**

### LANGKAH 4: Pilih Semarang (p3) — MASUK LEBIH DALAM LAGI

```javascript
vis['p3'] = true;       // vis = { p1:true, p2:true, p3:true }
path.push({ from: 'p2', to: 'p3', conn: c3 });
dfs('p3', path);        // ← REKURSI! Masuk ke Semarang
```

**State sekarang:**
```
cur   = 'p3' (Semarang)
path  = [{ Jakarta→Bandung, c1 }, { Bandung→Semarang, c3 }]
vis   = { p1: true, p2: true, p3: true }

Visualisasi perjalanan:
    [Jakarta] ══> [Bandung] ══> [Semarang] ──?──> ...
        ✓            ✓             ✓
```

### LANGKAH 5: Di Semarang, cari tetangga

```
Loop koneksi dari Semarang (p3):
  c2: next = p1 (Jakarta)     ❌ sudah dikunjungi
  c3: next = p2 (Bandung)     ❌ sudah dikunjungi
  c4: next = p4 (Surabaya)    ✅ belum!
  c5: next = p5 (Yogyakarta)  ✅ belum!
```

**Tetangga Semarang yang BELUM dikunjungi: [Surabaya, Yogyakarta]**

### LANGKAH 6: Pilih Surabaya (p4) — MASUK LEBIH DALAM

```javascript
vis['p4'] = true;
path.push({ from: 'p3', to: 'p4', conn: c4 });
dfs('p4', path);
```

**State sekarang:**
```
cur   = 'p4' (Surabaya)       ← INI TUJUAN KITA!
path  = [{ Jakarta→Bandung }, { Bandung→Semarang }, { Semarang→Surabaya }]
vis   = { p1:true, p2:true, p3:true, p4:true }
```

### LANGKAH 7: cur === tp.id → TUJUAN TERCAPAI! 🎉

```javascript
if (cur === tp.id) {  // 'p4' === 'p4' → TRUE!
```

**Hitung total untuk jalur ini:**

```
path = [
  step 0: Jakarta → Bandung   (conn c1, train 150km)
  step 1: Bandung → Semarang  (conn c3, train 330km)  
  step 2: Semarang → Surabaya (conn c4, train 310km)
]

Step 0: best transport = train (satu-satunya)
  dur  += 150 / 120 = 1.25 jam
  cost += 150 × 500 = 75,000

Step 1: best transport = train
  dur  += 330 / 120 = 2.75 jam
  cost += 330 × 500 = 165,000

Step 2: best transport = train
  dur  += 310 / 120 = 2.58 jam
  cost += 310 × 500 = 155,000

TOTAL: dur = 6.58 jam, cost = Rp395,000
steps = [
  "Jakarta → Bandung (Train, 150km)",
  "Bandung → Semarang (Train, 330km)",
  "Semarang → Surabaya (Train, 310km)"
]
```

```javascript
self.routes.push({ dur: 6.58, cost: 395000, steps: [...] });
return;  // ← KEMBALI dari rekursi ini
```

**✅ JALUR 1 DITEMUKAN: Jakarta → Bandung → Semarang → Surabaya (6.58 jam, Rp395.000)**

```
routes = [
  { dur: 6.58, cost: 395000, steps: ["Jakarta→Bandung", "Bandung→Semarang", "Semarang→Surabaya"] }
]
```

### LANGKAH 8: BACKTRACK dari Surabaya

Kembali ke Semarang (p3). Sekarang:

```javascript
path.pop();         // Hapus { Semarang→Surabaya } → path = [{ Jkt→Bdg }, { Bdg→Smg }]
delete vis['p4'];   // vis = { p1:true, p2:true, p3:true } ← p4 BISA dikunjungi lagi!
```

**State sekarang:**
```
cur   = 'p3' (kembali ke Semarang)
path  = [{ Jakarta→Bandung }, { Bandung→Semarang }]
vis   = { p1:true, p2:true, p3:true }       ← p4 sudah di-delete!

Visualisasi:
    [Jakarta] ══> [Bandung] ══> [Semarang]
        ✓            ✓             ✓
    Surabaya sudah di-un-visit → bisa dicoba dari jalan lain
```

### LANGKAH 9: Di Semarang, coba tetangga berikutnya → Yogyakarta (p5)

```javascript
vis['p5'] = true;
path.push({ from: 'p3', to: 'p5', conn: c5 });
dfs('p5', path);
```

**State sekarang:**
```
cur   = 'p5' (Yogyakarta)
path  = [{ Jakarta→Bandung }, { Bandung→Semarang }, { Semarang→Yogyakarta }]
vis   = { p1:true, p2:true, p3:true, p5:true }
```

### LANGKAH 10: Di Yogyakarta, cari tetangga

```
Loop koneksi dari Yogyakarta (p5):
  c5: next = p3 (Semarang)    ❌ sudah dikunjungi
  c6: next = p4 (Surabaya)    ✅ belum! (karena sudah di-delete tadi)
```

### LANGKAH 11: Pilih Surabaya (p4) — TUJUAN TERCAPAI LAGI! 🎉

```javascript
vis['p4'] = true;
path.push({ from: 'p5', to: 'p4', conn: c6 });
dfs('p4', path);
// cur === tp.id → TRUE!
```

**Hitung total untuk jalur ini:**

```
path = [
  step 0: Jakarta → Bandung      (train 150km)
  step 1: Bandung → Semarang     (train 330km)
  step 2: Semarang → Yogyakarta  (bus 120km)
  step 3: Yogyakarta → Surabaya  (train 260km)
]

dur  = 150/120 + 330/120 + 120/80 + 260/120
     = 1.25 + 2.75 + 1.5 + 2.17
     = 7.67 jam

cost = 150×500 + 330×500 + 120×100 + 260×500
     = 75000 + 165000 + 12000 + 130000
     = Rp382,000
```

**✅ JALUR 2 DITEMUKAN: Jakarta → Bandung → Semarang → Yogyakarta → Surabaya (7.67 jam, Rp382.000)**

### LANGKAH 12-...: Terus Backtrack

DFS terus backtrack sampai kembali ke Jakarta, lalu coba jalur langsung:

```
BACKTRACK ke Yogyakarta → pop, delete vis[p4]
BACKTRACK ke Semarang → pop, delete vis[p5]  
BACKTRACK ke Bandung → pop, delete vis[p3]
BACKTRACK ke Jakarta → pop, delete vis[p2]

Sekarang di Jakarta lagi, coba tetangga berikutnya: Semarang (p3) langsung!
```

### LANGKAH 13: Jakarta → Semarang (langsung)

```javascript
vis['p3'] = true;
path.push({ from: 'p1', to: 'p3', conn: c2 });
dfs('p3', path);
```

Dari Semarang, DFS akan menemukan lagi jalur ke Surabaya:

**✅ JALUR 3: Jakarta → Semarang → Surabaya**
```
dur  = 450/80 + 310/120 = 5.625 + 2.583 = 8.21 jam
cost = 450×100 + 310×500 = 45000 + 155000 = Rp200,000
```

**✅ JALUR 4: Jakarta → Semarang → Yogyakarta → Surabaya**
```
dur  = 450/80 + 120/80 + 260/120 = 5.625 + 1.5 + 2.167 = 9.29 jam
cost = 450×100 + 120×100 + 260×500 = 45000 + 12000 + 130000 = Rp187,000
```

### HASIL AKHIR DFS

```
routes = [
  1. Jakarta → Bandung → Semarang → Surabaya           | 6.58 jam | Rp395.000
  2. Jakarta → Bandung → Semarang → Yogya → Surabaya   | 7.67 jam | Rp382.000
  3. Jakarta → Semarang → Surabaya                      | 8.21 jam | Rp200.000
  4. Jakarta → Semarang → Yogya → Surabaya              | 9.29 jam | Rp187.000
]

Sorted by Fastest:  1 → 2 → 3 → 4
Sorted by Cheapest: 4 → 3 → 2 → 1
```

### Visualisasi Seluruh Proses DFS

```
                        DFS Tree (urutan eksplorasi)
                        
                        Jakarta (START)
                       ╱               ╲
                    Bandung           Semarang
                      │              ╱         ╲
                   Semarang      Surabaya    Yogyakarta
                  ╱         ╲     (GOAL✅)       │
            Surabaya    Yogyakarta            Surabaya
            (GOAL✅)       │                  (GOAL✅)
                       Surabaya
                       (GOAL✅)

4 jalur ditemukan!
```

---

## 5. APA ITU DIJKSTRA?

### Definisi Simpel

**Dijkstra = algoritma untuk mencari SATU JALUR TERPENDEK dari A ke B**

Perbedaan utama dengan DFS:

```
DFS:      Cari SEMUA jalur dari A ke B → user pilih mana yang mau
Dijkstra: Cari SATU jalur TERBAIK dari A ke B → langsung jawaban terbaik
```

### Analogi Dijkstra

```
Bayangkan kamu pegang STOPWATCH dan berdiri di Jakarta.

1. Dari Jakarta, kamu bisa ke:
   - Bandung (150km, 1.25 jam)      ← lebih dekat!
   - Semarang (450km, 3.75 jam)

2. Pilih yang PALING DEKAT dulu → Bandung!
   Catat: "Jarak terpendek ke Bandung = 1.25 jam"

3. Dari Bandung, kamu bisa ke:
   - Semarang (330km, 2.75 jam) → total dari Jakarta = 1.25 + 2.75 = 4.00 jam
   
   Bandingkan: Semarang via Bandung = 4.00 jam vs langsung = 3.75 jam
   → langsung lebih cepat! Jangan update.

4. Pilih yang PALING DEKAT dari semua yang belum → Semarang (3.75 jam)

5. Dari Semarang, kamu bisa ke:
   - Surabaya (310km) → total = 3.75 + 2.58 = 6.33 jam
   - Yogyakarta (120km) → total = 3.75 + 1.00 = 4.75 jam

6. Pilih yang paling dekat → Yogyakarta (4.75 jam)

7. Dari Yogyakarta, kamu bisa ke:
   - Surabaya (260km) → total = 4.75 + 2.17 = 6.92 jam
   
   Bandingkan: Surabaya via Yogyakarta = 6.92 jam vs via Semarang = 6.33 jam
   → via Semarang lebih cepat! Jangan update.

8. Pilih yang paling dekat → Surabaya (6.33 jam)

9. Surabaya = TUJUAN! SELESAI!
   Jalur terpendek: Jakarta → Semarang → Surabaya = 6.33 jam
```

### Prinsip Dijkstra (3 Aturan)

```
ATURAN 1: Selalu pilih node dengan jarak TERPENDEK yang belum diproses
ATURAN 2: Update jarak tetangga kalau ditemukan jalur lebih pendek
ATURAN 3: Sekali node diproses, jaraknya FINAL (tidak berubah lagi)
```

---

## 6. DIJKSTRA STEP-BY-STEP

Menggunakan graph yang sama:

```
    Jakarta(p1) ──150km── Bandung(p2)
        │                      │
      450km                  330km
        │                      │
    Semarang(p3) ─────────────┘
        │         ╲
      310km      120km
        │           ╲
    Surabaya(p4)  Yogyakarta(p5)
                  260km──┘
```

**Transport: semua pakai train (speed=120 km/jam) untuk simpel.**
**Bobot = waktu tempuh = jarak / 120**

### Tabel Jarak

| Edge | Jarak | Waktu (jarak/120) |
|------|-------|--------------------|
| p1→p2 | 150km | 1.25 jam |
| p1→p3 | 450km | 3.75 jam |
| p2→p3 | 330km | 2.75 jam |
| p3→p4 | 310km | 2.58 jam |
| p3→p5 | 120km | 1.00 jam |
| p5→p4 | 260km | 2.17 jam |

### STEP 0: Inisialisasi

```
Jarak terpendek dari Jakarta ke setiap node:
┌───────────┬──────────┬────────────┬───────────┐
│   Node    │  Jarak   │   Prev     │ Diproses? │
├───────────┼──────────┼────────────┼───────────┤
│ Jakarta   │    0     │    -       │    ❌     │
│ Bandung   │    ∞     │    -       │    ❌     │
│ Semarang  │    ∞     │    -       │    ❌     │
│ Surabaya  │    ∞     │    -       │    ❌     │
│ Yogyakarta│    ∞     │    -       │    ❌     │
└───────────┴──────────┴────────────┴───────────┘

Antrian: [Jakarta(0)]
```

### STEP 1: Proses Jakarta (jarak = 0)

**Pilih node dengan jarak terpendek yang belum diproses → Jakarta (0)**

```
Tetangga Jakarta:
  → Bandung:    0 + 1.25 = 1.25  (lebih kecil dari ∞ → UPDATE!)
  → Semarang:   0 + 3.75 = 3.75  (lebih kecil dari ∞ → UPDATE!)
```

```
┌───────────┬──────────┬────────────┬───────────┐
│   Node    │  Jarak   │   Prev     │ Diproses? │
├───────────┼──────────┼────────────┼───────────┤
│ Jakarta   │    0     │    -       │    ✅     │  ← SELESAI
│ Bandung   │  1.25    │  Jakarta   │    ❌     │  ← UPDATED
│ Semarang  │  3.75    │  Jakarta   │    ❌     │  ← UPDATED
│ Surabaya  │    ∞     │    -       │    ❌     │
│ Yogyakarta│    ∞     │    -       │    ❌     │
└───────────┴──────────┴────────────┴───────────┘

Antrian: [Bandung(1.25), Semarang(3.75)]
```

### STEP 2: Proses Bandung (jarak = 1.25)

**Pilih node terpendek yang belum diproses → Bandung (1.25)**

```
Tetangga Bandung:
  → Jakarta:    SUDAH DIPROSES → skip
  → Semarang:   1.25 + 2.75 = 4.00
                 4.00 > 3.75 (jarak sekarang) → JANGAN UPDATE! Via Jakarta lebih cepat!
```

```
┌───────────┬──────────┬────────────┬───────────┐
│   Node    │  Jarak   │   Prev     │ Diproses? │
├───────────┼──────────┼────────────┼───────────┤
│ Jakarta   │    0     │    -       │    ✅     │
│ Bandung   │  1.25    │  Jakarta   │    ✅     │  ← SELESAI
│ Semarang  │  3.75    │  Jakarta   │    ❌     │  ← TETAP (4.00 > 3.75)
│ Surabaya  │    ∞     │    -       │    ❌     │
│ Yogyakarta│    ∞     │    -       │    ❌     │
└───────────┴──────────┴────────────┴───────────┘
```

**Perhatikan:** Via Bandung ke Semarang = 4.00 jam, tapi langsung = 3.75 jam. Langsung lebih cepat!

### STEP 3: Proses Semarang (jarak = 3.75)

**Pilih terpendek → Semarang (3.75)**

```
Tetangga Semarang:
  → Jakarta:     SUDAH DIPROSES → skip
  → Bandung:     SUDAH DIPROSES → skip
  → Surabaya:    3.75 + 2.58 = 6.33  (< ∞ → UPDATE!)
  → Yogyakarta:  3.75 + 1.00 = 4.75  (< ∞ → UPDATE!)
```

```
┌───────────┬──────────┬────────────┬───────────┐
│   Node    │  Jarak   │   Prev     │ Diproses? │
├───────────┼──────────┼────────────┼───────────┤
│ Jakarta   │    0     │    -       │    ✅     │
│ Bandung   │  1.25    │  Jakarta   │    ✅     │
│ Semarang  │  3.75    │  Jakarta   │    ✅     │  ← SELESAI
│ Surabaya  │  6.33    │  Semarang  │    ❌     │  ← UPDATED
│ Yogyakarta│  4.75    │  Semarang  │    ❌     │  ← UPDATED
└───────────┴──────────┴────────────┴───────────┘

Antrian: [Yogyakarta(4.75), Surabaya(6.33)]
```

### STEP 4: Proses Yogyakarta (jarak = 4.75)

**Pilih terpendek → Yogyakarta (4.75)**

```
Tetangga Yogyakarta:
  → Semarang:   SUDAH DIPROSES → skip
  → Surabaya:   4.75 + 2.17 = 6.92
                 6.92 > 6.33 (jarak sekarang) → JANGAN UPDATE!
```

```
┌───────────┬──────────┬────────────┬───────────┐
│   Node    │  Jarak   │   Prev     │ Diproses? │
├───────────┼──────────┼────────────┼───────────┤
│ Jakarta   │    0     │    -       │    ✅     │
│ Bandung   │  1.25    │  Jakarta   │    ✅     │
│ Semarang  │  3.75    │  Jakarta   │    ✅     │
│ Surabaya  │  6.33    │  Semarang  │    ❌     │  ← TETAP (6.92 > 6.33)
│ Yogyakarta│  4.75    │  Semarang  │    ✅     │  ← SELESAI
└───────────┴──────────┴────────────┴───────────┘
```

### STEP 5: Proses Surabaya (jarak = 6.33) → TUJUAN! 🎉

**Surabaya = tujuan! SELESAI!**

**Trace balik jalur (pakai kolom "Prev"):**
```
Surabaya  ← prev = Semarang
Semarang  ← prev = Jakarta
Jakarta   ← START

JALUR TERPENDEK: Jakarta → Semarang → Surabaya
WAKTU TOTAL: 6.33 jam
```

**Bandingkan dengan semua jalur yang DFS temukan:**

```
                                        Waktu     Dijkstra bilang?
Jakarta → Semarang → Surabaya          6.33 jam   ← INI YANG DIPILIH ✅
Jakarta → Bandung → Semarang → Sby     6.58 jam   ← lebih lambat
Jakarta → Semarang → Yogya → Sby       6.92 jam   ← lebih lambat  
Jakarta → Bdg → Smg → Yogya → Sby      7.67 jam   ← lebih lambat
```

Dijkstra langsung nemuin yang **terbaik (6.33 jam)** tanpa mencoba semua.

---

## 7. DFS vs DIJKSTRA — APA BEDANYA?

### Tabel Perbandingan

| Aspek | DFS | Dijkstra |
|-------|-----|----------|
| **Tujuan** | Cari SEMUA jalur | Cari 1 jalur TERPENDEK |
| **Hasil** | Banyak jalur, user pilih | 1 jalur, pasti terpendek |
| **Jaminan** | ❌ Tidak jamin terpendek | ✅ PASTI terpendek |
| **Kecepatan** | Lambat kalau graph besar | Lebih cepat (berhenti saat tujuan ditemukan) |
| **Backtracking** | ✅ Ya (mundur coba jalan lain) | ❌ Tidak perlu |
| **Data struktur** | Stack (rekursi) | Priority Queue (antrian prioritas) |
| **Kompleksitas** | O(V! worst case) | O((V+E) log V) |
| **Bobot negatif** | Bisa handle | ❌ Tidak bisa |
| **Kode** | Simpel (~20 baris) | Lebih kompleks (~40 baris) |

### Visualisasi Perbedaan Cara Kerja

```
GRAPH:
    A ──1── B ──3── D (tujuan)
    │       │
    2       1
    │       │
    C ──1── E ──1── D

DFS mencoba SEMUA jalur:
    A → B → D                    (jarak = 1+3 = 4)
    A → B → E → D               (jarak = 1+1+1 = 3)  ← ternyata ini lebih pendek!
    A → C → E → D               (jarak = 2+1+1 = 4)
    A → C → E → B → D           (jarak = 2+1+1+3 = 7)
    ... mengembalikan SEMUA 4 jalur

Dijkstra mencari SATU terpendek:
    Step 1: A(0)  → update B(1), C(2)
    Step 2: B(1)  → update D(4), E(2)
    Step 3: C(2)  → E sudah 2, tetap
    Step 4: E(2)  → update D(3)  ← 3 < 4, update!
    Step 5: D(3)  → SELESAI! A→B→E→D = 3
    ... langsung jawab 1 jalur terpendek
```

### Kapan Pakai Apa?

```
PAKAI DFS KALAU:
✅ Mau cari SEMUA jalur
✅ Graph kecil (< 20 node)
✅ Mau kasih user pilihan
✅ Kode harus simpel
✅ Program kamu! → user bisa lihat semua opsi

PAKAI DIJKSTRA KALAU:
✅ Mau cari 1 jalur TERPENDEK saja
✅ Graph besar (ratusan/ribuan node)
✅ Performance penting
✅ Google Maps, Waze, GPS → cari rute tercepat
```

---

## 8. KENAPA PROGRAM KAMU PAKAI DFS, BUKAN DIJKSTRA?

### Alasan 1: User Butuh SEMUA Pilihan

```
Program kamu:
┌──────────────────────────────────────────┐
│ Find Route                                │
│ From: Jakarta                             │
│ To: Surabaya                              │
│ [Sort: Fastest | Cheapest]                │
│                                           │
│ Route 1: Jkt→Smg→Sby      6.33jam Rp200k │ ← user bisa pilih!
│ Route 2: Jkt→Bdg→Smg→Sby  6.58jam Rp395k │
│ Route 3: Jkt→Smg→Ygy→Sby  6.92jam Rp187k │ ← ini paling murah!
│ Route 4: Jkt→Bdg→Smg→Y→S  7.67jam Rp382k │
└──────────────────────────────────────────┘

Kalau pakai Dijkstra: hanya Route 1 yang muncul.
User tidak bisa lihat Route 3 yang LEBIH MURAH!
```

### Alasan 2: Graph-nya Kecil

```
Program kamu: maksimal ~20-30 pin di peta Indonesia
→ DFS sangat cepat untuk graph sekecil ini
→ Dijkstra overkill (berlebihan)
```

### Alasan 3: Kode Lebih Simpel

```
DFS kamu hanya ~20 baris:
    var dfs = function(cur, path) {
        if (cur === tp.id) { ... return; }
        for (koneksi) {
            if (belum dikunjungi) {
                tandai → push → dfs → pop → un-tandai
            }
        }
    };

Dijkstra butuh ~40+ baris:
    Butuh priority queue
    Butuh array jarak
    Butuh array prev (untuk trace jalur)
    Butuh loop while
    Lebih rumit dan lebih susah dipahami
```

### Alasan 4: Bisa Sort Berbeda

```
DFS + sortMode:
  sortMode = 'fastest'  → sort routes by durasi
  sortMode = 'cheapest' → sort routes by biaya

  User bisa switch! Karena SEMUA jalur sudah dicari.

Dijkstra:
  Hanya bisa optimasi 1 kriteria.
  Mau cari tercepat DAN termurah? Harus jalan Dijkstra 2x.
```

---

## BONUS: KODE DIJKSTRA (KALAU MAU IMPLEMENT)

Ini kode Dijkstra yang **TIDAK DIPAKAI** di program kamu, tapi biar kamu tahu bentuknya:

```javascript
// DIJKSTRA — cari 1 jalur terpendek saja
dijkstra(fromId, toId, mode) {
    // mode = 'fastest' atau 'cheapest'
    
    // Step 1: Inisialisasi
    var dist = {};   // jarak terpendek dari from ke setiap node
    var prev = {};   // node sebelumnya di jalur terpendek
    var visited = {};
    
    // Set semua jarak = Infinity
    for (var i = 0; i < this.pins.length; i++) {
        dist[this.pins[i].id] = Infinity;
        prev[this.pins[i].id] = null;
    }
    dist[fromId] = 0;  // jarak ke diri sendiri = 0
    
    // Step 2: Loop utama
    while (true) {
        // Cari node dengan jarak terpendek yang belum diproses
        var cur = null, curDist = Infinity;
        for (var id in dist) {
            if (!visited[id] && dist[id] < curDist) {
                cur = id;
                curDist = dist[id];
            }
        }
        
        // Tidak ada lagi yang bisa diproses
        if (cur === null) break;
        
        // Sudah sampai tujuan?
        if (cur === toId) break;
        
        // Tandai sudah diproses
        visited[cur] = true;
        
        // Step 3: Update tetangga
        for (var i = 0; i < this.conns.length; i++) {
            var c = this.conns[i], next = null;
            if (c.fromId === cur) next = c.toId;
            else if (c.toId === cur) next = c.fromId;
            
            if (next && !visited[next]) {
                // Pilih transport terbaik di koneksi ini
                for (var j = 0; j < c.transports.length; j++) {
                    var t = c.transports[j];
                    var cfg = App.TR[t.mode];
                    var weight = mode === 'fastest' 
                        ? t.distance / cfg.speed    // waktu tempuh
                        : t.distance * cfg.cost;    // biaya
                    
                    var newDist = dist[cur] + weight;
                    if (newDist < dist[next]) {
                        dist[next] = newDist;       // UPDATE! Jalur lebih pendek ditemukan
                        prev[next] = cur;           // Catat: "ke next, via cur"
                    }
                }
            }
        }
    }
    
    // Step 4: Trace balik jalur
    var path = [];
    var node = toId;
    while (node !== null) {
        path.unshift(node);    // Tambah ke depan array
        node = prev[node];
    }
    
    return {
        distance: dist[toId],
        path: path              // ['p1', 'p3', 'p4'] = Jakarta → Semarang → Surabaya
    };
}
```

**Perbandingan jumlah kode:**

```
DFS di program kamu:   ~20 baris (di dalam searchRoutes)
Dijkstra di atas:      ~50 baris

DFS mengembalikan:     SEMUA jalur (bisa 4-10 jalur)
Dijkstra mengembalikan: 1 jalur terpendek saja
```

---

## RINGKASAN AKHIR

```
┌─────────────────────────────────────────────────────────┐
│                    GRAPH                                 │
│  = Titik-titik (nodes) + Garis penghubung (edges)       │
│  Di program kamu: pins[] + conns[]                      │
├─────────────────────────────────────────────────────────┤
│                     DFS                                  │
│  = Cari SEMUA jalur                                      │
│  = Masuk sedalam mungkin → mentok → balik → coba lain   │
│  = Program kamu PAKAI INI ✅                             │
│  = Kelebihan: simpel, semua jalur, bisa sort berbeda    │
├─────────────────────────────────────────────────────────┤
│                   DIJKSTRA                               │
│  = Cari 1 jalur TERPENDEK                               │
│  = Selalu pilih yang terdekat dulu                       │
│  = Program kamu TIDAK PAKAI ❌                           │
│  = Kelebihan: cepat, pasti optimal                      │
│  = Kekurangan: cuma 1 hasil, kode lebih rumit           │
└─────────────────────────────────────────────────────────┘

Kesimpulan:
DFS cocok untuk program kamu karena:
1. Graph kecil (~20 node) → cepat
2. User butuh SEMUA pilihan rute
3. Bisa sort fastest/cheapest tanpa jalan ulang
4. Kode lebih simpel dan mudah dipahami
```
