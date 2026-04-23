// RUMUS DASAR (hafal ini):
//   layar = peta × scale + ox    → "peta ke layar"
//   peta  = (layar - ox) / scale → "layar ke peta" (dibalik)

// ZOOM:
//   1. Cari px,py = titik peta di bawah cursor     → (mx - ox) / scale
//   2. Update scale baru
//   3. Hitung ox baru supaya px tetap di mx        → ox = mx - px × scale_baru

// DRAG:
//   mousedown → simpan sox (ox awal) dan dragX (mouse awal)
//   mousemove → ox = sox + (mouse_sekarang - dragX)
//   mouseup   → selesai

// KENAPA DIKALI SCALE?
//   → Karena saat peta diperbesar, semua jarak dari pojok ikut membesar

// KENAPA DIBAGI SCALE?
//   → Karena kita membalik rumus perkalian untuk dapat koordinat peta

// KENAPA TAMBAH ox?
//   → Karena peta mungkin sudah digeser, harus dikompensasi
// STRUKTUR UTAMA:
// ----------------
// 🔵 GRAPH    = this.pins (node) + this.conns (edge)
// 🔁 DFS      = searchRoutes() → fungsi dfs()
// 🎨 CANVAS   = renderLines() → gambar garis
// 🖱️ EVENT    = setup() → semua interaksi user
// 💾 STORAGE  = save() & load() → localStorage
// 🔍 ZOOM/PAN = zoom(), apply(), fit(), toMap()
//
// ========================================

class App {
  // ============================
  // KONSTANTA
  // ============================
  // Ukuran peta dasar
  static MW = 982;
  static MH = 450;

  // Konfigurasi transportasi (untuk hitung waktu & biaya)
  static TR = {
    train: { color: "#33E339", speed: 120, cost: 500, label: "Train" }, 
    bus: { color: "#A83BE8", speed: 80, cost: 100, label: "Bus" },
    airplane: { color: "#000000", speed: 800, cost: 1000, label: "Airplane" },
  };

  constructor() {
    // ============================
    // 🔵 GRAPH STRUCTURE
    // ============================
    //
    // Graph terdiri dari 2 bagian:
    // 1. NODE (vertex) = this.pins
    // 2. EDGE (connection) = this.conns
    //
    // Ini adalah struktur data utama yang menyimpan
    // semua titik dan hubungan antar titik

    // ------------------------------------
    // 🔵 NODE (VERTEX) - Titik/Kota
    // ------------------------------------
    // Setiap pin punya:
    // - id: identifier unik
    // - name: nama lokasi
    // - x, y: koordinat di peta
    //
    // DUMMY DATA untuk demo:
    this.pins = [
      { id: "p1", name: "Jakarta", x: 200, y: 280 },
      { id: "p2", name: "Bandung", x: 280, y: 300 },
      { id: "p3", name: "Semarang", x: 380, y: 290 },
      { id: "p4", name: "Surabaya", x: 500, y: 300 },
      { id: "p5", name: "Yogyakarta", x: 350, y: 320 },
    ];

    // ------------------------------------
    // 🔗 EDGE (CONNECTION) - Jalur/Rute
    // ------------------------------------
    // Setiap koneksi punya:
    // - id: identifier unik
    // - fromId: id pin asal
    // - toId: id pin tujuan
    // - transports: array moda transportasi
    //
    // Setiap transport punya:
    // - mode: 'train' / 'bus' / 'airplane'
    // - distance: jarak dalam km
    //
    // DUMMY DATA untuk demo:
    this.conns = [
      {
        id: "c1",
        fromId: "p1", // Jakarta
        toId: "p2", // Bandung
        transports: [
          { mode: "train", distance: 150 },
          { mode: "bus", distance: 150 },
        ],
      },
      {
        id: "c2",
        fromId: "p2", // Bandung
        toId: "p3", // Semarang
        transports: [{ mode: "train", distance: 300 }],
      },
      {
        id: "c3",
        fromId: "p1", // Jakarta
        toId: "p5", // Yogyakarta
        transports: [{ mode: "airplane", distance: 500 }],
      },
      {
        id: "c4",
        fromId: "p5", // Yogyakarta
        toId: "p4", // Surabaya
        transports: [{ mode: "bus", distance: 300 }],
      },
      {
        id: "c5",
        fromId: "p3", // Semarang
        toId: "p4", // Surabaya
        transports: [{ mode: "train", distance: 350 }],
      },
      {
        id: "c6",
        fromId: "p3", // Semarang
        toId: "p5", // Yogyakarta
        transports: [{ mode: "bus", distance: 120 }],
      },
    ];

    // ============================
    // STATE UNTUK ZOOM & PAN
    // ============================
    this.scale = 1; // level zoom
    this.ox = 0; // offset x (geser horizontal)
    this.oy = 0; // offset y (geser vertikal)
    this.dragging = false; // sedang di-drag?
    this.dragX = 0; // posisi mouse saat mulai drag
    this.dragY = 0;
    this.sox = 0; // offset awal saat drag
    this.soy = 0;

    // ============================
    // STATE UNTUK KONEKSI
    // ============================
    this.connectFrom = null; // pin asal saat connecting
    this.connectTo = null; // pin tujuan saat connecting
    this.selectedLine = null; // garis yang dipilih

    // ============================
    // STATE UNTUK PENCARIAN RUTE
    // ============================
    this.clickPos = {}; // posisi klik terakhir
    this.sortMode = "fastest"; // mode sorting: 'fastest' atau 'cheapest'
    this.routes = []; // hasil pencarian rute

    // ============================
    // AMBIL ELEMEN DOM
    // ============================
    var $ = function (id) {
      return document.getElementById(id);
    };

    this.area = $("map-area");
    this.container = $("map-container");
    this.canvas = $("lines-layer");
    this.ctx = this.canvas.getContext("2d"); // 🎨 Context untuk gambar
    this.pinsEl = $("pinpoints-layer");
    this.popAdd = $("popup-add");
    this.popConn = $("popup-connect");
    this.inName = $("input-name");
    this.inDist = $("input-distance");
    this.inMode = $("input-mode");
    this.inFrom = $("input-from");
    this.inTo = $("input-to");
    this.btnSearch = $("btn-search");
    this.sortCtrl = $("sort-controls");
    this.results = $("route-results");
    this.panel = $("route-panel");
    this.btnToggle = $("btn-toggle");

    // ============================
    // JALANKAN APLIKASI
    // ============================
    // Untuk demo, kita skip load dari localStorage
    // dan langsung pakai dummy data di atas
    this.load();

    this.fit();
    this.render();
    this.setup();

    // Log untuk debug
    console.log("=== GRAPH STRUCTURE ===");
    console.log("NODES (pins):", this.pins);
    console.log("EDGES (conns):", this.conns);
  }

