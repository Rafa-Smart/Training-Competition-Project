class App {
  // ini ada di aknan bawah ya untuk ukran si gambarnya coba aja buka gambarnya di vscode terus liat

  static lebarMap = 982;
  static tinggiMap = 450;
  //     . Train
  // ○ Line color: #33E339
  // ○ Speed: 120 km/h
  // ○ Cost: Rp500/km
  // LKS Nasional XXXIII Web Technologies - @webtechindonesia - Rev0 Page 3 of 8
  // 2. Bus
  // ○ Line color: #A83BE8
  // ○ Speed: 80 km/h
  // ○ Cost: Rp100/km
  // 3. Airplane
  // ○ Line color: #000000
  // ○ Speed: 800 km/h
  // ○ Cost: Rp1.000/km 

  static Transportasi = {
    Train: {
      color: "#33E339",
      speed: 120,
      cost: 500,
    },
    Bus: {
      color: "#A83BE8",
      speed: 80,
      cost: 100,
    },
    Airplane: {
      color: "#000000",
      speed: 800,
      cost: 1000,
    },
  };

  constructor() {
    this.scale = 1;
    this.dragging = false;
    this.connectFrom = null;
    this.connectTo = null;
    this.selectedLine = null;
    this.sortMode = "fastest";
    this.routes = [];
    this.clickPos = {};
    this.ox = 0;
    this.oy = 0;
    this.sox = 0;
    this.soy = 0;
    this.dragY = 0;
    this.dragX = 0;
    var $ = function (id) {
      return document.getElementById(id);
    };
    this.canvas = $("lines-layer");
    this.ctx = this.canvas.getContext("2d");
    this.mapArea = $("map-area");
    this.btnToggle = $("toggle-search");
    this.inputNameAdd = $("input-name");
    this.mapContainer = $("container-map");
    this.pinsLayer = $("pinpoints-layer");
    this.inFrom = $("from");
    this.inputDistance = $("input-distance");
    this.inputMode = $("input-mode");
    this.panel = $("route-panel");
    this.popAdd = $("popup-add");
    this.btnSearch = $("btn-search");
    this.inTo = $("to");
    this.results = $("route-results");
    this.popupConnect = $("popup-connect");
    this.connection = [
      {
        id: "test",
        fromId: "jakarta",
        toId: "bandung",
        transportasi: [
          // ini nanti dari inputan ya
          {
            mode: "Train",
            distance: 200,
          },
          {
            mode: "Bus",
            distance: 25, // ini nanti dari inputan ya
          },
        ],
      },
    ];
    this.pins = [
      {
        id: "jakarta",
        name: "Jakarta",
        x: 100, // ini dari peta ya
        y: 200,
      },
      {
        id: "bandung",
        name: "Bandung",
        x: 200, // ini dari peta ya
        y: 300,
      },
    ];

    this.fit();
    this.render();
    this.setup();
  }

  save() {
    localStorage.setItem("pins", JSON.stringify(this.pins));
    localStorage.setItem("connection", JSON.stringify(this.connection));
  }

  load() {
    this.pins = JSON.parse(localStorage.getItem("pins"));
    this.connection = JSON.parse(localStorage.getItem("connection"));
  }

  fit() {
    console.log("test");
    var widthMapArea = this.mapArea.clientWidth;
    var heightMapArea = this.mapArea.clientHeight;

    this.scale = Math.max(
      widthMapArea / App.lebarMap,
      heightMapArea / App.tinggiMap,
    );
    this.ox = (widthMapArea - App.lebarMap * this.scale) / 2;
    this.oy = (heightMapArea - App.tinggiMap * this.scale) / 2;
  }

  apply() {
    this.mapContainer.style.transform = `translate(${this.ox}px, ${this.oy}px) scale(${this.scale})`;
  }

  zoom(clientX, clientY, factor) {
    var relative = this.mapArea.getBoundingClientRect();
    var ukuranLebarLayar = clientX - relative.left;
    const ukuranTinggiLayar = clientY - relative.top;

    // dapetin ukuran peta asli
    const petaX = (ukuranLebarLayar - this.ox) / this.scale;
    const petaY = (ukuranTinggiLayar - this.oy) / this.scale;

    // hitung lagi scalenya
    this.scale = Math.max(0.3, Math.min(15, factor * this.scale));
    this.ox = ukuranLebarLayar - petaX * this.scale
    this.oy = ukuranTinggiLayar - petaY * this.scale
    this.apply();
  }

  toMap(clientX, clientY) {
    const relative = this.mapArea.getBoundingClientRect();
    const ukuranLebarLayar = clientX - relative.left;
    const ukuranTinggiLayar = clientY - relative.top;
    return {
      x: (ukuranLebarLayar - this.ox) / this.scale,
      y: (ukuranTinggiLayar - this.oy) / this.scale,
    };
  }

  generatePin(pin) {
    // jaid kalo ternyaata si pin id ini adalah id yang kita klik
    // nanti itu isi dari conenctForm adaalh pin yangkita klik tombol connectnya

    // nanti ad animasi connecting ya
    const isConnecting = this.connectFrom == pin.id ? " connecting" : "";

    // nah disini kita kaih style biar nanti tempatnya itu ad dititik yan dah di tentukan ya
    // ingat ya di class pin ini uga udha di kasih absolute
    return ` <div class="pin" data-id="${pin.id}" style="left:${pin.x}px;top:${pin.y}px;">
      <div class="pin-action ${isConnecting}">
        <div><span>${pin.name}</span></div>
        <div> 
          <img
            data-id="${pin.id}"
            class="btn-connect-pin"
            src="/assets/MdiTransitConnectionVariant.svg"
            alt="connect"
          />
        </div>
        <div>
          <img
            class="btn-delete-pin"
            data-id="${pin.id}"
            src="/assets/MdiTrashCanOutline.svg"
            alt="delete"
          />
        </div>
      </div>
      <div class="pin-svg">
        <img
          class="pin-img"
          src="assets/MaterialSymbolsLocationOn.svg"
          alt=""
        />
      </div>
    </div>`;
  }

  render() {
    this.renderPins();
    this.renderLines();
    this.apply();
  }

  renderPins() {
    var html = "";
    for (let i = 0; i < this.pins.length; i++) {
      html += this.generatePin(this.pins[i]);
    }
    this.pinsLayer.innerHTML = html;
  }

  renderLines() {
    // kita reset canvaas ya pake cara ini
    this.canvas.width = App.lebarMap;
    this.canvas.height = App.tinggiMap;

    // nah kita loop seua koneksi

    for (let i = 0; i < this.connection.length; i++) {
      let conn = this.connection[i];
      const fromPin = this.findPin(conn.fromId);
      const toPin = this.findPin(conn.toId);
      console.log(toPin);
      if (!fromPin || !toPin) continue; // lewat aja sekarang
      // console.log(conn)
      const jumlahTransportasi = conn.transportasi.length;
      for (let i = 0; i < jumlahTransportasi; i++) {
        console.log("satu kali ", i);
        let transportasiLoop = conn.transportasi[i];

        // kita buat ofset nya
        let off = this.offset(fromPin, toPin, i, jumlahTransportasi);
        let fromPinX = fromPin.x + off.x;
        let toPinX = toPin.x + off.x;
        let fromPinY = fromPin.y + off.y;
        let toPinY = toPin.y + off.y;

        // disni kita cek duu apkaah ada satu line di sini yang lagi di seleect

        // selectline adalah id ya dan ini tuh bukan id per pin api id dari connectionnya
        if (this.selectedLine == conn.id) {
          this.ctx.shadowColor = "rgb(223, 223, 13)";
          this.ctx.shadowBlur = 6;
          this.ctx.lineWidth = 2;
        } else {
          this.ctx.shadowColor = "transparent";
          this.ctx.shadowBlur = 0;
          this.ctx.lineWidth = 1;
        }

        this.ctx.beginPath();
        this.ctx.moveTo(fromPinX, fromPinY);
        this.ctx.lineTo(toPinX, toPinY);
        this.ctx.strokeStyle = App.Transportasi[transportasiLoop.mode].color;
        this.ctx.stroke();

        // sekalian tulis istance di tengh
        this.ctx.shadowColor = "transparent";
        this.ctx.shadowBlur = 0;
        this.ctx.fillStyle = App.Transportasi[transportasiLoop.mode].color;
        this.ctx.font = "bold 11px sans-serif";
        this.ctx.textAlign = "center";
        this.ctx.fillText(
          transportasiLoop.distance + "km",
          (fromPinX + toPinX) / 2,
          (toPinY + fromPinY) / 2,
        );
      }
    }
  }

  offset(fromPin, toPin, index, jumlah) {
    if (jumlah <= 1) return { x: 0, y: 0 };
    const s = -(jumlah - 1) * 3 + index * 6;

    // ini uth cuma pengen dapetin data lebar dan tingginya ja dan ga peduli kalo dia min atau plus
    const dx = Math.abs(toPin.x - fromPin.x);
    const dy = Math.abs(toPin.y - fromPin.y);

    if (dx >= dy) {
      // ini pengecekan jika dia itu
      // horizontal
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
    //  return this.pins.filter((pin) => {
    //     return pin.id == id
    //   });

    // jangan pake ini soalnya kan return array jadi pae ini aja
    let hasil;
    for (let i = 0; i < this.pins.length; i++) {
      if (this.pins[i].id == id) {
        hasil = this.pins[i];
      }
    }
    // console.log('inipin', hasil)
    return hasil;
  }

  addPin(x, y, name) {
    this.pins.push({
      name: name,
      id: Date.now(),
      x: x,
      y: y,
    });

    this.save();
    this.render();
  }

  deletePin(id) {
    this.pins = this.pins.filter((pin) => {
      return pin.id != id;
    });

    // kita hapus juga semua conn nya

    this.connection = this.connection.filter((conn) => {
      return conn.fromId != id && conn.toId != id;
    });
    this.save();
    this.render();
  }

  startConnection(id) {
    // adi ini uth kaya toogle nanti kalo ikita klik id yang udah ada di cnenctfrom (artinya kan lagi di klik) maka akn kaya toogle gitu jdi null
    this.connectFrom = this.connectFrom == id ? null : id;
    this.render();
  }

  cancelConnection() {
    this.connectFrom = null;
    this.connectTo = null;
    this.render();
  }

  submitConnection(distance, mode) {
    // jdi gini cek dulu apkah udah ada apa belum

    let isObjekConn;

    for (let i = 0; i < this.connection.length; i++) {
      // di sini kita cek bolah baik ya
      let conn = this.connection[i];
      if (
        (conn.fromId == this.connectFrom && conn.toId == this.connectTo) ||
        (conn.fromId == this.connectTo && conn.toId == this.connectFrom)
      ) {
        isObjekConn = conn;
      }
    }

    // sekarang di cek kalo ada
    if (isObjekConn) {
      // kalo ada maka cek dulu paka transport dia itu udah pernah di inut apa belum
      for (let i = 0; i < isObjekConn.transportasi.length; i++) {
        if (isObjekConn.transportasi[i].mode == mode) {
          alert("sudah ada ya pilih silahkan transportasi lain");
          return;
        }
      }
      // kalo engga ada maka tambahin
      isObjekConn.transportasi.push({ distance, mode });
    } else {
      // jik udha pernah membuat coneksi aka langsung aja kit buat koneksi baru

      this.connection.push({
        id: Date.now(),
        fromId: this.connectFrom,
        toId: this.connectTo,
        transportasi: [{ mode: mode, distance: distance }],
      });
    }

    // setleah itu kita hdiepop dan lian lain

    this.cancelConnection(); //ini reset data inputan
    this.save();
    this.render();
  }
  selectLine(id) {
    // ini juga sama kana jadi toogle gitu
    this.selectedLine = this.selectedLine == id ? null : id;
    this.render();
  }

  deleteLine() {
    if (!this.selectedLine) return;
    this.connection = this.connection.filter((conn) => {
      return conn.id != this.selectedLine;
    });
    this.selectedLine = null;
    this.save();
    this.render();
  }

  // ini fungsi untk bisa cek apakah linenya sednag di klik ap engga
  findClickedLine(e) {
    const titikMap = this.toMap(e.clientX, e.clientY);
    for (let i = 0; i < this.connection.length; i++) {
      let pin = this.connection[i];
      const fromPin = this.findPin(pin.fromId);
      const toId = this.findPin(pin.toId);

      if (!toId || !fromPin) continue;

      // nah ini tuh kita pake this.scale ya biar bisa sesuai sama ukuran nya
      this.ctx.lineWidth = 7 / this.scale;
      this.ctx.moveTo(fromPin.x, fromPin.y);
      this.ctx.lineTo(toId.x, toId.y);

      // jadi kalo di klik maka dia akn ngembaliin data id connnya
      if (this.ctx.isPointInStroke(titikMap.x, titikMap.y)) {
        return pin.id;
      }

      // kalo engga return null
    }
    return null;
  }

  checkSearch() {
    // ini tuh fungis yang cuma berfungsi untuk cek apakah valid apa engga dan ada apa enga data pinnya yang di ketikan oleh user

    let userInputPinFrom = this.inFrom.value;
    let userInputPinTo = this.inTo.value;
    let dapetFrom = null;
    let DapetTo = null;

    for (let i = 0; i < this.pins.length; i++) {
      if (userInputPinFrom == this.pins[i].id) dapetFrom = true;
      if (userInputPinTo == this.pins[i].id) DapetTo = true;
    }

    // sekarang kita cek
    // alh ya ini
    if (!(dapetFrom != DapetTo && dapetFrom && DapetTo)) {
      this.btnSearch.disable = true;
    }
    // this.btnSearch.disabled = !(dapetFrom && dapetTo);
  }

  searchRoute() {
    let fromPin;
    let toPin;

    for (let i = 0; i < this.pins.length; i++) {
      if (this.inFrom.value.trim() == this.pins[i].name) fromPin = this.pins[i];
      if (this.inTo.value.trim() == this.pins[i].name) toPin = this.pins[i];
    }

    this.routes = [];

    let visited = {};
    visited[fromPin.id] = true;

    const dfs = (current, path) => {
      if (current == toPin) {
        let duration;
        let cost;
        let steps = [];

        for (let i = 0; i < path.length; i++) {
          let pathdata = path[i];
          let transports = pathdata.conn.transportasi;

          let fromPinName = this.findPin(pathdata.from).name;
          let toPinName = this.findPin(pathdata.to).name;

          let best = transports[0];
          let bestValue = Infinity;// Transportasi 

          for (let j = 0; j < transports.length; j++) {
            let tr = transports[j];
            let config = App.Transportasi[tr.mode];
            let value =
              this.sortMode == "fastest"
                ? tr.distance / config.speed
                : tr.distance * config.cost;

            if (value < bestValue) {
              bestValue = value;
              best = transports[j];
            }
          }
// best.distance / config.cost
          var config = App.Transportasi[best.mode];
          duration += best.distance / config.speed;
          cost += best.distance * config.cost;
          steps.push(`(${fromPin} -> (${toPin}) (${duration}) (${cost}))`);
        }

        this.routes.push({
          duration: duration,
          cost: cost,
          steps: steps,
        });
        return;
      }
      for (let i = 0; i < this.connection.length; i++) {
        let conn = this.connection[i];
        let next = null;
        if (conn.fromId == current) next = conn.toId;
        if ((conn.toId == current)) next = conn.fromId;
        if (next && !visited[next]) {
          visited[next] = true;
          path.push({
            from: current,
            to: next,
            conn: conn,
          });
          dfs(next, path);
          delete visited[next];
          path.pop();
        }
      }
    };

    document.getElementById("sort-control").classList.remove("hidden");
    this.showRoutes();
  }

  showRoutes() {
    const sortedData = this.routes
      .slice() // ini kita slice biar dia engga ngeganggu yang lain jadi ini mah kaya buat array abru aja
      .sort((a, b) => {
        return this.sortMode == "fastest" ? a.duration - b.duration : a.cost - b.cost;
      })
      .slice(0, 10);

    if (!sortedData) {
      this.results.innerHTML = `<p>Routes Not Found</>`;
      return;
    }

    let html = "";
    for (let i = 0; i < sortedData.length; i++) {
      let jam = Math.floor(sortedData[i].duration);
      let menit = Math.round((sortedData[i].duration - jam) * 60);
      let waktu = jam ? jam + "h " + menit + " min" : menit + " min";
      html += `<div class="route-card">
      <div class="steps">
        ${sortedData[i].steps
          .map(
            (step, index) => `
    <div>
      ${index + 1}. ${step}
    </div>
  `,
          )
          .join("")}
      </div>
      <div class="info">
        <p>${waktu}</p>
        <p>${sortedData[i].cost.toLocaleString("id-ID")}</p>
      </div>
    </div>`;
    }
    this.results.innerHTML = html;
  }

  showPop(elemen, e) {
    elemen.style.left = e.clientX + 10 + "px";
    elemen.style.top = e.clientY + 10 + "px";
    elemen.classList.remove("hidden");
  }

  hidePop(elemen) {
    elemen.classList.add("hidden");
  }

  setup() {
    // harus pake ini aja lah
    const self = this;

    // 1.button toggle
    this.btnToggle.onclick = () => this.panel.classList.toggle("open");

    // 2. control + zoom
    this.mapArea.addEventListener(
      "wheel",
      function (e) {
        if (!e.ctrlKey) return;

        e.preventDefault();
        // deltax itu untuk mengetahui apakh kita lagi scroll kemana bawh atau ats pake mouse ya yang di geser
        self.zoom(e.clientX, e.clientY, e.deltaY < 0 ? 1.15 : 0.85);
      },
      { passive: false },
    );
    // passive (boolean):
    // Jika true, ini memberitahu browser bahwa fungsi listener tidak akan memanggil preventDefault(). Ini sangat berguna untuk meningkatkan performa scrolling (terutama pada event touchstart atau wheel), karena browser tidak perlu menunggu listener selesai sebelum merespons scroll.

    // 3. ctrl - dan + (akan di ke tengah zoomnya)
    document.addEventListener("keydown", function (e) {
      if (!e.ctrlKey) return;

      const relative = self.mapArea.getBoundingClientRect();

      if (e.key == "+" || e.key == "=") {
        e.preventDefault();
        self.zoom(
          relative.width + relative.left / 2,
          relative.height - relative.top,
          1.15,
        );
      }

      if (e.key == "-" || e.key == "_") {
        e.preventDefault();
        self.zoom(
          relative.width + relative.left / 2,
          relative.height + relative.top / 2,
          0.85,
        );
      }
    });

    // 4. drag peta
    self.mapArea.addEventListener("mousedown", function (e) {
      if (e.target.closest(".pinpoints,.popup") || e.button) return;
      self.dragging = true;
      // jadi inituh funsiny untuk simpan koordinat awal
      self.dragX = e.clientX; // simpen koordinat  layar x sebelum
      self.dragY = e.clientY; // simpen kordinat layar y sebelum
      self.sox = self.ox; // sox adalah pergeseran sebelum
      self.soy = self.oy; // soy adalah pergeseran atas bwah seblum
    });

    document.addEventListener("mousemove", function (e) {
      if (!self.dragging) return;
      // nah sekrang si oxnya kita perbari lagi inget ya ti sox dan soy dna dragx dan dragy nya itu udah di simpan

      self.ox = self.sox + (e.clientX - self.dragX);
      self.oy = self.soy + (e.clientY - self.dragY);
      self.apply();
    });

    // pas diangkat
    document.addEventListener("mouseup", function () {
      self.dragging = false;
    });

    // 5.double click tambah pin

    this.mapArea.addEventListener("dblclick", function (e) {
      if (e.target.closest(".pinpoints,.popup")) return;

      self.clickPos = self.toMap(e.clientX, e.clientY);
      self.showPop(self.popAdd, e);
      self.inputNameAdd.value = "";
      self.inputNameAdd.focus();
    });

    // 6.ketika di klik pin

    this.pinsLayer.addEventListener("click", function (e) {
      e.preventDefault();
      let buttonConnect = e.target.closest(".btn-connect-pin");
      if (buttonConnect) {
        self.startConnection(buttonConnect.dataset.id);
        return;
      }
      let buttonDelete = e.target.closest(".btn-delete-pin");
      if (buttonDelete) {
        self.deletePin(buttonDelete.dataset.id);
        return;
      }

      let pin = e.target.closest(".pin");
      if (pin && self.connectFrom && self.connectFrom !== pin.dataset.id) {
        self.connectTo = pin.dataset.id;
        self.showPop(self.popupConnect, e);
        self.inputDistance.value = "";
        self.inputMode.value = "";
        self.inputDistance.focus();
      }
    });

    // ini di kirim y bukan buka pop
    document.getElementById("form-add").onsubmit = function (e) {
      e.preventDefault();
      let input = self.inputNameAdd.value.trim();
      if (input) {
        self.addPin(self.clickPos.x, self.clickPos.y, input);
        self.hidePop(self.popAdd);
      }
    };

    document.getElementById("form-connect").onsubmit = function (e) {
      e.preventDefault();
      let distance = self.inputDistance.value.trim();
      let mode = self.inputMode.value.trim();
      if (mode && distance) {
        self.submitConnection(distance, mode);
        self.hidePop(popupConnect);
      }
    };

    document.getElementById("close-add").onclick = function () {
      self.hidePop(self.popAdd);
    };

    document.getElementById("close-connect").onclick = function () {
      self.hidePop(self.popupConnect);
    };

    // delete / escape

    document.addEventListener("keydown", function (e) {
      // untuk pastiin bhwa yang di klik itu bukan paslagi inppuT OKE

      const inputData = e.target.closest("input,select,textarea");
      if (
        !inputData &&
        self.selectedLine &&
        (e.key == "Delete" || e.key == "Backspace")
      ) {
        e.preventDefault();
        self.deleteLine();
      }

      // kalo misalnya escape berati dia itu pengen hapus atau back semuanya ya

      if (e.key == "Escape") {
        self.hidePop(self.popupConnect);
        self.hidePop(self.popAdd);
        self.cancelConnection();
        self.selectedLine = null;
        self.render();
      }
    });

    // untuk click apapun yang bisa bikin gagalin connect atu gagalin selectdline

    this.mapArea.addEventListener("click", function (e) {
      if (e.target.closest(".pinpoint,.popup")) return;
      let lineYangDiSelect = self.findClickedLine(e);
      if (lineYangDiSelect) {
        self.selectLine(lineYangDiSelect);
        return;
      }
      if (e.target.closest(".form-add,.popup-add")) {
        self.hidePop(self.popupConnect);
        self.hidePop(self.popAdd);
        self.cancelConnection();
        self.selectedLine = null;
        self.render();
      }
      if (self.connectFrom) self.cancelConnection();
      if (self.selectedLine) {
        self.selectedLine = null;
        self.render();
      }
    });

    // untuk searching
    this.inFrom.oninput = function (e) {
      self.checkSearch();
    };

    this.inTo.oninput = function () {
      self.checkSearch();
    };

    this.btnSearch.onclick = function () {
      self.searchRoute();
    };

    // untuk sort

    const buttons = document.querySelectorAll(".sort-btn");
    buttons.forEach((button, index) => {
      button.onclick = function () {
        buttons.forEach((element) => {
          button.classList.remove("active");
        });
        this.classList.add("active");
        self.sortMode = this.getAttribute("data-sort");
        self.showRoutes();
      };
    });
  }
}

const game = new App();
