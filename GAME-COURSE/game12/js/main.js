class App {
  static LEBAR_MAP = 982;
  static TINGGI_MAP = 450;

  static Transports = {
    Train: {
      color: "#33E339",
      speed: 120,
      cost: 500,
      label: "Train",
    },
    Bus: {
      color: "#A83BE8",
      speed: 80,
      cost: 100,
      label: "Bus",
    },
    Airplane: {
      color: "#000000",
      speed: 800,
      cost: 1000,
      label: "Airplane",
    },
  };

  constructor() {
    this.ox = 0;
    this.oy = 0;
    this.soy = 0;
    this.sox = 0;
    this.scale = 1;
    this.dragX = 0;
    this.dragY = 0;
    this.isDragging = false;
    this.connectFrom = null;
    this.connectTo = null;
    this.selectedLine = null;
    this.posisiMap = {};

    this.pins = [];
    this.connection = [];

    const $ = (id) => document.getElementById(id);
    this.mapArea = $("map-area");
    this.mapContainer = $("map-container");
    this.canvas = $("lines-layer");
    this.ctx = this.canvas.getContext("2d");
    this.pinpointsLayer = $("pinpoints-layer");
    this.popAdd = $("popup-add");
    this.formAdd = $("form-add");
    this.closeAdd = $("close-add");
    this.inputName = $("input-name");

    // connect
    this.popConnect = $("popup-connect");
    this.formConnect = $("form-connect");
    this.closeConnect = $("close-connect");
    this.inputDistance = $("input-distance");
    this.inputMode = $("input-mode");

    // search
    this.panelRoute = $("panel-route");
    this.inputFrom = $("input-from");
    this.inputTo = $("input-to");
    this.routeResults = $("route-results");
    this.btnRoute = $("btn-route");
    this.sortRoute = "fastest";
    this.btnSearch = $("btn-search");

    this.load();
    this.fit();
    this.render();
    this.apply();
    this.setup(); // focus
  }

  save() {
    localStorage.setItem("pins", JSON.stringify(this.pins));
    localStorage.setItem("connection", JSON.stringify(this.connection));
  }

  load() {
    this.pins = JSON.parse(localStorage.getItem("pins")) ?? [];
    this.connection = JSON.parse(localStorage.getItem("connection")) ?? [];
  }

  render() {
    this.renderPins();
    this.renderLines();
    this.apply();
  }

  pinHtml(pin) {
    let connection = this.connectFrom == pin.id ? "connecting" : "";
    return `
    <div class="pinpoint" data-id='${pin.id}' style='left: ${pin.x}px;top:${pin.y}px;'>
        <div class="pinpoint-label ${connection}">
            <span>${pin.name}</span>
            <img
          src="/assets/MdiTransitConnectionVariant.svg"
          alt="connect-icon"
          class="btn-icon btn-connect" 
          data-id='${pin.id}'/>
            <img src="/assets/MdiTrashCanOutline.svg" alt="delete-icon"  class="btn-icon btn-delete"   data-id='${pin.id}'/>
        </div>
        <div class="pinpoint-marker">
            <img src="/assets/MaterialSymbolsLocationOn.svg" alt="pinpoint" class="marker">
        </div>
    </div>   
    `;
  }

  findPin(id) {
    return this.pins.find((pin) => pin.id == id);
  }

  renderPins() {
    let html = ``;
    for (let i = 0; i < this.pins.length; i++) {
      let pin = this.pins[i];
      html += this.pinHtml(pin);
    }
    this.pinpointsLayer.innerHTML = html;
  }

  renderLines() {
    this.canvas.width = App.LEBAR_MAP;
    this.canvas.height = App.TINGGI_MAP;

    // nah kita loop si connectionnya
    this.connection.forEach((conn, index) => {
      let pinFrom = this.findPin(conn.fromId);
      let pinTo = this.findPin(conn.toId);

      if (!pinFrom || !pinTo) return;

      let transportasi = conn.transportasi;
      transportasi.forEach((tran, i) => {
        let off = this.hitungOffset(pinFrom, pinTo, i, transportasi.length);
        let x1 = pinFrom.x + off.x;
        let x2 = pinTo.x + off.x;
        let y1 = pinFrom.y + off.y;
        let y2 = pinTo.y + off.y;

        if (this.selectedLine == conn.id) {
          this.ctx.lineWidth = 6;
          this.ctx.shadowColor = "rgb(215, 215, 17)";
          this.ctx.shadowBlur = 6;
        } else {
          this.ctx.lineWidth = 2;
          this.ctx.shadowBlur = 0;
          this.ctx.shadowColor = "transparent";
        }

        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.strokeStyle = App.Transports[tran.mode].color;
        this.ctx.stroke();

        // ini buat tuisan di tnegahnya

        this.ctx.shadowBlur = 0;
        this.ctx.shadowColor = "transparent";
        this.ctx.font = "bold 12px sans-serif";
        this.ctx.textAlign = "center";
        this.ctx.fillText(tran.distance + " km", (x1 + x2) / 2, (y1 + y2) / 2);
      });
    });
  }

  hitungOffset(pinFrom, pinTo, index, total) {
    if (total <= 1) return { x: 0, y: 0 };

    let s = -(total - 1) * 3 + index * 6;

    let dx = Math.abs(pinFrom.x - pinTo.x);
    let dy = Math.abs(pinFrom.y - pinTo.y);

    if (dx > dy) {
      return {
        x: 0,
        y: s,
      };
    } else {
      return {
        y: 0,
        x: s,
      };
    }
  }

  startConnect(id) {
    this.connectFrom = this.connectFrom == id ? null : id;
    this.render();
  }

  cancelConection() {
    this.connectFrom = null;
    this.connectTo = null;
    this.render();
  }

  submitConnect(distance, mode) {
    /*
      LOGIKA:
      1. Cek apakah koneksi antara connectFrom dan connectTo sudah ada
      2. Kalau SUDAH ADA:
         - Cek apakah mode transport ini sudah ada di koneksi itu
         - Kalau sudah ada → tolak (alert)
         - Kalau belum → tambahkan transport baru ke koneksi yang sudah ada
      3. Kalau BELUM ADA:
         - Buat koneksi baru dengan transport pertama ini
    */

    let isExistingConnection = null;

    this.connection.forEach((conn, index) => {
      if (conn.fromId == this.connectFrom && conn.toId == this.connectTo)
        isExistingConnection = conn;
      if (conn.toId == this.connectFrom && conn.fromId == this.connectTo)
        isExistingConnection = conn;
    });

    if (isExistingConnection) {
      let trans = isExistingConnection.transportasi;
      for (let i = 0; i < trans.length; i++) {
        let tran = trans[i];
        if (tran.mode == mode) {
          alert("sudah ada ya modenya, cari lagi yang lain");
          return;
        }
      }
      trans.push({
        distance,
        mode,
      });
    } else {
      this.connection.push({
        id: Date.now(),
        fromId: this.connectFrom,
        toId: this.connectTo,
        transportasi: [{ distance, mode }],
      });
    }

    this.cancelConection();
    this.save();
    this.render();
  }

  selectLine(id) {
    this.selectedLine = this.selectedLine == id ? null : id;
    this.render();
  }

  deleteLine() {
    if (!this.selectedLine) return;
    this.connection = this.connection.filter(
      (conn, index) => conn.id != this.selectedLine,
    );
    this.selectedLine = null;
    this.cancelConection();
    this.save();
    this.render();
  }

  findClickedLine(e) {
    let posisiMap = this.toMap(e.clientX, e.clientY);
    for (let i = 0; i < this.connection.length; i++) {
      let conn = this.connection[i];
      let pinFrom = this.findPin(conn.fromId);
      let pinTo = this.findPin(conn.toId);
      if (!pinFrom || !pinTo) {
        return;
      }

      this.ctx.beginPath(); // gausha pake warna
      this.ctx.lineWidth = 8 / this.scale;
      this.ctx.moveTo(pinFrom.x, pinFrom.y);
      this.ctx.lineTo(pinTo.x, pinTo.y);

      if (this.ctx.isPointInStroke(posisiMap.x, posisiMap.y)) {
        return conn.id;
      }
    }

    return null;
  }

  apply() {
    this.mapContainer.style.transform = `translate(${this.ox}px,${this.oy}px) scale(${this.scale})`;
  }

  fit() {
    const areaWidth = this.mapArea.clientWidth;
    const areaHeight = this.mapArea.clientHeight;

    this.scale = Math.max(
      areaWidth / App.LEBAR_MAP,
      areaHeight / App.TINGGI_MAP,
    );

    this.ox = (areaWidth - App.LEBAR_MAP * this.scale) / 2;
    this.oy = (areaHeight - App.TINGGI_MAP * this.scale) / 2;
  }

  zoom(clientX, clientY, factor) {
    const relative = this.mapArea.getBoundingClientRect();
    const mx = clientX - relative.left;
    const my = clientY - relative.top;

    const px = (mx - this.ox) / this.scale;
    const py = (my - this.oy) / this.scale;

    this.scale = Math.max(0.3, Math.min(15, factor * this.scale));
    this.ox = mx - px * this.scale;
    this.oy = my - py * this.scale;
    this.apply();
  }

  toMap(clientX, clientY) {
    const relative = this.mapArea.getBoundingClientRect();
    return {
      x: (clientX - relative.left - this.ox) / this.scale,
      y: (clientY - relative.top - this.oy) / this.scale,
    };
  }

  addPin(name, xMap, yMap) {
    this.pins.push({
      id: Date.now(),
      name: name,
      x: xMap,
      y: yMap,
    });
    this.save();
    this.render();
  }

  deletePin(id) {
    this.pins = this.pins.filter((pin, index) => pin.id != id);
    this.connection = this.connection.filter(
      (pin, index) => pin.fromId != id || pin.toId != id,
    );
    this.save();
    this.render();
  }

  checkSearch() {
    let pinFrom;
    let pinTo;

    for (let i = 0; i < this.pins.length; i++) {
      let pin = this.pins[i];
      if (
        pin.name.toLowerCase().trim() ==
        this.inputFrom.value.toLowerCase().trim()
      )
        pinFrom = pin;
      if (
        pin.name.toLowerCase().trim() == this.inputTo.value.toLowerCase().trim()
      )
        pinTo = pin;
    }

    this.btnSearch.disabled = !(pinFrom != pinTo && pinTo && pinFrom);
  }

findPinName(name) {
  return this.pins.find(
    (pin) => pin.name.toLowerCase().trim() === name.toLowerCase().trim()
  );
}

  searchRoutes() {
    let pinFrom = this.findPinName(this.inputFrom.value);
    let pinTo = this.findPinName(this.inputTo.value);

    if (!pinFrom || !pinTo) return;

    let visited = {};
    visited[pinFrom] = true;
    this.routes = [];

    const dfs = (current, path) => {
      if (current == pinTo.id) {
        let duration = 0;
        let cost = 0;
        let steps = [];

        path.forEach((ph, index) => {
          let transports = ph.conn.transportasi;
          let from = this.findPin(ph.from).name;
          let to = this.findPin(ph.to).name;
          let best = transports[0];
          let bestValue = Infinity;

          transports.forEach((tran, i) => {
            let config = App.Transports[tran.mode];
            let value =
              this.sortRoute == "fastest"
                ? tran.distance / config.speed
                : tran.distance * config.cost;

            if (value < bestValue) {
              bestValue = value;
              best = tran;
            }
          });
          let config = App.Transports[best.mode];
          duration += best.distance / config.speed;
          cost += best.distance * config.cost;
          steps.push(`(${from}) -> (${to}) dist: ${duration} | cost: ${cost}`);
        });

        this.routes.push({
          duration,
          cost,
          steps,
        });
        return;
      }

      this.connection.forEach((conn, index) => {
        let next = null;
        if (conn.fromId == current) next = conn.toId;
        if (conn.toId == current) next = conn.fromId;

        if ((next&& !visited[next])) {
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
      });
    };

    dfs(pinFrom.id, []);
    this.showRoutes();
    this.routeResults.classList.remove("hidden");
  }

  showRoutes() {
    let html = ``;
    let sorted = this.routes
      .slice()
      .sort((a, b) => {
        if (this.sortRoute == "fastest") {
          return a.duration - b.duration;
        } else {
          return a.cost - b.cost;
        }
      })
      .slice(0, 10);

    if (sorted.length <= 0) {
      return `<p>route kosong</p>`;
    }

    sorted.forEach((data, index) => {
      let jam = Math.floor(data.duration);
      let menit = Math.round(data.duration - jam) * 60;
      let waktu = jam ? jam + " h" + menit + " m" : menit + " m";

      html += `
    <div class="route-card">
        <div>
      ${data.steps.map((step, i) => `<div>${i + 1} ${step}<div/>`).join("")}
        </div>
        <div class="info">
                        <span>${waktu}</span>
            <span>Rp${data.cost.toLocaleString("id-ID")}</span>
        </div>
    </div>      

      `;
    });
    this.routeResults.innerHTML = html;
  }

  showPop(element, e) {
    element.classList.remove("hidden");
    element.style.left = e.clientX + 10 + "px";
    element.style.top = e.clientY - 10 + "px";
  }

  hidePop(element) {
    element.classList.add("hidden");
  }

  setup() {
    const self = this;

    this.mapArea.addEventListener(
      "wheel",
      function (e) {
        if (!e.ctrlKey) return;
        e.preventDefault();
        self.zoom(e.clientX, e.clientY, e.deltaY < 0 ? 1.15 : 0.85);
      },
      { passive: false },
    );

    // ini buat ctrl -/+ dan jguga ketika klik ecape
    document.addEventListener("keydown", function (e) {
      // if (!e.ctrlKey) return; jangan langsung di sini tpai dinsi aja ya soalnya isni tu itu lagi gabungin zoom dan click line
      // e.preventDefault(); jangan taruh di global ya soanya nanti bisa ketika saya suah klik dau kali untuk munculin popup malahan pas saya ketik huruf malah hilan pop upnya kenpaa ini dan juga ketiak saya buka popup untuk koneksi malahan ga bia input distancenya
      // e.preventDefault(); malah ga bia di input natinya ya
      const relative = self.mapArea.getBoundingClientRect();
      if (e.ctrlKey) {
        if (e.key == "+" || e.key == "=") {
          e.preventDefault();
          self.zoom(
            (relative.left + relative.width) / 2,
            (relative.top + relative.height) / 2,
            1.15,
          );
        }

        if (e.key == "-" || e.key == "_") {
          e.preventDefault();
          self.zoom(
            (relative.left + relative.width) / 2,
            (relative.top + relative.height) / 2,
            0.85,
          );
        }
      }

      let input = e.target.closest("input,textarea,select");
      if (
        !input &&
        (e.key == "Delete" || e.key == "Backspace") &&
        self.selectedLine
      ) {
        e.preventDefault();
        // nanti ini kita pake buat apus line
        self.deleteLine();
      }
    });

    self.mapArea.addEventListener("mousedown", function (e) {
      if (e.button || e.target.closest(".pinpoint,popup")) return;
      self.isDragging = true;
      self.soy = self.oy;
      self.sox = self.ox;
      self.dragX = e.clientX;
      self.dragY = e.clientY;
    });

    self.mapArea.addEventListener("mousemove", function (e) {
      if (!self.isDragging) return;
      self.mapArea.classList.add("grabbing");
      self.ox = self.sox + (e.clientX - self.dragX);
      self.oy = self.soy + (e.clientY - self.dragY);
      self.apply();
    });

    self.mapArea.addEventListener("mouseup", function (e) {
      self.mapArea.classList.remove("grabbing");
      self.isDragging = false;
    });

    self.mapArea.addEventListener("dblclick", function (e) {
      if (e.button) return;
      e.preventDefault();
      self.posisiMap = self.toMap(e.clientX, e.clientY);
      self.showPop(self.popAdd, e);
      self.inputName.value = "";
      self.inputName.focus();
    });

    // ini ketika klik button yang ada di pinpoint label
    self.pinpointsLayer.addEventListener("click", function (e) {
      e.stopPropagation();
      let buttonDelete = e.target.closest(".btn-delete");
      if (buttonDelete) {
        console.log("masukk sini");
        self.deletePin(buttonDelete.dataset.id);
        self.render();
      }

      let buttonConnect = e.target.closest(".btn-connect");
      if (buttonConnect) {
        self.startConnect(buttonConnect.dataset.id); // ini bakalan ngisi conenctfrom
        return;
      }

      // nah ini ketika dia klik pin point taip ketiak dai juga udah klik si connect btn ya

      let pinpoint = e.target.closest(".pinpoint");
      // console.log(pinpoint)
      if (
        self.connectFrom &&
        self.connectFrom != pinpoint.dataset.id &&
        pinpoint
      ) {
        self.connectTo = pinpoint.dataset.id;
        self.showPop(self.popConnect, e);
        self.inputDistance.value = "";
        self.inputMode.value = "";
        self.inputDistance.focus();
      }
    });

    // bedanya click ni sama yan di atas iu kaloyang diatas dia khsus kena si pin
    // tpai kalo yang ini khusus engga kena si pin

    self.mapArea.addEventListener("click", function (e) {
      // ini untuk klik apapin di map lalu bakal gagalin conect dll
      if (e.target.closest(".pinpoint,popup")) return;
      self.hidePop(self.popAdd);
      self.hidePop(self.popConnect);

      let lineId = self.findClickedLine(e);
      if (lineId) {
        // nah ini artinya ketia dia klik line nya ya
        self.selectLine(lineId);
        return; // stop, tidak perlu cancel connect
      }
      //  kalau klik area kosong (bukan pin, bukan popup, bukan garis)
      // maka cancel semua state aktif

      if (self.connectFrom) self.cancelConection();
      if (self.selectedLine) {
        self.selectedLine = null;
        self.render();
      }
    });

    self.formAdd.onsubmit = function (e) {
      e.preventDefault();
      const name = self.inputName.value.trim();
      if (name) {
        self.addPin(name, self.posisiMap.x, self.posisiMap.y);
        self.hidePop(self.popAdd);
        self.render();
      }
    };

    self.formConnect.onsubmit = function (e) {
      e.preventDefault();
      let distance = self.inputDistance.value.trim();
      let mode = self.inputMode.value.trim();
      if (mode && distance) {
        self.submitConnect(distance, mode);
        self.hidePop(self.popConnect);
      }
    };

    document
      .querySelector(".close-add")
      .addEventListener("click", function (e) {
        self.hidePop(self.popAdd);
      });

    document
      .querySelector(".close-connect")
      .addEventListener("click", function (e) {
        self.hidePop(self.popConnect);
      });

    self.btnRoute.onclick = function (e) {
      console.log("buka route");
      self.panelRoute.classList.toggle("open");
    };

    self.inputFrom.oninput = function (e) {
      self.checkSearch();
    };
    self.inputTo.oninput = function (e) {
      self.checkSearch();
    };

    self.btnSearch.onclick = function (e) {
      self.searchRoutes();
    };


    let butttons = document.querySelectorAll('.btn-sort');
    if(butttons){
      butttons.forEach((button, index) => {
        button.onclick = function(e){
          butttons.forEach((btn, i) => btn.classList.remove('active'))
        }
        button.classList.add('active')
        self.sortRoute = button.getAttribute('data-sort');
        self.searchRoutes()
      })
    }
  }
}

window.onload = () => {
  new App();
};