  // ========================================
  // 💾 SAVE / LOAD (localStorage)
  // ========================================
  // Fungsi ini untuk menyimpan graph ke browser
  // supaya tidak hilang saat refresh


  save() {
    localStorage.setItem("pins", JSON.stringify(this.pins));
    localStorage.setItem("conns", JSON.stringify(this.conns));
  }

  load() {
    this.pins = JSON.parse(localStorage.getItem("pins") || "[]");
    this.conns = JSON.parse(localStorage.getItem("conns") || "[]");
  }

  // ========================================
  // 🔍 TRANSFORM (zoom, pan, fit)
  // ========================================
  // Fungsi-fungsi ini untuk manipulasi view peta

  // Terapkan transformasi ke container
  apply() {
    this.container.style.transform =
      "translate(" +
      this.ox +
      "px," +
      this.oy +
      "px) scale(" +
      this.scale +
      ")";
  }

  // Fit peta ke layar
  fit() {
    var w = this.area.clientWidth;
    var h = this.area.clientHeight;
    this.scale = Math.max(w / App.MW, h / App.MH);
    // jadi si w da h inni itu seharusnya lebih besar ya dri pada si MW solanya MW ini adalahukuran asli si map ya
    // jad di sini itu mau ngasih jadi si ukuan map akan di kali dnengan scale ya tadi yang sce itu dapet dari selisih oailing gede antara h map dan h ukuran layar area, da juga w map dan w ukuran lyar area
    // nah kan jadi gede tuh setelah di kali dengan scale, setelah itu ukuan layar akan di kurangin dnegan si hasil kali ukran map dnegan scale, nah kan kalo miaslnya si map itu lebih gede dri w kan akna minus ya, arrtinya dai akn geser ke kiri untuk x min itu geser kiri ya inget, nah biar ke tengah maka baru bagi ndegn 2 dan giu juga yang oy
    this.ox = (w - App.MW * this.scale) / 2;
    this.oy = (h - App.MH * this.scale) / 2;
  }

  // Zoom ke titik tertentu
  // cx, cy = koordinat mouse
  // f = faktor zoom (>1 = zoom in, <1 = zoom out)
  zoom(cx, cy, f) {
    var r = this.area.getBoundingClientRect();
    var mx = cx - r.left;
    var my = cy - r.top;

    //     Ini adalah rumus balik dari transform CSS. Ingat CSS-nya:
    // css transform: translate(ox, oy) scale(scale)
    // Artinya: titik peta di koordinat (px, py) → muncul di layar di koordinat (px * scale + ox, py * scale + oy).

    // Kita mau balik: dari koordinat layar (mx, my) → cari koordinat peta (px, py):
    var px = (mx - this.ox) / this.scale;
    var py = (my - this.oy) / this.scale;

    // Update scale dengan batas
    this.scale = Math.max(0.3, Math.min(15, this.scale * f));

    // Hitung offset baru supaya zoom ke arah cursor

    // ah jadi setelah ita mendapatkan koordinat peta yaitu px dan py,

    // nah jadi fungisny itu adalh ketiak kita udha update scale itu kan yang posisi titik awal di layer 200 kan kalo di scale nanti akna berubah ya, nah oleh karena itu biar titik di bawah cursor itu engga hilang maka
    // this.ox = mx - px * this.scale;
    // this.oy = my - py * this.scale;
    // SEKARANG: Kenapa zoom() Perlu Hitung Ulang ox?
    // Kita sudah punya rumus:
    // layar_x = peta_x × scale + ox
    // Saat zoom, scale berubah. Kalau ox tidak ikut berubah, maka titik peta yang tadinya ada di bawah cursor akan pindah.
    // Visualisasi masalahnya:
    // SEBELUM ZOOM:
    //   scale=1, ox=0
    //   Jakarta di peta = (200, 280)
    //   Jakarta di layar = 200×1 + 0 = 200  ← cursor ada di sini

    // SETELAH ZOOM (scale jadi 2, ox tetap 0):
    //   Jakarta di layar = 200×2 + 0 = 400  ← JAKARTA PINDAH! Cursor ketinggalan
    // Layar:
    // SEBELUM: (200)
    // SESUDAH:       (400)
    // Cursor:  (200)  ← cursor tidak ikut, Jakarta kabur ke kanan!
    // Solusinya: setelah scale berubah, hitung ox baru supaya titik yang sama tetap di posisi layar yang sama.
    // Kita punya 3 variabel:

    // mx = posisi cursor di layar → TIDAK BERUBAH (cursor tidak pindah)
    // px = posisi titik di peta → TIDAK BERUBAH (titik di peta tidak pindah)
    // scale → BERUBAH
    // ox → harus kita hitung ulang

    // Pakai rumus layar_x = peta_x × scale + ox, kita cari ox:
    // mx = px × scale_baru + ox_baru
    // ox_baru = mx - px × scale_baru
    // Ini persis baris ini di kode:
    // javascriptthis.ox = mx - px * this.scale;  // (scale sudah diupdate)

    this.apply();
  }
  //   SEBELUM ZOOM:
  //   scale = 1.55, ox = -161, oy = 1.5
  //   Mouse di layar: mx = 500, my = 300

  //   Step 1: Titik peta di bawah mouse:
  //     px = (500 - (-161)) / 1.55 = 426
  //     py = (300 - 1.5)    / 1.55 = 192

  //   Step 2: Scale baru (zoom in 1.15x):
  //     scale = 1.55 × 1.15 = 1.7825

