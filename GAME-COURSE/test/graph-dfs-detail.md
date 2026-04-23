# 🧠 GRAPH & DFS — Penjelasan SUPER DETAIL dari app.js Kamu

> Dokumen ini menjelaskan setiap baris kode yang berhubungan dengan **Graph** dan **DFS** di file `app.js` kamu — menggunakan **dummy data yang kamu tulis sendiri**.

---

## 📌 DAFTAR ISI

1. [Graph kamu dipetakan dari data apa?](#1-graph-dari-data-kamu)
2. [Adjacency List — siapa tetangga siapa?](#2-adjacency-list)
3. [DFS: searchRoutes() baris per baris](#3-dfs-searchroutes)
4. [Simulasi DFS: Jakarta → Surabaya (13 langkah)](#4-simulasi-dfs)
5. [Perhitungan waktu & biaya per rute](#5-perhitungan)
6. [showRoutes(): sorting & tampilan](#6-showroutes)

---

## 1. GRAPH DARI DATA KAMU

### Kode di app.js (baris 52-113)

Kamu sudah tulis dummy data ini:

```javascript
// NODE (VERTEX) — 5 kota
this.pins = [
    { id: "p1", name: "Jakarta",    x: 200, y: 280 },
    { id: "p2", name: "Bandung",    x: 280, y: 300 },
    { id: "p3", name: "Semarang",   x: 380, y: 290 },
    { id: "p4", name: "Surabaya",   x: 500, y: 300 },
    { id: "p5", name: "Yogyakarta", x: 350, y: 320 },
];

// EDGE (CONNECTION) — 6 jalur
this.conns = [
    c1: Jakarta ↔ Bandung     [train 150km, bus 150km]    ← 2 transport!
    c2: Bandung ↔ Semarang    [train 300km]
    c3: Jakarta ↔ Yogyakarta  [airplane 500km]
    c4: Yogyakarta ↔ Surabaya [bus 300km]
    c5: Semarang ↔ Surabaya   [train 350km]
    c6: Semarang ↔ Yogyakarta [bus 120km]
];
```

### Visualisasi Graph

```
                  c2 (train 300km)
    Jakarta ─────────────────────── [ TIDAK! Jakarta ↔ Semarang tidak ada! ]
       │  ╲
       │   ╲ c3 (airplane 500km)
       │    ╲
       │     ╲
  c1   │      Yogyakarta(p5)
train  │     ╱    │
150km  │   ╱      │ c4 (bus 300km)
 bus   │ ╱  c6    │
150km  │╱ (bus    │
    Bandung      Surabaya(p4)
      (p2)      ╱
       │      ╱
       │    ╱ c5 (train 350km)
       │  ╱
    Semarang(p3)
```

**Lebih rapi:**

```
    Jakarta(p1) ──c1──── Bandung(p2)
         │                  │
        c3                 c2
         │                  │
    Yogyakarta(p5) ─c6── Semarang(p3)
         │                  │
        c4                 c5
         │                  │
         └──── Surabaya(p4) ┘
```

---

## 2. ADJACENCY LIST — Siapa Tetangga Siapa?

Ini KUNCI memahami graph. Dari `this.conns`, kita bisa bangun tabel:

| Node | Terhubung via | Tetangga |
|------|---------------|----------|
| **Jakarta (p1)** | c1 (→p2), c3 (→p5) | Bandung, Yogyakarta |
| **Bandung (p2)** | c1 (→p1), c2 (→p3) | Jakarta, Semarang |
| **Semarang (p3)** | c2 (→p2), c5 (→p4), c6 (→p5) | Bandung, Surabaya, Yogyakarta |
| **Surabaya (p4)** | c4 (→p5), c5 (→p3) | Yogyakarta, Semarang |
| **Yogyakarta (p5)** | c3 (→p1), c4 (→p4), c6 (→p3) | Jakarta, Surabaya, Semarang |

### Bagaimana kode cari tetangga?

```javascript
// Baris 667-674 di app.js:
for (var i = 0; i < self.conns.length; i++) {
    var c = self.conns[i];
    var next = null;

    if (c.fromId === cur) next = c.toId;       // koneksi DARI node ini
    else if (c.toId === cur) next = c.fromId;   // koneksi KE node ini
}
```

**Contoh: cur = "p1" (Jakarta)**

```
Loop semua 6 koneksi:

i=0: c1 → fromId="p1" === "p1"  ✅  → next = "p2" (Bandung)
i=1: c2 → fromId="p2" !== "p1", toId="p3" !== "p1"  → next = null (skip)
i=2: c3 → fromId="p1" === "p1"  ✅  → next = "p5" (Yogyakarta)
i=3: c4 → fromId="p5" !== "p1", toId="p4" !== "p1"  → next = null (skip)
i=4: c5 → fromId="p3" !== "p1", toId="p4" !== "p1"  → next = null (skip)
i=5: c6 → fromId="p3" !== "p1", toId="p5" !== "p1"  → next = null (skip)

Tetangga Jakarta: [Bandung(p2), Yogyakarta(p5)]  ✅ cocok sama tabel!
```

**Contoh: cur = "p3" (Semarang)**

```
i=0: c1 → p1,p2 — bukan p3 → skip
i=1: c2 → fromId="p2", toId="p3" === "p3" ✅ → next = "p2" (Bandung)
i=2: c3 → p1,p5 — bukan p3 → skip
i=3: c4 → p5,p4 — bukan p3 → skip
i=4: c5 → fromId="p3" === "p3" ✅ → next = "p4" (Surabaya)
i=5: c6 → fromId="p3" === "p3" ✅ → next = "p5" (Yogyakarta)

Tetangga Semarang: [Bandung(p2), Surabaya(p4), Yogyakarta(p5)]  ✅
```

**Kenapa cek 2 arah (fromId DAN toId)?**
→ Karena graph UNDIRECTED. C1 = Jakarta→Bandung, tapi Bandung→Jakarta juga valid. Kalau hanya cek `fromId`, Bandung tidak bisa balik ke Jakarta.

---

## 3. DFS: searchRoutes() BARIS PER BARIS

### Baris 585-597: Persiapan

```javascript
searchRoutes() {
    var self = this;   // ← simpan referensi App (untuk dipakai di dalam fungsi dfs)

    var fp = null;     // from pin (pin asal)
    var tp = null;     // to pin (pin tujuan)

    // Loop semua pin, cari yang namanya cocok dengan input user
    for (var i = 0; i < this.pins.length; i++) {
        if (this.pins[i].name === this.inFrom.value.trim()) fp = this.pins[i];
        if (this.pins[i].name === this.inTo.value.trim()) tp = this.pins[i];
    }

    if (!fp || !tp) return;   // kalau tidak ketemu, stop
```

**Contoh:** User ketik From="Jakarta", To="Surabaya"

```
Loop pins:
  i=0: "Jakarta" === "Jakarta" ✅ → fp = { id:"p1", name:"Jakarta", ... }
  i=1: "Bandung" === "Jakarta" ❌, "Bandung" === "Surabaya" ❌
  i=2: "Semarang" — skip
  i=3: "Surabaya" === "Surabaya" ✅ → tp = { id:"p4", name:"Surabaya", ... }
  i=4: "Yogyakarta" — skip

fp = pin Jakarta (p1)
tp = pin Surabaya (p4)
```

### Baris 599-608: Reset & Visited

```javascript
    this.routes = [];        // Kosongkan hasil sebelumnya

    var vis = {};             // Object kosong untuk tracking visited
    vis[fp.id] = true;        // vis = { "p1": true }
```

**`vis` (visited)** mencegah loop tak terbatas:

```
TANPA visited:
Jakarta → Bandung → Jakarta → Bandung → Jakarta → ... (LOOP SELAMANYA! ❌)

DENGAN visited:
Jakarta → Bandung → (Jakarta sudah visited, SKIP) → Semarang → ...  ✅
```

### Baris 613: Fungsi DFS

```javascript
    var dfs = function (cur, path) {
```

**Parameter:**
- `cur` = ID pin di mana kita "berdiri" sekarang
- `path` = array langkah-langkah yang sudah diambil

### Baris 614-661: BASE CASE — Sampai Tujuan!

```javascript
        if (cur === tp.id) {
```

Kalau `cur` (posisi sekarang) === `tp.id` (tujuan), berarti JALUR DITEMUKAN!

**Lalu hitung total waktu & biaya:**

```javascript
            var dur = 0;       // total durasi (jam)
            var cost = 0;      // total biaya (Rp)
            var steps = [];    // teks langkah-langkah

            for (var i = 0; i < path.length; i++) {
                var s = path[i];              // 1 langkah
                var tr = s.conn.transports;   // transport yang tersedia di langkah ini
```

**`s` (step)** berisi:
```javascript
{
    from: "p1",              // ID pin asal (Jakarta)
    to: "p2",                // ID pin tujuan (Bandung)
    conn: { id:"c1", ... }   // objek koneksi lengkap (termasuk transports)
}
```

**Pilih transport terbaik:**

```javascript
                var best = tr[0];            // mulai dari transport pertama
                var bestVal = Infinity;       // nilai terbaik (∞ = pasti kalah)

                for (var j = 0; j < tr.length; j++) {
                    var cfg = App.TR[tr[j].mode];   // ambil config transport
                    var val = self.sortMode === "fastest"
                        ? tr[j].distance / cfg.speed    // waktu = jarak ÷ kecepatan
                        : tr[j].distance * cfg.cost;    // biaya = jarak × biaya/km

                    if (val < bestVal) {
                        bestVal = val;
                        best = tr[j];     // transport ini lebih baik!
                    }
                }
```

**Contoh: c1 punya 2 transport (Jakarta↔Bandung, sortMode="fastest")**

```
tr = [{ mode:"train", distance:150 }, { mode:"bus", distance:150 }]

j=0: cfg = App.TR["train"] = { speed:120, cost:500 }
     val = 150 / 120 = 1.25 jam
     1.25 < Infinity → best = train, bestVal = 1.25

j=1: cfg = App.TR["bus"] = { speed:80, cost:100 }
     val = 150 / 80 = 1.875 jam
     1.875 < 1.25? NO → best tetap train

Hasil: best = { mode:"train", distance:150 }  ← train lebih cepat!
```

**Kalau sortMode="cheapest":**

```
j=0: cfg = App.TR["train"] → val = 150 × 500 = 75,000
j=1: cfg = App.TR["bus"]   → val = 150 × 100 = 15,000
     15,000 < 75,000 → best = bus

Hasil: best = { mode:"bus", distance:150 }  ← bus lebih murah!
```

**Lalu hitung total:**

```javascript
                var cfg = App.TR[best.mode];
                dur += best.distance / cfg.speed;        // tambah durasi
                cost += best.distance * cfg.cost;        // tambah biaya
                steps.push(from + " → " + to + " (" + cfg.label + ", " + best.distance + "km)");
```

### Baris 663-700: EKSPLORASI TETANGGA + BACKTRACKING

```javascript
        // Loop semua edge untuk cari tetangga
        for (var i = 0; i < self.conns.length; i++) {
            var c = self.conns[i];
            var next = null;

            // Cek apakah edge ini terhubung ke node saat ini (2 ARAH!)
            if (c.fromId === cur) next = c.toId;
            else if (c.toId === cur) next = c.fromId;

            // Kalau ada tetangga DAN belum dikunjungi
            if (next && !vis[next]) {
                vis[next] = true;                  // 1. TANDAI visited
                path.push({ from: cur, to: next, conn: c });  // 2. CATAT langkah
                dfs(next, path);                   // 3. REKURSI ke tetangga

                // BACKTRACKING:
                path.pop();                        // 4. HAPUS langkah terakhir
                delete vis[next];                  // 5. UN-VISIT (bisa dicoba dari jalan lain)
            }
        }
```

**BACKTRACKING adalah KUNCI DFS!**

```
TANPA backtracking:
  Jakarta → Bandung → Semarang → Surabaya ✅ (1 rute saja)
  SELESAI. Tidak bisa cari rute lain.

DENGAN backtracking:
  Jakarta → Bandung → Semarang → Surabaya ✅ (rute 1)
  BALIK ke Semarang → Yogyakarta → Surabaya ✅ (rute 2)
  BALIK ke Bandung, BALIK ke Jakarta
  Jakarta → Yogyakarta → Surabaya ✅ (rute 3)
  Jakarta → Yogyakarta → Semarang → Surabaya ✅ (rute 4)
  ...dst
```

---

## 4. SIMULASI DFS: Jakarta → Surabaya

### Graph yang dipakai:

```
    Jakarta(p1) ──c1── Bandung(p2) ──c2── Semarang(p3)
         │                                  │       │
        c3                                 c5      c6
         │                                  │       │
    Yogyakarta(p5) ──────c4────── Surabaya(p4)     │
         │                                          │
         └────────────────c6──────────────────────┘
```

### Langkah 1: Mulai di Jakarta (p1)

```
State:
  cur  = "p1" (Jakarta)
  path = []
  vis  = { p1: true }
  routes = []

Cari tetangga p1:
  c1: fromId=p1 → next=p2 (Bandung) ✅
  c3: fromId=p1 → next=p5 (Yogyakarta) ✅
  → Tetangga: [p2, p5]

Pilih p2 (Bandung) dulu...
```

### Langkah 2: Masuk ke Bandung (p2)

```
vis[p2] = true
path.push({ from:"p1", to:"p2", conn:c1 })
dfs("p2", path)

State:
  cur  = "p2" (Bandung)
  path = [{ Jakarta→Bandung via c1 }]
  vis  = { p1:true, p2:true }

Cari tetangga p2:
  c1: toId=p2 → next=p1 (Jakarta) → vis[p1]=true ❌ SKIP (sudah visited!)
  c2: fromId=p2 → next=p3 (Semarang) ✅
  → Tetangga yang bisa: [p3]
```

### Langkah 3: Masuk ke Semarang (p3)

```
vis[p3] = true
path.push({ from:"p2", to:"p3", conn:c2 })
dfs("p3", path)

State:
  cur  = "p3" (Semarang)
  path = [{ Jkt→Bdg, c1 }, { Bdg→Smg, c2 }]
  vis  = { p1:true, p2:true, p3:true }

Cari tetangga p3:
  c2: toId=p3 → next=p2 (Bandung) → vis[p2]=true ❌ SKIP
  c5: fromId=p3 → next=p4 (Surabaya) ✅
  c6: fromId=p3 → next=p5 (Yogyakarta) ✅
  → Tetangga: [p4, p5]

Pilih p4 (Surabaya) dulu...
```

### Langkah 4: Masuk ke Surabaya (p4) — TUJUAN! 🎉

```
vis[p4] = true
path.push({ from:"p3", to:"p4", conn:c5 })
dfs("p4", path)

cur === tp.id → "p4" === "p4" → TRUE! JALUR DITEMUKAN!

path = [
  { from:"p1", to:"p2", conn:c1 }   // Jakarta → Bandung [train 150, bus 150]
  { from:"p2", to:"p3", conn:c2 }   // Bandung → Semarang [train 300]
  { from:"p3", to:"p4", conn:c5 }   // Semarang → Surabaya [train 350]
]

Hitung (sortMode="fastest"):
  Step 0: c1 → train(150/120=1.25h) vs bus(150/80=1.875h) → best=train → dur=1.25, cost=75000
  Step 1: c2 → train(300/120=2.5h) → dur=2.5, cost=150000  
  Step 2: c5 → train(350/120=2.917h) → dur=2.917, cost=175000

  TOTAL: dur=6.667h, cost=Rp400,000

✅ RUTE 1: Jakarta→Bandung→Semarang→Surabaya (6h40m, Rp400.000)
```

### Langkah 5: BACKTRACK dari Surabaya ke Semarang

```
return dari dfs("p4")
path.pop()         → path = [{ Jkt→Bdg }, { Bdg→Smg }]
delete vis["p4"]   → vis = { p1:true, p2:true, p3:true }
                                                 ↑ p4 BISA dikunjungi lagi!
```

### Langkah 6: Di Semarang, coba tetangga berikutnya → Yogyakarta (p5)

```
next = p5, vis[p5] = false → BISA!
vis[p5] = true
path.push({ from:"p3", to:"p5", conn:c6 })
dfs("p5", path)

State:
  cur  = "p5" (Yogyakarta)
  path = [{ Jkt→Bdg }, { Bdg→Smg }, { Smg→Ygy via c6 }]
  vis  = { p1:true, p2:true, p3:true, p5:true }

Cari tetangga p5:
  c3: toId=p5 → next=p1 (Jakarta) → vis[p1]=true ❌
  c4: fromId=p5 → next=p4 (Surabaya) → vis[p4]=false ✅
  c6: toId=p5 → next=p3 (Semarang) → vis[p3]=true ❌
  → Tetangga: [p4]
```

### Langkah 7: Masuk ke Surabaya (p4) — TUJUAN LAGI! 🎉

```
path = [{ Jkt→Bdg,c1 }, { Bdg→Smg,c2 }, { Smg→Ygy,c6 }, { Ygy→Sby,c4 }]

Hitung:
  Step 0: c1 → train 150km → 1.25h, Rp75,000
  Step 1: c2 → train 300km → 2.5h, Rp150,000
  Step 2: c6 → bus 120km → 1.5h, Rp12,000
  Step 3: c4 → bus 300km → 3.75h, Rp30,000

  TOTAL: dur=9.0h, cost=Rp267,000

✅ RUTE 2: Jakarta→Bandung→Semarang→Yogyakarta→Surabaya (9h, Rp267.000)
```

### Langkah 8-9: Backtrack sampai Jakarta

```
BACKTRACK dari Surabaya → Yogyakarta → pop, delete vis[p4]
BACKTRACK dari Yogyakarta → Semarang → pop, delete vis[p5]
BACKTRACK dari Semarang → Bandung → pop, delete vis[p3]
BACKTRACK dari Bandung → Jakarta → pop, delete vis[p2]

Sekarang kembali ke Jakarta, coba tetangga berikutnya!
```

### Langkah 10: Jakarta → Yogyakarta (p5) langsung via c3

```
next = p5, vis[p5] = false → BISA!
vis[p5] = true
path.push({ from:"p1", to:"p5", conn:c3 })
dfs("p5", path)

State: cur="p5", path=[{ Jkt→Ygy via c3 }], vis={p1,p5}

Tetangga p5:
  c3: next=p1 → visited ❌
  c4: next=p4 → OK ✅
  c6: next=p3 → OK ✅

Pilih p4 (Surabaya) dulu...
```

### Langkah 11: Yogyakarta → Surabaya — TUJUAN! 🎉

```
path = [{ Jkt→Ygy,c3 }, { Ygy→Sby,c4 }]

Hitung:
  Step 0: c3 → airplane 500km → 500/800=0.625h, 500×1000=Rp500,000
  Step 1: c4 → bus 300km → 300/80=3.75h, 300×100=Rp30,000

  TOTAL: dur=4.375h, cost=Rp530,000

✅ RUTE 3: Jakarta→Yogyakarta→Surabaya (4h22m, Rp530.000)
```

### Langkah 12: Backtrack, lalu Yogyakarta → Semarang → Surabaya

```
Backtrack dari Surabaya, coba Semarang (p3)

path = [{ Jkt→Ygy,c3 }, { Ygy→Smg,c6 }]
dfs("p3"), dari Semarang:
  Tetangga: p2(Bandung) ✅, p4(Surabaya) ✅

  → p4: TUJUAN!
  path = [{ Jkt→Ygy,c3 }, { Ygy→Smg,c6 }, { Smg→Sby,c5 }]

  Hitung:
    Step 0: airplane 500km → 0.625h, Rp500,000
    Step 1: bus 120km → 1.5h, Rp12,000
    Step 2: train 350km → 2.917h, Rp175,000

    TOTAL: dur=5.042h, cost=Rp687,000

  ✅ RUTE 4: Jakarta→Yogyakarta→Semarang→Surabaya (5h2m, Rp687.000)
```

### Langkah 13: Backtrack lagi, Semarang → Bandung → ???

```
Dari Semarang, coba p2 (Bandung)
  Dari Bandung, tetangga: p1(Jakarta) → visited ❌
  MENTOK! Tidak ada jalan lain ke Surabaya.
  → Tidak ada rute baru ditemukan.
```

### HASIL AKHIR: 4 Rute Ditemukan!

```
┌────┬──────────────────────────────────────────────┬─────────┬────────────┐
│ #  │ Rute                                          │ Waktu   │ Biaya      │
├────┼──────────────────────────────────────────────┼─────────┼────────────┤
│ 1  │ Jakarta → Bandung → Semarang → Surabaya      │  6.67h  │ Rp400,000  │
│ 2  │ Jakarta → Bdg → Smg → Yogya → Surabaya       │  9.00h  │ Rp267,000  │
│ 3  │ Jakarta → Yogyakarta → Surabaya               │  4.38h  │ Rp530,000  │
│ 4  │ Jakarta → Yogya → Semarang → Surabaya         │  5.04h  │ Rp687,000  │
└────┴──────────────────────────────────────────────┴─────────┴────────────┘

Sort by FASTEST:  3 → 4 → 1 → 2
Sort by CHEAPEST: 2 → 1 → 3 → 4
```

**Perhatikan:**
- Rute 3 PALING CEPAT (4.38h) — karena pakai airplane Jakarta→Yogya
- Rute 2 PALING MURAH (Rp267.000) — karena pakai bus yang murah
- User jadi punya PILIHAN! Ini keunggulan DFS: menampilkan SEMUA opsi

---

## 5. PERHITUNGAN WAKTU & BIAYA

### Rumus

```
WAKTU (jam)  = jarak (km) ÷ kecepatan (km/jam)
BIAYA (Rp)   = jarak (km) × biaya per km (Rp/km)
```

### Tabel Transport dari App.TR

| Transport | Speed (km/h) | Cost (Rp/km) | Warna |
|-----------|-------------|---------------|-------|
| Train     | 120         | 500           | Hijau |
| Bus       | 80          | 100           | Ungu  |
| Airplane  | 800         | 1000          | Hitam |

### Contoh Perhitungan Rute 3 (Jakarta→Yogya→Surabaya)

```
Step 1: Jakarta → Yogyakarta via c3 (airplane, 500km)
  waktu = 500 / 800 = 0.625 jam = 37 menit 30 detik
  biaya = 500 × 1000 = Rp500,000

Step 2: Yogyakarta → Surabaya via c4 (bus, 300km)
  waktu = 300 / 80 = 3.75 jam = 3 jam 45 menit
  biaya = 300 × 100 = Rp30,000

TOTAL:
  waktu = 0.625 + 3.75 = 4.375 jam
  biaya = 500,000 + 30,000 = Rp530,000

Konversi waktu untuk tampilan:
  hh = Math.floor(4.375) = 4
  mm = Math.round((4.375 - 4) × 60) = Math.round(22.5) = 23
  → "4h 23min"
```

---

## 6. showRoutes(): SORTING & TAMPILAN

### Baris 714-745: Kode lengkap

```javascript
showRoutes() {
    var sorted = this.routes
        .slice()                    // copy array (supaya asli tidak berubah)
        .sort(function (a, b) {
            return this.sortMode === "fastest"
                ? a.dur - b.dur     // urutkan durasi ascending
                : a.cost - b.cost;  // urutkan biaya ascending
        }.bind(this))
        .slice(0, 10);              // ambil max 10 rute
```

**Contoh sort "fastest":**

```
SEBELUM sort:
  routes = [
    { dur: 6.67, cost: 400000 },   // Rute 1
    { dur: 9.00, cost: 267000 },   // Rute 2
    { dur: 4.38, cost: 530000 },   // Rute 3
    { dur: 5.04, cost: 687000 },   // Rute 4
  ]

sort(a.dur - b.dur):
  4.38 - 6.67 = -2.29 → negatif → 3 di depan 1
  4.38 - 9.00 = -4.62 → negatif → 3 di depan 2
  4.38 - 5.04 = -0.66 → negatif → 3 di depan 4
  5.04 - 6.67 = -1.63 → negatif → 4 di depan 1
  ... dst

SESUDAH sort:
  sorted = [
    { dur: 4.38 },   // Rute 3 ← TERCEPAT
    { dur: 5.04 },   // Rute 4
    { dur: 6.67 },   // Rute 1
    { dur: 9.00 },   // Rute 2 ← TERLAMBAT
  ]
```

### Format tampilan:

```javascript
    var hh = Math.floor(r.dur);                    // jam bulat ke bawah
    var mm = Math.round((r.dur - hh) * 60);        // sisa → menit
    var waktu = hh ? hh + "h " + mm + "min" : mm + "min";
```

```
dur = 4.375
hh  = Math.floor(4.375) = 4
mm  = Math.round((4.375 - 4) × 60) = Math.round(22.5) = 23
→ "4h 23min"

dur = 0.625
hh  = Math.floor(0.625) = 0
mm  = Math.round(0.625 × 60) = Math.round(37.5) = 38
→ hh ? ... : mm + "min" → "38min" (karena hh=0 = falsy)
```

```javascript
    r.cost.toLocaleString("id-ID")
    // 530000 → "530.000"
    // 267000 → "267.000"
```

### HTML yang dihasilkan:

```html
<div class="route-card">
  <div class="steps">
    <div>1. Jakarta → Yogyakarta (Airplane, 500km)</div>
    <div>2. Yogyakarta → Surabaya (Bus, 300km)</div>
  </div>
  <div class="info">
    <span>4h 23min</span>
    <span>Rp530.000</span>
  </div>
</div>
```

---

## RINGKASAN

```
📊 DATA KAMU:
   5 NODE (kota) + 6 EDGE (jalur) = Graph Undirected Weighted

🔁 DFS MENEMUKAN:
   4 rute dari Jakarta ke Surabaya

📈 SORTING:
   Fastest → Rute 3 (4h22m, via airplane)
   Cheapest → Rute 2 (Rp267k, via bus+train)

🔑 KUNCI DFS:
   1. vis = {} → anti loop
   2. vis[next] = true → tandai visited
   3. dfs(next, path) → rekursi masuk lebih dalam
   4. path.pop() → backtrack (mundur)
   5. delete vis[next] → un-visit (bisa dicoba lagi)
```
