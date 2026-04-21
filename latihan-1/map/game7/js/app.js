// ========================================
// PETA INTERAKTIF INDONESIA
// ========================================
//
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
    // this.load();

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

    // Hitung posisi di peta sebelum zoom
    var px = (mx - this.ox) / this.scale;
    var py = (my - this.oy) / this.scale;

    // Update scale dengan batas
    this.scale = Math.max(0.3, Math.min(15, this.scale * f));

    // Hitung offset baru supaya zoom ke arah cursor
    this.ox = mx - px * this.scale;
    this.oy = my - py * this.scale;

    this.apply();
  }

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
    if (n <= 1) return { x: 0, y: 0 };

    var dx = b.x - a.x;
    var dy = b.y - a.y;
    var len = Math.sqrt(dx * dx + dy * dy) || 1;

    var s = -(n - 1) * 3 + i * 6;

    return {
      x: (-dy / len) * s,
      y: (dx / len) * s,
    };
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
  // 📍 PINPOINT (tambah, hapus)
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
  // 2. Tandai sebagai visited
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

        return;
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

          // 🔁 REKURSI - masuk lebih dalam
          dfs(next, path);

          // ------------------------------------
          // 🔙 BACKTRACKING
          // ------------------------------------
          // Ini yang bikin DFS bisa cari SEMUA rute!
          // Setelah selesai explore satu jalur,
          // kita "balik" dan coba jalur lain
          path.pop();
          delete vis[next];
        }
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
      var hh = Math.floor(r.dur);
      var mm = Math.round((r.dur - hh) * 60);
      var waktu = hh ? hh + "h " + mm + "min" : mm + "min";

      h += '<div class="route-card"><div class="steps">';
      for (var j = 0; j < r.steps.length; j++) {
        h += "<div>" + (j + 1) + ". " + r.steps[j] + "</div>";
      }
      h += '</div><div class="info"><span>' + waktu + "</span>";
      h += "<span>Rp" + r.cost.toLocaleString("id-ID") + "</span></div></div>";
    }

    this.results.innerHTML = h;
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

  setup() {
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
      if (e.target.closest(".pinpoint,.popup") || e.button !== 0) return;
      self.dragging = true;
      self.dragX = e.clientX;
      self.dragY = e.clientY;
      self.sox = self.ox;
      self.soy = self.oy;
    });

    document.addEventListener("mousemove", function (e) {
      if (!self.dragging) return;
      self.ox = self.sox + (e.clientX - self.dragX);
      self.oy = self.soy + (e.clientY - self.dragY);
      self.apply();
    });

    document.addEventListener("mouseup", function () {
      self.dragging = false;
    });

    // ------------------------------------
    // 👆 DOUBLE CLICK: Tambah pinpoint
    // ------------------------------------
    this.area.addEventListener("dblclick", function (e) {
      if (e.target.closest(".pinpoint,.popup")) return;
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

    // ------------------------------------
    // 📝 FORM: Tambah pinpoint
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