  //   Step 3: Offset baru supaya px=426 tetap di mx=500:
  //     ox = 500 - 426 × 1.7825 = 500 - 759.3 = -259.3
  //     oy = 300 - 192 × 1.7825 = 300 - 342.2 = -42.2

  // SETELAH ZOOM:
  //   scale = 1.7825, ox = -259.3, oy = -42.2

  //   Verifikasi: titik px=426 sekarang ada di layar:
  //     layar_x = 426 × 1.7825 + (-259.3) = 759.3 - 259.3 = 500 ✅
  //     layar_y = 192 × 1.7825 + (-42.2)  = 342.2 - 42.2  = 300 ✅
  //   → Titik yang sama tetap di posisi mx=500, my=300 di layar!

  // Konversi koordinat layar ke koordinat peta
  toMap(cx, cy) {
    var r = this.area.getBoundingClientRect();
    return {
      x: (cx - r.left - this.ox) / this.scale,
      y: (cy - r.top - this.oy) / this.scale,
    };
  }

  // ========================================
  // 🎨 RENDER (gambar ulang semua)
  // ========================================

  render() {
    this.renderPins(); // Render semua pin (HTML)
    this.renderLines(); // Render semua garis (Canvas)
    this.apply(); // Terapkan transformasi
  }

  // ------------------------------------
  // 🎨 RENDER PINS (HTML)
  // ------------------------------------
  // Setiap pin di-render sebagai HTML element

  pinHTML(p) {
    var cls = this.connectFrom === p.id ? " connecting" : "";
    return (
      '<div class="pinpoint" style="left:' +
      p.x +
      "px;top:" +
      p.y +
      'px" data-id="' +
      p.id +
      '">' +
      '<div class="pinpoint-label' +
      cls +
      '">' +
      "<span>" +
      p.name +
      "</span>" +
      '<img src="assets/MdiTransitConnectionVariant.svg" class="btn-icon btn-connect" data-id="' +
      p.id +
      '" title="Connect">' +
      '<img src="assets/MdiTrashCanOutline.svg" class="btn-icon btn-delete" data-id="' +
      p.id +
      '" title="Delete">' +
      "</div>" +
      '<div class="pinpoint-marker">' +
      '<svg viewBox="0 0 24 24"><path fill="#E53935" d="M12 12q.825 0 1.413-.587T14 10t-.587-1.412T12 8t-1.412.588T10 10t.588 1.413T12 12m0 10q-4.025-3.425-6.012-6.362T4 10.2q0-3.75 2.413-5.975T12 2t5.588 2.225T20 10.2q0 2.5-1.987 5.438T12 22"/></svg>' +
      "</div>" +
      "</div>"
    );
  }

  renderPins() {
    var html = "";
    for (var i = 0; i < this.pins.length; i++) {
      html += this.pinHTML(this.pins[i]);
    }
    this.pinsEl.innerHTML = html;
  }

  // ------------------------------------
  // 🎨 RENDER LINES (CANVAS)
  // ------------------------------------
  // Semua garis koneksi digambar di canvas
  //
  // Canvas API yang dipakai:
  // - beginPath() = mulai path baru
  // - moveTo(x,y) = pindah ke titik awal
  // - lineTo(x,y) = tarik garis ke titik
  // - stroke()    = gambar garis

  renderLines() {
    var ctx = this.ctx;

    // Reset canvas
    this.canvas.width = App.MW;
    this.canvas.height = App.MH;

    // Loop semua EDGE (koneksi)
    for (var i = 0; i < this.conns.length; i++) {
      var c = this.conns[i];

      // Cari pin asal dan tujuan
      var a = this.findPin(c.fromId);
      var b = this.findPin(c.toId);
      if (!a || !b) continue;

      var n = c.transports.length;

      // Loop semua transport dalam koneksi ini
      //
      for (var j = 0; j < n; j++) {
        var t = c.transports[j];

        // Hitung offset supaya garis paralel tidak numpuk
        var off = this.offset(a, b, j, n);
        var x1 = a.x + off.x;
        var y1 = a.y + off.y;
        var x2 = b.x + off.x;
        var y2 = b.y + off.y;

        // Efek glow untuk garis terpilih
        if (this.selectedLine === c.id) {
          ctx.shadowColor = "rgba(255, 255, 0, 0.8)";
          ctx.shadowBlur = 6;
          ctx.lineWidth = 5;
        } else {
          ctx.shadowColor = "transparent";
          ctx.shadowBlur = 0;
          ctx.lineWidth = 3;
        }

        // 🎨 GAMBAR GARIS
        ctx.beginPath();
        ctx.moveTo(x1, y1); // Titik awal
        ctx.lineTo(x2, y2); // Titik akhir
        ctx.strokeStyle = App.TR[t.mode].color; // Warna berdasarkan transport
        ctx.stroke();

        // Tulis jarak di tengah garis
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
        ctx.fillStyle = App.TR[t.mode].color;
        ctx.font = "bold 11px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(t.distance, (x1 + x2) / 2, (y1 + y2) / 2 - 5);
      }
    }
  }

