-class App {
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
    this.selectedLine = null;
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
    this.inputFromSearch = $("input-from");
    this.inputToSearch = $("input-to");
    this.btnSearch = $("btn-search");
    this.sortSearch = "fastest";
    this.results = $("route-results");
    this.panel = $("route-panel");
    this.btnToggle = $("btn-toggle");

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
      // console.log(conn)
      let pinFrom = this.findPin(conn.fromId);
      let pinTo = this.findPin(conn.toId);
      //   console.log(pinTo)
      //   console.log(pinFrom)

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
        let y1 = pinFrom.y + offset.y;
        let y2 = pinTo.y + offset.y;

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
        this.ctx.strokeStyle = App.Transports[tran.mode].color;
        this.ctx.stroke(); // jangna lupa ya

        this.ctx.shadowBlur = 0;
        this.ctx.shadowColor = "transparent";
        this.ctx.fillColor = App.Transports[tran.mode].color;
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
    let s = -(total - 1) * 3 + index * 6;
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
        transportasi: [{ mode: mode, distance: distance }],
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

    // SALAH - pakai .map() bukan .filter()
    // .map() itu untuk MENGUBAH nilai, bukan menghapus
    // hasilnya array berisi true/false, bukan array koneksi
    this.connection = this.connection.filter(
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

      //   ini ga diwarnin ya biar bisa enak liatnya
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

  checkSearch() {
    let fromInput = this.inputFromSearch.value.toLowerCase().trim();
    let toInput = this.inputToSearch.value.toLowerCase().trim();

    let isAdaFrom;
    let isAdaTo;

    for (let i = 0; i < this.pins.length; i++) {
      let pin = this.pins[i];
      if (pin.name.toLowerCase().trim() == fromInput) isAdaFrom = true;
      if (pin.name.toLowerCase().trim() == toInput) isAdaTo = true;
    }

    this.btnSearch.disabled = !(isAdaFrom && isAdaTo && isAdaFrom != isAdaTo);
  }

  searchRoute() {
    let pinFrom;
    let pinTo;
    console.log({ pinFrom });
    console.log({ pinTo });

    for (let i = 0; i < this.pins.length; i++) {
      let pin = this.pins[i];
      if (
        pin.name.toLowerCase().trim() ==
        this.inputFromSearch.value.toLowerCase().trim()
      )
        pinFrom = pin;
      if (
        pin.name.toLowerCase().trim() ==
        this.inputToSearch.value.toLowerCase().trim()
      )
        pinTo = pin;
    }

    if (!pinFrom || !pinTo) {
      return;
    }
    this.routes = [];
    let visited = {};
    visited[pinFrom.id] = true;

    const dfs = (current, path) => {
      console.log("masuk dfs");
      if (current == pinTo.id) {
        console.log("masuk if");
        let duration = 0;
        let cost = 0;
        let steps = [];

        for (let i = 0; i < path.length; i++) {
          let objekPath = path[i];
          let trasportasi = objekPath.conn.transportasi;
          //   ktia siapi juga fromname sama toname untuk kasih nama si steps
          // dan jgua siapin bestvalur sana best ya
          var from = this.findPin(objekPath.fromId).name;
          var to = this.findPin(objekPath.toId).name;
          let best = trasportasi[0]; // ini untuk awal aja
          let bestValue = Infinity;

          for (let j = 0; j < trasportasi.length; j++) {
            let tran = trasportasi[j];
            let config = App.Transports[tran.mode];

            let value =
              this.sortMode == "fastest"
                ? tran.distance / config.speed
                : tran.distance * config.cost;

            if (value < bestValue) {
              // ini untuk pertama kali pasti true ya
              bestValue = value;
              best = tran; // isinya adalh objek tran ya bukan hasil perhitauganya
            }
          }

          let config = App.Transports[best.mode]; // ingat best adalh objek tran
          duration += best.distance / config.speed;
          cost += best.distance * config.cost;
          steps.push(
            `(${from}) -> (${to}) cost:${cost} | duration:${duration}`,
          );
        }
        // nah ketika udah di cari yang paling bagus di path ini maka
        // daia kan taruh ke routes llau return
        // nah nanit kan pas rturn dia ka lagi di surabaya si next dfsnya
        // nanti dia akn pop si path surabaya dan hapus visited surabaya
        // nah nanti mialnya dia di semarnag ya sbeleum dapet surabaya tuh nanit mislanya dia ketemu surabaya itu di loop ke 2 maka nanti lanjut lagi ke loop 3 sampai seterusnya klo ga dapet maka setelah loopnya selesa maka akna return sendiri / beres sendri kan dan nanit jgua akan langsung jalaanin si pop dna visited delete

        this.routes.push({ duration: duration, cost: cost, steps: steps });
        return;
      }

      for (let i = 0; i < this.connection.length; i++) {
        console.log("masuk explore");
        let next = null;
        let conn = this.connection[i];

        if (current == conn.fromId) next = conn.toId;
        if (current == conn.toId) next = conn.fromId;

        if (next && !visited[next]) {
          visited[next] = true;
          path.push({
            fromId: current,
            toId: next,
            conn: conn,
          });

          dfs(next, path);
          delete visited[next];
          path.pop();
        }
      }
    };

    dfs(pinFrom.id, []);
    this.showRoutes();
    this.results.classList.remove("hidden");
  }

  showRoutes() {
    console.log("ini routes", this.routes);
    let sorted = this.routes
      .slice()
      .sort((a, b) => {
        if (this.sortMode == "fastest") {
          return a.dur - b.dur;
        } else {
          // JNANGAN LUPA RETURN
          return a.cost - b.cost;
        }
      })
      .slice(0, 10);
    console.log(sorted);

    if (sorted.length <= 0) {
      return `<p>belum ada route di sini</p>`;
    }

    let html = ``;

    for (let i = 0; i < sorted.length; i++) {
      let sort = sorted[i];
      //   console.log(sort) selectedLine
      html += `
    <div class="route-card">
      <div class="steps">
        ${sort.steps.map((step, index) => `<div>${index + 1}. ${step}</div>`).join("")}
      </div>
      <div class="info">
        <span>duration: ${sort.duration}</span>
        <span>cost: ${sort.cost}</span>
      </div>
    </div>
        `;
    }

    this.results.innerHTML = html;
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
      // karena kita itu mau klik yang ada didalam pin, sedangkan nanti itu ada pengecekan kalo misalnya ada klik di pinpoint
      // maka akan connect isPointInStroke

      // tapi ini kan kita hnya mau klik agian kecil dan spesifik dari si pindpoinnya yaitu delete dan connect
      // makanya pek propagtion biar engga bubble engga menyebar lah si event kliknya

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
        self.startConnect(buttonConnect.dataset.id);
        return;
      }

      // nah sekrnag untuk kita cek kalo user yang sudha pilih pin pertama
      // lalu dia klik hanya di pin tapi di pin mana aja asal buka pin yang udah di klik tadi / pin / connectFrom
      // dan ga melulu harus tepat di button connectnya
      // maka akan di anggap ingin membuat koneksi

      const pilihPin = e.target.closest(".pinpoint");
      if (
        pilihPin &&
        self.connectFrom != pilihPin.dataset.id &&
        self.connectFrom
      ) {
        self.showPop(self.popConnect, e);
        // jangan lupa disni kita kasihsi conectTo nya
        self.connectTo = pilihPin.dataset.id;
        self.inputDistance.value = "";
        self.inputMode.value = "";
        self.inputDistance.focus();
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

    self.formConnect.onsubmit = function (e) {
      e.preventDefault();
      const distance = self.inputDistance.value;
      const mode = self.inputMode.value;
      if (mode && distance) {
        self.submitConnect(distance, mode);
        self.hiddenPop(self.popConnect);
      }
    };

    // ini ketika kita klik tombol close add
    document.getElementById("close-add").onclick = function (e) {
      self.hiddenPop(self.popAdd);
    };

    document.getElementById("close-connect").onclick = function (e) {
      self.hiddenPop(self.popConnect);
    };

    // ini ketika kta klik escape maka ak tutup semuanya

    document.addEventListener("keydown", function (e) {
      // ini untk klik escape / delete ketika kita lagi ada di input name, search atau input maka fugnsi deleteline gaakn jalan gtu

      const input = e.target.closest("input,textarea,select");
      //   ini buat delete line
      if (
        (e.key == "Backspace" || e.key == "Delete") &&
        !input && // jadi dia ga lagi di inputan
        self.selectedLine
      ) {
        e.preventDefault();
        self.deleteLine();
      }

      if (e.key == "Escape") {
        self.hiddenPop(self.popAdd);
        self.hiddenPop(self.popConnect);
        self.cancelConnection();
        self.selectedLine = null;
        self.render();
      }
    });

    // NAH INI TUH KALO MISALNYA USER LAGI KLIK MAP ASAL GITU,
    // JADI KALO DIA LAGI MILIH CONECFROM ATAU SELECTED LNE MAKA AKA DINULL AJA JADI KAYA GA JADI GITU

    self.mapArea.addEventListener("click", function (e) {
      if (e.target.closest(".pinpoint,.popup")) return;
      //   INI PENING YA jadi kalo dia klik appan selain pinpoint / popup maka akan jalainn nulllin si slectedline dll
      //   jadi ii tuh funginys kita akn bisa klik apa aja tapi bukan pinpoint/popup, maka kalo dia udah klik connectform / selectedline mka akna null lagi ini keren

      // GINI SALAH YA
      //   self.selectedLine = null;
      //   self.cancelConnection();
      //   self.render();

      //   WAJIB KYA GINI YA
      //   bisa juga gini ya
      // kalau klik area kosong (bukan pin, bukan popup, bukan garis)
      // maka cancel semua state aktif

      const lineSelectId = self.findClickedLine(e);

      if (lineSelectId) {
        self.selectLine(lineSelectId);
        return;
      }

      //   nah dinsi kalo misalnya
      // engga kena garis maka akan di baut null aja semuanya tapi cek juga dulu

      if (self.selectedLine) {
        console.log("masksini");
        self.selectedLine = null;
        self.render();
      }
      if (self.connectFrom) self.cancelConnection();
    });

    // tahap 4

    this.inputFromSearch.oninput = function (e) {
      self.checkSearch();
    };

    this.inputToSearch.oninput = function (e) {
      self.checkSearch();
    };

    this.btnSearch.onclick = function (e) {
      self.searchRoute();
    };

    this.btnToggle.onclick = function () {
      self.panel.classList.toggle("open");
    };

    // ini untuk yang pindah pindah route

    let buttons = document.querySelectorAll(".sort-btn");
    if (buttons) {
      for (let i = 0; i < buttons.length; i++) {
        let btn = buttons[i];
        btn.onclick = function (e) {
          // nah pokoknya kita ilangin dulu class activenya baru ktia tambahin oke
          for (let j = 0; j < buttons.length; j++) {
            btn.classList.remove("active");
          }

          //   nah setlah di hapus maka untuk buto yang lagi di lik sekarn akan di tabahin oke
          btn.classList.add("active");
          // self.sortMode = btn.dataset.sort
          // ga bisa ya soalnya keyword sort itu adalah fugnsi tpai kita bisa pak eini

          self.sortMode = btn.getAttribute("data-sort");
          // self.sortMode = this.getAttribute('data-sort') // gini juga bia
          self.searchRoute();
        };
      }
    }
  }
}

window.onload = function () {
  new App();
};
