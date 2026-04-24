class App {
  static LEBAR_MAP = 982;
  static TINGGIMAP = 450;

  //   tahap 2
  static Transports = {
    Train: { color: "#33E339", speed: 120, cost: 500, label: "Train" },
    Bus: { color: "#A83BE8", speed: 80, cost: 100, label: "Bus" },
    Airplane: { color: "#000000", speed: 800, cost: 1000, label: "Airplane" },
  };

  constructor() {
    this.scale = 1;
    this.ox = 0;
    this.oy = 0;
    this.soy = 0;
    this.sox = 0;
    this.dragging = false;
    this.dragX = 0;
    this.dragY = 0;

    // tahap 2
    this.connectFrom = null;
    this.connectTo = null;
    this.selectedLine - null;
    this.clickPositionInMap = {};
    this.sortMode = "fastest";
    this.routes = [];
    this.pins = [];
    this.connection = [];

    // tahap satu
    const $ = (id) => document.getElementById(id);
    this.canvas = $("lines-layer");
    this.ctx = this.canvas.getContext("2d");
    this.mapArea = $("map-area");
    this.mapContainer = $("map-container");
    this.pinpointsLayer = $("pinpoints-layer");

    // tahap kedua
    this.popAdd = $("popup-add");
    this.formAdd = $("form-add");
    this.inputName = $("input-name");

    // tahap ketiga
    this.popConnect = $("popup-connect");
    this.formConnect = $("form-connect");
    this.inputDistance = $("input-distance");
    this.inputMode = $("input-mode");

    // keempat
    this.inputFromSearh = null;
    this.inputToSearch = null;
    this.btnSearch = null;
    this.sortSearch = null;
    this.results = null;
    this.panel = null;
    this.btnToggle = null;

    // tahap satu
    this.load();
    this.fit();
    this.render();
    this.apply();
    this.setup();
  }

  //   tahap kedua
  save() {
    localStorage.setItem("pins", JSON.stringify(this.pins));
    localStorage.setItem("connection", JSON.stringify(this.connection));
  }

  load() {
    this.pins = JSON.parse(localStorage.getItem("pins")) ?? [];
    this.connection = JSON.parse(localStorage.getItem("connection")) ?? [];
  }

  apply() {
    // ini buat geser peta ya
    this.mapContainer.style.transform = `translate(${this.ox}px,${this.oy}px) scale(${this.scale})`;
  }

  fit() {
    let widthArea = this.mapArea.clientWidth;
    let heigthArea = this.mapArea.clientHeight;
    this.scale = Math.max(
      widthArea / App.LEBAR_MAP,
      heigthArea / App.TINGGIMAP,
    );
    this.ox = (widthArea - App.LEBAR_MAP * this.scale) / 2;
    this.oy = (heigthArea - App.TINGGIMAP * this.scale) / 2;
  }

  zoom(clientX, clientY, factor) {
    const relative = this.mapArea.getBoundingClientRect();
    const mx = clientX - relative.left; // ini posiis x versi ukuran map/layar
    const my = clientY - relative.top; // ini posisi y versi ukuran map/layar
    // sekrang kita ubah posisi x dan y dari ukuran layar/map ke peta
    const px = (mx - this.ox) / this.scale;
    const py = (my - this.oy) / this.scale;
    // kita update lagi scalenya
    this.scale = Math.max(0.3, Math.min(15, this.scale * factor));
    // kita berbarui lagi offsetnya biar peta di bawah cursor tetap ad adi bawah cursor

    // setelah di ubha si scalenya sekarang ubah lagi posisi gesernya
    // dan jangan lupa di kali scale lagi biar menyesuaikan
    this.ox = mx - px * this.scale;
    this.oy = my - py * this.scale;
    // baru apply biar si petanya geser lagi
    this.apply();
  }

  toMap(clientX, clientY) {
    const relative = this.mapArea.getBoundingClientRect();
    // mirip kaya yang zoom ya
    return {
      x: (clientX - relative.left - this.ox) / this.scale,
      y: (clientY - relative.top - this.oy) / this.scale,
    };
  }

  //   tahap ke dua

  render() {
    this.renderPins();
    this.renderLines();
    this.apply();
  }
  pinHtml(pin) {
    // jadi ini tuh nantinya kaya toogle gituya
    let connectionClass = this.connectFrom == pin.id ? "connecting" : "";
    // ingat ya dinsi kita harus pake class soalnya kalo id itu harus uniq jadi pake class='pinpoint' aja
    return `    <div data-id="${pin.id}" class="pinpoint" style="left: ${pin.x}px; top: ${pin.y}px;">
      <div class="pinpoint-label ${connectionClass}">
      <span>${pin.name}</span>
        <img
          src="/assets/MdiTransitConnectionVariant.svg"
          alt="tombol connection"
          id="btn-connect"
          data-id="${pin.id}"
          class="btn-icon btn-connect"
          title="connect"
        />

        <img
          src="/assets/MdiTrashCanOutline.svg"
          alt="tombol delete"
          id="btn-delete"
          class="btn-icon btn-delete"
          data-id="${pin.id}"
          title="delete"
        />
      </div>
      <div id="pinpoint-marker">
        <img src="/assets/MaterialSymbolsLocationOn.svg" class="marker" title="marker" alt="marker">
      </div>
    </div>`;
  }

  renderPins() {
    let html = "";
    this.pins.forEach((pin, index) => {
      html += this.pinHtml(pin);
    });
    this.pinpointsLayer.innerHTML = html;
  }

  renderLines() {
    this.canvas.width = App.LEBAR_MAP;
    this.canvas.height = App.TINGGIMAP;

    this.connection.forEach((conn, index) => {
      let pinFrom = this.findPin(conn.fromId);
      let pinTo = this.findPin(conn.toId);

      let transports = conn.transportasi;
      transports.forEach((tran, index) => {
        let offset = this.hitungOffset(
          pinFrom,
          pinTo,
          index,
          transports.length,
        );
        let x1 = pinFrom.x + offset.x;
        let x2 = pinTo.x + offset.x;
        let y1 = pinFrom + offset.y;
        let y2 = pinTo + offset.y;

        // cek dulu apakah dia lagi di select apa engga

        if (this.selectedLine == conn.id) {
          this.ctx.shadowColor = "rgb(208, 184, 30)";
          this.ctx.lineWidth = 6;
          this.ctx.shadowBlur = 5;
        } else {
          this.ctx.shadowColor = "transparent";
          this.ctx.lineWidth = 2;
          this.ctx.shadowBlur = 0;
        }

        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.strokeStyle = App.Transports[tran[mode]].color;
        this.ctx.font = "bold 11px sans-serif";
        this.ctx.textAlign = "center";
        this.ctx.fillText(tran.distance, (x1 + x2) / 2, (y1 + y2) / 2);
      });
    });
  }

  hitungOffset(pinFrom, pinTo, index, total) {
    if (total <= 1) return { x: 0, y: 0 };
    /*
      Rumus untuk menyebarkan garis secara simetris:
      - total=2: index 0 → s=-3, index 1 → s=+3
      - total=3: index 0 → s=-6, index 1 → s=0, index 2 → s=+6

      s = -(total-1) * 3 + index * 6

      Kenapa 6? Karena jarak antar garis = 6px
      Kenapa -(total-1)*3? Karena titik mulai = -(total jarak / 2)
    */
    let s = 1(n - 1) * 3 + index * 6;
    // cari apkah garisnya horizontal atau vertikal
    const dx = Math.abs(pinFrom.x - pinTo.x);
    const dy = Math.abs(pinFrom.y - pinTo.y);
    /*
      Kalau garis lebih horizontal (dx >= dy):
        geser ke atas/bawah → ubah y saja

      Kalau garis lebih vertikal (dy > dx):
        geser ke kiri/kanan → ubah x saja
    */

    if (dx >= dy) {
      return {
        x: 0,
        y: s,
      };
    } else {
      return {
        x: s,
        y: 0,
      };
    }
  }

  findPin(id) {
    return this.pins.find((pin) => {
      return pin.id == id;
    });
  }

  addPin(name, x, y) {
    this.pins.push({
      id: Date.now(),
      name: name,
      x: x,
      y: y,
    });
    this.save();
    this.render();
  }

  deletePin(id) {
    // delete  perlu pake id ya yang ga peru itu adlah deleteline
    this.pins = this.pins.filter((pin, index) => {
      if (pin.id != id) return pin;
    });
    this.connection = this.connection.filter(
      (conn, index) => conn.fromId != id && conn.toId != id,
    );
    this.save();
    this.render();
  }

  startConnect(id) {
    /*
      Kalau kita klik tombol connect di pin yang SAMA dua kali,
      artinya user mau membatalkan. Jadi connectFrom dikembalikan ke null.
      Kalau pin berbeda, baru set connectFrom ke id yang baru.
    */

    this.connectFrom = this.connectFrom == id ? null : id;
    // ini akn yang start / from ntuk yang to itu nanti akna di tambahinya pas
    // di event listener
    this.render();
  }

  cancelConnection() {
    this.connectFrom = null;
    this.connectTo = null;
    this.render();
  }

  submitConnect(distance, mode) {
    /*
      LOGIKA:
      1. Cek apakah koneksi antara connectFrom dan connectTo sudah ada -> satu koneksin ya 
      2. Kalau SUDAH ADA:
         - Cek apakah mode transport ini sudah ada di koneksi itu
         - Kalau sudah ada → tolak (alert)
         - Kalau belum → tambahkan transport baru ke koneksi yang sudah ada
      3. Kalau BELUM ADA:
         - Buat koneksi baru dengan transport pertama ini
    */
    let isAdaKoneksi = null;
    for (let i = 0; i < this.connection.length; i++) {
      let conn = this.connection[i];
      // ini kita cek bolak balik ya

      if (conn.fromId == this.connectFrom && conn.toId == this.connectTo)
        isAdaKoneksi = conn;
      if (conn.formId == this.connectTo && conn.toId == this.connectFrom)
        isAdaKoneksi = conn;
    }

    if (isAdaKoneksi) {
      // jika sdha ada cek lagi apakah si conn ini sudha puya transportasi yag sama kaya yang di mode
      let sudahPunyaTran = isAdaKoneksi.transportasi.find(
        (tran) => tran.mode == mode,
      );
      if (sudahPunyaTran) {
        alert(
          "silahkan pilih transportasi lain, kamu sudah punya transport ini",
        );
        return;
      }
      // nah kalo belum ada maka kita tambahin aja
      isAdaKoneksi.transportasi.push({
        mode: mode,
        distance: distance,
      });
    } else {
      // nah ini kalo belum pernah punya konneksi

      this.connection.push({
        id: Date.now(),
        // ini connectFrom sama to ini pasti akan ada ya soalnya kita udha cek di atas pake &&
        fromId: this.connectFrom,
        toId: this.connectTo,
        transports: [{ mode: mode, distance: distance }],
      });
    }

    // nah kaloo udah connect kita akan cancel biar keduanya null lagi
    this.cancelConnection();
    this.save();
    this.render(); // kita kasih render biar di gambar lagi si connectnya
  }

  //   ini ketika select line
  selectLine(id) {
    /*
      Kalau klik garis yang sama dua kali → deselect (null)
      Kalau klik garis berbeda → select yang baru
    */
    this.selectedLine = this.selectedLine == id ? null : id;
    this.render();
  }

  deleteLine() {
    // ini gausha pake id ya
    if (!this.selectedLine) return; // kalo ga ada yang di select maka ga usah
    this.connection = this.connection.map(
      (conn, index) => conn.id != this.selectedLine,
    );
    this.selectedLine = null;
    this.save();
    this.render();
  }

  //   ini tuh kita kaya buat line baru gitu, yang lebih gede denang data line yang udah ada jadi biar bsa di klik dan di select
  findClickedLine(e) {
    const posisiDiMap = this.toMap(e.clientX, e.clientY);

    // igt ya ga bisa pake forEach soalnya ga bsia return
    // let foundIt = this.connection.find((conn, index) => {
    //   let pinFrom = this.findPin(conn.fromId);
    //   let pinTO = this.findPin(conn.toId);

    //   if (!pinFrom || !pinTo) return false;

    //   /*
    //         ctx.isPointInStroke() adalah fungsi bawaan Canvas API.
    //         Kita buat path dulu (beginPath → moveTo → lineTo),
    //         lalu tanya: "apakah titik (posisiDiMap.x, posisiDiMap.y) ada di dalam stroke path ini?"
    //         lineWidth dibagi scale supaya area klik tidak mengecil saat zoom in.
    //       */
    //   this.ctx.beginPath();
    //   this.ctx.lineWidth = 8 / this.scale;
    //   this.ctx.moveTo(pinFrom.x, pinFrom.y);
    //   this.ctx.lineTo(pinTo.x, pinTo.y);

    //   if (this.ctx.isPointInStroke(posisiDiMap.x, posisiDiMap.y)) {
    //     return conn.id;
    //   }

    //   return null;
    // });
    // return foundIt ? foundIt.id : null;

    // ada juga cara yang ini

    for (let i = 0; i < this.connection.length; i++) {
      let conn = this.connection[i];
      let pinFrom = this.findPin(conn.fromId);
      let pinTo = this.findPin(conn.toId);
      if (!pinFrom || !pinTo) continue;

      this.ctx.beginPath();
      this.ctx.lineWidth = 8 / this.scale;
      this.ctx.moveTo(pinFrom.x, pinFrom.y);
      this.ctx.lineTo(pinTo.x, pinTo.y);

      if (this.ctx.isPointInStroke(posisiDiMap.x, posisiDiMap.y)) {
        return conn.id;
      }
    }
    return null;
  }

  showPop(element, e) {
    // console.log('masuk')
    element.style.left = e.clientX + 10 + "px";
    element.style.top = e.clientY - 10 + "px";
    element.classList.remove("hidden");
  }

  hiddenPop(element) {
    element.classList.add("hidden");
  }

  setup() {
    const self = this;

    // 1. zoom ctrl + scroll
    this.mapArea.addEventListener(
      "wheel",
      function (e) {
        if (!e.ctrlKey) return;
        e.preventDefault();
        self.zoom(e.clientX, e.clientY, e.deltaY < 0 ? 1.15 : 0.85);
      },
      { passive: false },
    ); // passive biar ga ngelek

    // 2. zoom ctrl + / -
    document.addEventListener("keydown", function (e) {
      if (!e.ctrlKey) return;
      const relative = self.mapArea.getBoundingClientRect();
      if (e.key == "+" || e.key == "=") {
        e.preventDefault();
        // pokoknya biar di tnegah ya
        self.zoom(
          relative.left + relative.width / 2,
          relative.top + relative.height / 2,
          1.15, // ini kalo dia zoom in
        );
      }
      if (e.key == "-" || e.key == "_") {
        e.preventDefault();
        self.zoom(
          relative.left + relative.width / 2,
          relative.top + relative.height / 2,
          0.85,
        );
      }
    });

    // 3. ketika drag peta
    this.mapArea.addEventListener("mousedown", function (e) {
      //   if (e.button) return; // ini tuh cek kalo kita klik kanan
      //   mousedown itu adlah klik kiri ya kalo e.button itu klik kanan

      //   ini yang tahap kedua, pake pengecekan apakah kena pin / popup

      if (e.button || e.target.closest(".pinpoint,.popup")) return;
      self.dragging = true;
      //   kita taruh semua statenya
      self.sox = self.ox;
      self.soy = self.oy;
      self.dragX = e.clientX;
      self.dragY = e.clientY;
    });

    document.addEventListener("mousemove", function (e) {
      if (!self.dragging) return;
      // kita buat ox nya abru ya dari si ox dulu (sox) tambah clientx kurang posiis clientx dulu (dragx)
      self.ox = self.sox + (e.clientX - self.dragX);
      self.oy = self.soy + (e.clientY - self.dragY);
      self.apply();
    });

    document.addEventListener("mouseup", function (e) {
      self.dragging = false;
    });

    self.mapArea.addEventListener("dblclick", function (e) {
      e.preventDefault();
      if (e.target.closest(".pinpoint,.popup")) return;
      // kita dapetin dulu data x dan y ke posisi peta/map ya
      self.clickPositionInMap = self.toMap(e.clientX, e.clientY);
      // setelah itu showpop add
      self.showPop(self.popAdd, e);
      self.inputName.value = "";
      self.inputName.focus();
    });

    // klik tommbol di pin bisa delete/connect
    // jadi hanya di pinpoinst lyer ini ya
    // dan ingat juga disni di eleen ini itu udha kita style jadi biar bsia di klik oke

    this.pinpointsLayer.addEventListener("click", function (e) {
      console.log("aaaaaa");
      e.stopPropagation();
      //   ITU PERHATIKAN STOP PROPAGATION
      // gausah di cek misalnya if closest di .pinpoint karean ini kita hanya listener di elemen ini aja

      // paling kita harus pake cosest untuk elmne elemn yang ada di dalam elemen si pinpointslayer ini

      // ingat ya btn-delete ini itu ada di dalam elemen pinpoint yang ada di funsi pinhtml
      const buttonDelete = e.target.closest(".btn-delete");
      if (buttonDelete) {
        self.deletePin(buttonDelete.dataset.id);
        return;
      }

      // tahap 3
      const buttonConnect = e.target.closest(".btn-connect");
      if (buttonConnect) {
        // nah nanti ya,nah sekarang
      }
    });

    // ini untuk ketika form add di submit ya
    self.formAdd.onsubmit = function (e) {
      e.preventDefault();
      const inputname = self.inputName.value.trim();
      if (inputname) {
        // kan tadi pas kita klik dua kali lalu munucl si pop add nya kiat duah
        // assgn ke vribe clickpos ya, nah disni di pakenya
        self.addPin(
          inputname,
          self.clickPositionInMap.x,
          self.clickPositionInMap.y,
        );
        // udah di tambah kita hide lagi popupya
        self.hiddenPop(self.popAdd);
      }
    };

    // ini ketika kita klik tombol close add
    document.getElementById("close-add").onclick = function (e) {
      self.hiddenPop(self.popAdd);
    };

    // ini ketika kta klik escape maka ak tutup semuanya

    document.addEventListener("keydown", function (e) {
      // ini untk klik escape / delete ketika kita lagi ada di input name, search atau input maka fugnsi deleteline gaakn jalan gtu

      const input = e.target.closest("input,textarea,select");
      if (e.key == "Escape") {
        self.hiddenPop(self.popAdd);
      }
    });

    // ini untuk klik cancel / delete

    self.mapArea.addEventListener("click", function (e) {
      if (e.target.closest(".pinpoint,.popup")) return;
      //   jadi ii tuh funginys kita akn bisa klik apa aja tapi bukan pinpoint/popup, maka kalo dia udah klik connectform / selectedline mka akna null lagi ini keren
    });
  }
}

window.onload = function () {
  new App();
};