  // Hitung offset untuk garis paralel
  // Supaya kalau ada >1 transport, garisnya tidak numpuk
  offset(a, b, i, n) {
    // tidak perlu geser kalau cuma 1 transport
    if (n <= 1) return { x: 0, y: 0 };

    // seberapa jauh digeser
    var s = -(n - 1) * 3 + i * 6;
// Ini yang paling membingungkan. Mari kita bedah pelan-pelan.
// Tujuannya: kita mau semua garis tersebar simetris di tengah.
// Bayangkan kamu punya beberapa orang yang mau berdiri berjajar, dan kamu mau mereka berpusat di tengah:
// 1 orang:    [  A  ]          → A di posisi 0
// 2 orang:    [ A B ]          → A di -3, B di +3
// 3 orang:    [ A B C ]        → A di -6, B di 0, C di +6
// Itulah yang dihitung s. Mari kita buktikan dengan angka:
// Kasus n=2 (2 transport):
// i=0: s = -(2-1) × 3 + 0 × 6 = -1×3 + 0 = -3
// i=1: s = -(2-1) × 3 + 1 × 6 = -1×3 + 6 = +3

// Hasil: garis 0 geser -3px, garis 1 geser +3px
// Visualisasi:
//   ─────────────────  (i=0, s=-3, di atas)
//   ─────────────────  (i=1, s=+3, di bawah)
// Kasus n=3 (3 transport):
// i=0: s = -(3-1) × 3 + 0 × 6 = -2×3 + 0  = -6
// i=1: s = -(3-1) × 3 + 1 × 6 = -2×3 + 6  =  0
// i=2: s = -(3-1) × 3 + 2 × 6 = -2×3 + 12 = +6

// Hasil: garis 0 geser -6px, garis 1 tetap di tengah, garis 2 geser +6px
// Visualisasi:
//   ─────────────────  (i=0, s=-6)
//   ─────────────────  (i=1, s= 0)
//   ─────────────────  (i=2, s=+6)
// Kenapa rumusnya -(n-1) × 3 + i × 6?
// -(n-1) × 3  →  ini adalah TITIK MULAI (garis paling kiri/atas)
//                semakin banyak garis, semakin jauh titik mulainya ke kiri

// i × 6       →  ini adalah LANGKAH per garis (tiap garis +6px dari sebelumnya)

// Kenapa 6? Karena jarak antar garis = 6px
// Kenapa -(n-1)×3? Karena titik mulai = -(jumlah_jarak / 2)
//   = -(  (n-1) × 6  / 2  )
//   = -(n-1) × 3
// Visualisasi dengan garis bantu:
// n=3:
//         ← 6px → ← 6px →
//   ──────────────────────  (i=0, s=-6)
//   ──────────────────────  (i=1, s= 0)  ← tengah
//   ──────────────────────  (i=2, s=+6)

// Pusat = 0  
// Jarak antar garis = 6px  
    // CARA PALING SIMPEL:
    // kita tidak hitung "tegak lurus yang sempurna"
    // kita cukup lihat: garis ini lebih horizontal atau lebih vertikal?

    var dx = Math.abs(b.x - a.x); // lebar garis
    var dy = Math.abs(b.y - a.y); // tinggi garis


    // simple aja gitu jadi klao mislanya in lebih lebar dari pada tingi si x nya
    // arinya kna lagi lebar atau garis horizontanl

    // nah makany kita ubha si y nya aja, jadi kebaliakn gitu

    // kalau lebih lebar dari tinggi → garis horizontal
    // → geser ke atas/bawah (ubah y saja)
    if (dx >= dy) {
      return { x: 0, y: s };
    }

    // kalau lebih tinggi dari lebar → garis vertikal
    // → geser ke kiri/kanan (ubah x saja)
    else {
      return { x: s, y: 0 };
    }
  }

  // ========================================
  // 🔵 GRAPH HELPER
  // ========================================

  // Cari pin berdasarkan ID
  findPin(id) {
    for (var i = 0; i < this.pins.length; i++) {
      if (this.pins[i].id === id) return this.pins[i];
    }
    return null;
  }

  // ========================================
  //  ` PINPOINT (tambah, hapus)
  // ========================================
  // Ini adalah operasi pada NODE di graph

  // Tambah node baru ke graph
  addPin(name, x, y) {
    this.pins.push({
      id: "p" + Date.now(),
      name: name,
      x: x,
      y: y,
    });
    this.save();
    this.render();
    this.checkSearch();
  }

  // Hapus node dari graph
  // PENTING: Juga hapus semua edge yang terhubung!
  deletePin(id) {
    // Hapus dari pins (node)
    this.pins = this.pins.filter(function (p) {
      return p.id !== id;
    });

    // Hapus semua koneksi yang terkait (edge)
    this.conns = this.conns.filter(function (c) {
      return c.fromId !== id && c.toId !== id;
    });

    this.save();
    this.render();
    this.checkSearch();
  }

  // ========================================
  // 🔗 KONEKSI (hubungkan pin)
  // ========================================
  // Ini adalah operasi pada EDGE di graph

  // Mulai mode connecting
  startConnect(id) {
    this.connectFrom = this.connectFrom === id ? null : id;
    this.render();
  }

  // Batalkan connecting
  cancelConnect() {
    this.connectFrom = null;
    this.connectTo = null;
    this.render();
  }

  // Submit koneksi baru (tambah edge ke graph)
  submitConnect(dist, mode) {
    // Cek apakah koneksi sudah ada
    var ex = null;
    for (var i = 0; i < this.conns.length; i++) {
      var c = this.conns[i];
      if (
        (c.fromId === this.connectFrom && c.toId === this.connectTo) ||
        (c.fromId === this.connectTo && c.toId === this.connectFrom)
      ) {
        ex = c;
        break;
      }
    }

    if (ex) {
      // Koneksi sudah ada, cek apakah transport sudah ada
      for (var j = 0; j < ex.transports.length; j++) {
        if (ex.transports[j].mode === mode) {
          alert(mode + " sudah ada!");
          return;
        }
      }
      // Tambah transport baru ke koneksi yang ada
      ex.transports.push({ mode: mode, distance: dist });
    } else {
      // Buat koneksi baru (edge baru di graph)
      this.conns.push({
        id: "c" + Date.now(),
        fromId: this.connectFrom,
        toId: this.connectTo,
        transports: [{ mode: mode, distance: dist }],
      });
    }

    this.hidePop(this.popConn);
    this.cancelConnect();
    this.save();
    this.render();
  }

  // ========================================
  // 📏 GARIS (pilih, hapus)
  // ========================================

  selectLine(id) {
    this.selectedLine = this.selectedLine === id ? null : id;
    this.render();
  }

  // Hapus edge dari graph
  deleteLine() {
    if (!this.selectedLine) return;

    this.conns = this.conns.filter(
      function (c) {
        return c.id !== this.selectedLine;
      }.bind(this),
    );

    this.selectedLine = null;
    this.save();
    this.render();
  }

  // Cek apakah klik mengenai garis
  // Pakai canvas isPointInStroke (built-in)
  findClickedLine(e) {
    var pos = this.toMap(e.clientX, e.clientY);
    var ctx = this.ctx;

    for (var i = 0; i < this.conns.length; i++) {
      var c = this.conns[i];
      var a = this.findPin(c.fromId);
      var b = this.findPin(c.toId);
      if (!a || !b) continue;

      ctx.lineWidth = 8 / this.scale;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);

      if (ctx.isPointInStroke(pos.x, pos.y)) {
        return c.id;
      }
    }
    return null;
  }

  // ========================================
  // 🔁 DFS - DEPTH FIRST SEARCH
  // ========================================
  //
  // INI ADALAH INTI DARI PENCARIAN RUTE!
  //
  // DFS bekerja dengan cara:
  // 1. Mulai dari titik awal
  // 2. Tandai sebagai visited connectTo
  // 3. Jelajahi semua tetangga yang belum visited
  // 4. Rekursif ke tetangga
  // 5. Kalau sampai tujuan, simpan rute
  // 6. BACKTRACK (balik) dan coba jalur lain
  //
  // Hasil: SEMUA kemungkinan rute dari A ke B

  // Cek apakah input valid
  checkSearch() {
    var f = this.inFrom.value.trim();
    var t = this.inTo.value.trim();
    var fOk = false;
    var tOk = false;

    for (var i = 0; i < this.pins.length; i++) {
      if (this.pins[i].name === f) fOk = true;
      if (this.pins[i].name === t) tOk = true;
    }

    this.btnSearch.disabled = !(f !== t && fOk && tOk);
  }

  // ------------------------------------
  // 🔁 FUNGSI UTAMA DFS
  // ------------------------------------
  searchRoutes() {
    var self = this;

    // Cari pin asal dan tujuan
    var fp = null; // from pin
    var tp = null; // to pin

    for (var i = 0; i < this.pins.length; i++) {
      if (this.pins[i].name === this.inFrom.value.trim()) fp = this.pins[i];
      if (this.pins[i].name === this.inTo.value.trim()) tp = this.pins[i];
    }

    if (!fp || !tp) return;

    // Reset hasil
    this.routes = [];

    // ------------------------------------
    // 🔴 VISITED - Anti Loop
    // ------------------------------------
    // Ini penting supaya DFS tidak berputar-putar
    // Contoh tanpa visited: A → B → A → B → A → ...
    var vis = {};
    vis[fp.id] = true; // Tandai titik awal sebagai visited

    // ------------------------------------
    // 🔁 FUNGSI DFS (REKURSIF)
    // ------------------------------------
    var dfs = function (cur, path) {
      // ✅ BASE CASE: Sampai tujuan!
      if (cur === tp.id) {
        // Jalur ditemukan → hitung total
        var dur = 0;
        var cost = 0;
        var steps = [];

        for (var i = 0; i < path.length; i++) {
          var s = path[i];
          var tr = s.conn.transports;

          var from = self.findPin(s.from).name;
          var to = self.findPin(s.to).name;

          // Pilih transport terbaik di step ini
          var best = tr[0];
          var bestVal = Infinity;

          for (var j = 0; j < tr.length; j++) {
            var cfg = App.TR[tr[j].mode];
            var val =
              self.sortMode === "fastest"
                ? tr[j].distance / cfg.speed
                : tr[j].distance * cfg.cost;

            if (val < bestVal) {
              bestVal = val;
              best = tr[j];
            }
          }

          var cfg = App.TR[best.mode];
          dur += best.distance / cfg.speed;
          cost += best.distance * cfg.cost;
          steps.push(
            from + " → " + to + " (" + cfg.label + ", " + best.distance + "km)",
          );
        }

        // Simpan rute yang ditemukan
        self.routes.push({
          dur: dur,
          cost: cost,
          steps: steps,
        });

        return; // langusng keluar dari fungis dfs ini ya
        // jadi dia akan id panggil pagi pke dfs(fp.id, []);
        // jadi muali lagi dari awl
      }

      // ------------------------------------
      // 🔁 EKSPLORASI TETANGGA
      // ------------------------------------
      // Loop semua edge untuk cari tetangga
      for (var i = 0; i < self.conns.length; i++) {
        var c = self.conns[i];
        var next = null;

        // 🔵 GRAPH TRAVERSAL (dua arah / undirected)
        // Cek apakah edge ini terhubung ke node saat ini

        // jadi gini pas kita cari jakarta ke serang
        // ternyata pas nyari yang form id nyajakarta maka ketemunya itu adalh to nya adalh abndung
        // lalu di cek kan tuh bandung mah belumm visited kan maka buat dia visite dulu setelah itu kita masukin rute dari jakarta ke bandung

        // lalu next lagi kan ya ekarang nextny adalah abndung nah pas di pandung dia di loop lagi apakah ada yang form bandung  atau to bandung, nah kalo to nya bandung berati yang tadi kan si jakarta tuh ya
        // nah di karena dapet berati si jaarta jadi next
        // lalu di cek deh jakarta pernah di kunjuigin belum kalo belum maka dia ga akna masuk ke if jdi ga ak ulang lagi
        // tapi dia akan ulangi lagi loopnyaaaa GITU
        // terus di cari kan ya yang pokoknya ada hubungannya sama bandung, nah ternyata pas di cek di sini ada yang from bandung tapi to nya itu semarang, NAHHH BARU NIh, jadi karean ketemu maka semrang jadi next lalu akan di cek apakah dia udah di kunjungin kalo dah kan tadi ulang lagi yaa loopnya, tapi kelo beum maka idia akn masuk ke if, jadi sekarang semarang jadi next ya, terus da juga belum visited, nah maka rute dari bandung ke smrang in akna di push ke path dan nanti akan di loop di atas

        // setlah itu kan lanut lagi ya sekarang tapi bukan di for loop, tpi panggil lagi fungsi dfsnya
        // nah di cek kalo semarang sama kaya id yang lagi di cari maka hitung aja total seluruh dari yang kjakarta sampe ke semarang ini tuh  dari path nya ya dan smeua itu di taruh di routes
        // nah setelah itu dia akn return, llu masuk lagi explore nya dan inga ya setelah dia return diaa akna menjalankan perintah path.pop jadi dari yang tadi kan yang dapet itu ada di semrang ya karean pathnya di pop (ingat gapapa di pop juga soalnya udah ad adi routs ya hasilnya) dan juga untk semrang itu visitednya di delete jadi visited hnya punya jakartadan bandung ya
        // jadi ke bandung lagi ya karean ketika kita lagi di bandung lalu ke semrang ternyata semarng ketemu ingat curr masihbandung dan belum ganti, maka dia iba tiba return kan
        // dan dia aakn jalanin ini ya path.pop(); delete vis[next];

        // nah ingat ya curr kan msaih yang bandung, ya gaa, nah baru deh lanjut lagi ke aas dan di cek apkah bandung adalh yang di cari ternyata bukan brati dia explore lagi tuh
        // setelah itu dia akna cari lagi kan ya apa an gberkaitn dnenga bandun, ternyata hanya semrang, nah ini kennapa malah loop, kalo gini kan dia kan masuk lagi if yang path.push karena visited dari semanrng udha di hapus dan sma juga nantii ketika sudah sampe jakarta lagi ya nah akn terus di ualng lagi tuh dan ternyata dia malah ketemu lagi sama badung dong ? soalnya kan visied dari bandung udha di hapus jadi gimaana ini ? nanti jadi bandung semarnag lagi dan muer aja terus ngulang lgi tolog jelai lengkap

        // ah jawabanya itu adalah INGET INI KAN ADA DIDALAM FOR LOOP DAN GINI COBA MIKIRNYA TUH SI FUNGSI DFS INI ITU AAL FUNGSI TERPISAH YA, JADI MISALNYA KETIKA KITA UDAH SAMPE SEMRANG ALU RETURN KN OTOMATIS DIA KE BANDUNG LAGI TUH I CURR NYA KAREANA KITA MASIH ADA DI DFS YANG CURRNYA SI BANDUNGG YAH
        // NAHHHH INI DIA JADI PAS DIA UDAH SAMPE BANDUNG, INGET KITA AKN MASUK DI LOOP JADI GA AKAN MASUK KE SEMARNAG LAGI KAREAN SUDAH BERTAMBAH NILAI DARI I NYA
        // DAN INAT UNTUK INI  dfs(fp.id, []); ITU HANYA DI PANGGI SEKLI AJA

        // Setiap pemanggilan dfs() punya "dunianya sendiri" — cur-nya sendiri, tidak berubah selama dia hidup.

        if (c.fromId === cur) next = c.toId;
        else if (c.toId === cur) next = c.fromId;

        // Kalau ada tetangga DAN belum dikunjungi
        if (next && !vis[next]) {
          // Tandai visited
          vis[next] = true;

          // Simpan langkah ke path
          path.push({
            from: cur,
            to: next,
            conn: c,
          });

          //  REKURSI - masuk lebih dalam

          // jaid ini
          dfs(next, path);

          // nh gini misalnya  udah  ENGGA KETEMU MAKA DIA AKAN JALANKAN FNGSI POP DAN DELETE INI DAN PUNCAKNYA ITU SAMPE SI NEXT INI SAMA KAYA FROMID YA
          // NAH KALO UDH GA ADA

          // ------------------------------------
          // 🔙 BACKTRACKING
          // ------------------------------------
          // Ini yang bikin DFS bisa cari SEMUA rute!
          // Setelah selesai explore satu jalur,
          // kita "balik" dan coba jalur lain
          path.pop();
          delete vis[next];
        }

        //         var dfs = function(cur, path) {

        //     if (cur === tp.id) {
        //         // ... push routes ...
        //         return   // ← return dari sini kalau KETEMU
        //     }

        //     for (...) {
        //         // explore tetangga
        //     }

        //     // ← kalau sampai sini, berarti loop habis
        //     //   tidak ketemu tujuan dari sini
        //     //   fungsi otomatis return (tidak perlu nulis return)

        // NAH INGAT KAN GINI ALUNRYA UTH PAS LOOP YANG CURR NYA JAKARTA
        // ITU AKN DI LOOP I PERTMA LANGSUNG KETEMU BANDUNG, NAHH MASUK DEH THU BADNTUNG YA DIDALAM FUNGSI JAKARTA
        // SETLAH TIU DI FUNGSI BANDUNG INI DI LOOP KE 3 KETEMU LAGI SAMA SEMARANG, NAH MASUK LAH TUH YA KE SEMARANG NAH PS SEMRANG ITU UDAHKETEMU SAMA TARGET MAKA UDAH TUH JADI PATH DARI JAKARTA KE BANDUNG, BANDUNG KE SEMARANG, SEMARANG KE SURABBAYA ITU ADA DI PATH DAN LANGSUNG MASUK KE ROUTES  (UDAHDI KALKULASIKAN JUGA)

        // SETELAH ITUKAN PAS DI SURABAYA ITU KAN DIA RETURN, NAH MAKA BALIK LAGI KE FUNGSI SEMARANG, DI SEMARANG INI DAI CAI CARI GA KETEMU ALHASIL HABIS TUH LOOPNYA KAN, TERUS DIA JALANIN  DELETE VISITED DA POP, NAH TERUS KARNA UDAH HABIS LOOPNYA INGAT YAA BERATI BERES KAN FUNGSINA, ALU BALIK LAGI KE FUNGSI BANDUNG, TAPI KAN BANDUNG ITU KETEMU SEMARNG DI LOOP KE TIGA KAREANA DI LOOP KETIAK FUNGIS SEMARANGNYA HABIS MAKA LANJUT LAGI DI LOOP KE 4 NAH KALO GA KETEMU MAKA DAI KAYA SEMARANG TAD LOPNYA HABIS LALU BERS AJA RETURN GITU, NAHH BARU DEH KARENA SEBELUM FUNGSINYA HABIS DAI KAN AKAN JALANKN POP DAN DLETE VISITED LALU SEKARANG BSLIK LAGI KE FUNGSI JAKARTA NAH UDAH DEH TADI KAN JAKARTA KETEMU BANDUNG DI LOOP KE 0 MKA SEKARANG LANJUT AJ LAGI DI LOOP KE 1 GITU TERUS
        // }
      }
    };

    // Mulai DFS dari titik awal
    dfs(fp.id, []);

    // Tampilkan hasil
    this.sortCtrl.classList.remove("hidden");
    this.showRoutes();
  }

  // ------------------------------------
  // 📊 TAMPILKAN HASIL RUTE
  // ------------------------------------
  showRoutes() {
    // Sort berdasarkan mode (fastest/cheapest)
    var sorted = this.routes
      .slice()
      .sort(
        function (a, b) {
          return this.sortMode === "fastest" ? a.dur - b.dur : a.cost - b.cost;
        }.bind(this),
      )
      .slice(0, 10); // Ambil max 10 rute

    if (!sorted.length) {
      this.results.innerHTML = '<p style="color:#999">No routes found</p>';
      return;
    }

    var h = "";
    for (var i = 0; i < sorted.length; i++) {
      var r = sorted[i];
      var hh = Math.floor(r.dur); // NHAJADIFUNGSI DARI FLOOR ITU ADALAH
      var mm = Math.round((r.dur - hh) * 60); // NAH JADI FUNGSI DRI ROUND ADALAH
      var waktu = hh ? hh + "h " + mm + "min" : mm + "min";
      // r.dur = 2.25 jam

      // hh = Math.floor(2.25) = 2           // ambil bagian jamnya: 2
      // mm = Math.round((2.25 - 2) * 60)
      //    = Math.round(0.25 * 60)
      //    = Math.round(15)
      //    = 15                              // ambil bagian menitnya: 15

      // waktu = hh ? "2h 15min" : "15min"
      //    = "2h 15min"                   // karena hh=2 (truthy)

      h += `
    <div class="route-card">
        <div class="steps">
            ${r.steps
              .map(
                (step, j) => `
                <div>${j + 1}. ${step}</div>
            `,
              )
              .join("")}
        </div>
        <div class="info">
            <span>${waktu}</span>
            <span>Rp${r.cost.toLocaleString("id-ID")}</span>
        </div>
    </div>
`;
    }

    this.results.innerHTML = h;
    // INGAT YA RESULTS INI ADALH DIV UNTUK HASIL ROUTES YA
  }

  // ========================================
  // 📦 POPUP (tampil / sembunyikan)
  // ========================================

  showPop(el, e) {
    el.style.left = e.clientX + 10 + "px";
    el.style.top = e.clientY - 10 + "px";
    el.classList.remove("hidden");
  }

  hidePop(el) {
    el.classList.add("hidden");
  }

  // ========================================
  // 🖱️ SETUP (semua event listener)
  // ========================================
  // Ini mengatur semua interaksi user

  // 1.  Toggle panel buka/tutup
  // 2.  Zoom: Ctrl + scroll
  // 3.  Zoom: Ctrl + / -
  // 4.  Pan: drag peta
  // 5.  Double click: tambah pin
  // 6.  Event delegation: klik pin
  // 7.  Form tambah pin
  // 8.  Form koneksi
  // 9.  Close popup
  // 10. Keyboard: Delete & Escape
  // 11. Click map: select line
  // 12. Route search
  // 13. Sort buttons

  setup() {
    // INGAT YA DINIS KITA PEK ELF AJA OANYA KALO PAKE ARROW FUNCTION ITU DAI GA AKAN DAPE PARAMETER E
    var self = this;

    // ------------------------------------
    // Toggle panel buka/tutup
    // ------------------------------------
    this.btnToggle.onclick = function () {
      self.panel.classList.toggle("open");
    };

    // ------------------------------------
    // 🔍 ZOOM: Ctrl + scroll
    // ------------------------------------
    this.area.addEventListener(
      "wheel",
      function (e) {
        if (!e.ctrlKey) return;
        e.preventDefault();
        // jadi deltaY itu artiny ketika kita wheel atu gerkin ynag tengah mouse itu ke atas (zoom in)
        // atau ke bawah (zoom out)
        // jadi kalo lebih kecil dri 0 artinya dia scoll atas maka akna zoom
        self.zoom(e.clientX, e.clientY, e.deltaY < 0 ? 1.15 : 0.85);
      },
      { passive: false },
    );

    // ------------------------------------
    // 🔍 ZOOM: Ctrl + / -
    // ------------------------------------
    document.addEventListener("keydown", function (e) {
      if (!e.ctrlKey) return;
      var r = self.area.getBoundingClientRect();

      if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        // nah jadi gini kalo misalnya dia hnaya klik ctrl dn + / - maka akna
        // kita buat dia zoom ke arah tengah
        self.zoom(r.left + r.width / 2, r.top + r.height / 2, 1.15);
      }
      if (e.key === "-") {
        e.preventDefault();
        self.zoom(r.left + r.width / 2, r.top + r.height / 2, 0.85);
      }
    });

    // ------------------------------------
    // 🖐️ PAN: Drag peta
    // ------------------------------------
    this.area.addEventListener("mousedown", function (e) {
      // jadi ini tuh kalo misalnya kita mouse down lallu ken ke .pinpoint dan .popup
      // atau engga kena itu tapi klik
      // jadi mosedown itu fnginya untuk ngecek ketika kita klik kiri di mouse
      // nah jadi ketika  saya klik kanan di mouse maka kna masuknya itudaah e.button nyafalse nah kalo giut brati di return ja
      if (e.target.closest(".pinpoint,.popup") || e.button !== 0) return;
      self.dragging = true; // tandai sedang drag
      self.dragX = e.clientX; // posisi mouse saat mulai drag: x
      self.dragY = e.clientY; // posisi mouse saat mulai drag: y
      self.sox = self.ox; // offset peta saat mulai drag: x
      self.soy = self.oy; // offset peta saat mulai drag: y
    });

    document.addEventListener("mousemove", function (e) {
      // nah ini tuh ketika di dragging baru deh jalanin
      if (!self.dragging) return;

      // jadi kita ak perbarui si niali ox dan oy

      // nah ini tuh si event listenernya di pasang di document karna kalo pasang di mapaja
      // /nanti pas kita klik di luar map malah ga bisa ya

      // jaid sox adalh nilai offset setelah digeser / offset awal

      // coba aa balik blaik nih
      self.ox = self.sox + (e.clientX - self.dragX);
      // self.ox = self.sox + (self.dragX - e.clientX);

      // jadi self.dragX itu adalah posisi ketika si user mulai drag ya pas ditaruh di layar si cursornya
      // nah baru e.clientX itu adalah lokasi usr setealh drag

      // jadi clientX itu di kurang sama si drag ya
      self.oy = self.soy + (e.clientY - self.dragY);
      self.apply();
    });

    document.addEventListener("mouseup", function () {
      // nh ini kalo misalnya udah angkat mouse ya
      self.dragging = false;
    });

    // ------------------------------------
    // 👆 DOUBLE CLICK: Tambah pinpoint
    // ------------------------------------
    this.area.addEventListener("dblclick", function (e) {
      // ini taruh di area biar hanya are aja yangngaruh kalo di klik
      if (e.target.closest(".pinpoint,.popup")) return;
      // nah liat kalo misalnya kalo kita double clickbnya itu di
      // pinpoint atau popup maka ga akna ngaruh

      // nah ini tuh clickPos nya harus ita toMa dulu
      // soalnya dari clickPos ini si koordinanta akan kita jadikan patokan jadi haruas di uabh dulu ke koordinat map
      self.clickPos = self.toMap(e.clientX, e.clientY);
      self.showPop(self.popAdd, e);
      self.inName.value = "";
      self.inName.focus();
    });

    // ------------------------------------
    // 📍 EVENT DELEGATION: Klik pin
    // ------------------------------------
    this.pinsEl.addEventListener("click", function (e) {
      e.stopPropagation();
      // e.stopPropagation() = hentikan event supaya tidak "naik" ke elemen parent.
      //       Tanpa stopPropagation:
      // Klik pin → event naik ke pinsEl → naik ke area → cancelConnect() terpanggil!

      // Dengan stopPropagation:
      // Klik pin → event berhenti di pinsEl → area tidak tahu

      // Klik tombol Connect
      var btnC = e.target.closest(".btn-connect");
      if (btnC) {
        self.startConnect(btnC.dataset.id);
        return;
      }

      // Klik tombol Delete
      var btnD = e.target.closest(".btn-delete");
      if (btnD) {
        self.deletePin(btnD.dataset.id);
        return;
      }

      // Klik pinpoint saat mode connecting
      var pin = e.target.closest(".pinpoint");
      if (pin && self.connectFrom && self.connectFrom !== pin.dataset.id) {
        self.connectTo = pin.dataset.id;
        self.showPop(self.popConn, e);
        self.inDist.value = "";
        self.inMode.value = "";
        self.inDist.focus();
      }
    });
    //

    // ------------------------------------
    //   FORM: Tambah pinpoint
    // ------------------------------------
    document.getElementById("form-add").onsubmit = function (e) {
      e.preventDefault();
      var n = self.inName.value.trim();
      if (n) {
        self.addPin(n, self.clickPos.x, self.clickPos.y);
        self.hidePop(self.popAdd);
      }
    };

    // ------------------------------------
    // 📝 FORM: Connect
    // ------------------------------------
    document.getElementById("form-connect").onsubmit = function (e) {
      e.preventDefault();
      var d = parseInt(self.inDist.value);
      var m = self.inMode.value;
      if (d && m) self.submitConnect(d, m);
    };

    // ------------------------------------
    // ❌ CLOSE POPUPS
    // ------------------------------------
    document.getElementById("close-add").onclick = function () {
      self.hidePop(self.popAdd);
    };

    document.getElementById("close-connect").onclick = function () {
      self.hidePop(self.popConn);
      self.cancelConnect();
    };

    // ------------------------------------
    // ⌨️ KEYBOARD: Delete & Escape
    // ------------------------------------
    document.addEventListener("keydown", function (e) {
      // jadi fungsinya adlah
      //       var inp = e.target.matches("input,select,textarea") = cek apakah user sedang fokus di input
      // Kenapa perlu cek ini?
      // javascript// Tanpa cek:
      // // User lagi ketik nama kota "Surabaya"
      // // Tekan Backspace untuk hapus huruf
      // // → deleteLine() terpanggil! (tidak diinginkan)

      // // Dengan cek:
      // // inp = true → !inp = false → deleteLine() tidak jalan
      var inp = e.target.matches("input,select,textarea");

      if (
        (e.key === "Delete" || e.key === "Backspace") &&
        self.selectedLine &&
        !inp
      ) {
        e.preventDefault();
        self.deleteLine();
      }

      if (e.key === "Escape") {
        self.hidePop(self.popAdd);
        self.hidePop(self.popConn);
        self.cancelConnect();
        self.selectedLine = null;
        self.render();
      }
    });

    // ------------------------------------
    // 👆 CLICK MAP: Select line atau cancel
    // ------------------------------------
    this.area.addEventListener("click", function (e) {
      if (e.target.closest(".pinpoint,.popup")) return;

      var lid = self.findClickedLine(e);
      if (lid) {
        self.selectLine(lid);
        return;
      }

      if (self.connectFrom) self.cancelConnect();
      if (self.selectedLine) {
        self.selectedLine = null;
        self.render();
      }
    });

    // ------------------------------------
    // 🔍 ROUTE SEARCH
    // ------------------------------------
    this.inFrom.oninput = function () {
      self.checkSearch();
    };
    this.inTo.oninput = function () {
      self.checkSearch();
    };
    this.btnSearch.onclick = function () {
      self.searchRoutes();
    };

    // ------------------------------------
    // 📊 SORT BUTTONS
    // ------------------------------------
    var sBtns = document.querySelectorAll(".sort-btn");
    for (var i = 0; i < sBtns.length; i++) {
      sBtns[i].onclick = function () {
        for (var j = 0; j < sBtns.length; j++) {
          sBtns[j].classList.remove("active");
        }
        this.classList.add("active");
        self.sortMode = this.getAttribute("data-sort");
        self.showRoutes();
      };
    }
  }
}

// ========================================
// 🚀 START
// ========================================
window.onload = function () {
  new App();
};
