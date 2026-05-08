class App {
  static LEBAR_MAP = 982;
  static TINGGI_MAP = 450;
  static Transports = {
    Train: { color: "#33E339", speed: 120, cost: 500, label: "Train" },
    Bus: { color: "#A83BE8", speed: 80, cost: 100, label: "Bus" },
    Airplane: { color: "#000000", speed: 800, cost: 1000, label: "Airplane" },
  };
  constructor() {
    this.ox = 0;
    this.oy = 0;
    this.sox = 0;
    this.soy = 0;
    this.dragX = 0;
    this.dragY = 0;
    this.isGrabbing = false;
    this.pins = [];
    this.connections = [];
    this.scale = 1;
    this.posisiMap = {};
    this.routes = [];
    this.sortMode = "fastest";

    // tahap kedua
    this.connectFrom = null;
    this.connectTo = null;
    this.selectedLine = null;

    const $ = (id) => document.getElementById(id);
    this.mapArea = $("map-area");
    this.mapContainer = $("map-container");
    this.canvas = $("lines-layer");
    this.pinpointsLayer = $("pinpoints-layer");
    this.ctx = this.canvas.getContext("2d");

    // tahap kedua

    this.popAdd = $("popAdd");
    this.formAdd = $("formAdd");
    this.inputName = $("input-name");
    this.closeAdd = $("close-add");

    // tahap ketiga
    this.popConnect = $("popConnect");
    this.closeConnect = $("close-connect");
    this.formConnect = $("formConnect");
    this.inputDistance = $("input-distance");
    this.inputMode = $("input-mode");
    this.btnSubmitConnect = $("btn-submit-connect");

    // tahap ke empat
    this.routePanel = $("route-panel");
    this.inputFrom = $("input-from");
    this.inputTo = $("input-to");
    this.routeResults = $("route-results");
    this.btnSearch = $("btn-search");
    this.search = $("search");

    this.load();
    this.fit();
    this.apply();
    this.render();
    this.setup();
  }

  load() {
    this.pins = JSON.parse(localStorage.getItem("pins")) || [];
    this.connections = JSON.parse(localStorage.getItem("connections")) || [];
  }

  save() {
    localStorage.setItem("pins", JSON.stringify(this.pins));
    localStorage.setItem("connections", JSON.stringify(this.connections));
  }

  apply() {
    this.mapContainer.style.transform = `translate(${this.ox}px, ${this.oy}px) scale(${this.scale})`;
  }

  fit() {
    const lebarMap = this.mapArea.clientWidth;
    const tinggiMap = this.mapArea.clientHeight;
    this.scale = Math.max(lebarMap / App.LEBAR_MAP, tinggiMap / App.TINGGI_MAP);
    this.ox = (lebarMap - App.LEBAR_MAP * this.scale) / 2;
    this.oy = (tinggiMap - App.TINGGI_MAP * this.scale) / 2;
  }

  zoom(clientX, clientY, factor) {
    const relative = this.mapArea.getBoundingClientRect();
    const mx = clientX - relative.left;
    const my = clientY - relative.top;
    const px = (mx - this.ox) / this.scale;
    const py = (my - this.oy) / this.scale;
    this.scale = Math.max(0.3, Math.min(15, this.scale * factor));
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

  pinHtml(pin) {
    let connecting = this.connectFrom == pin.id ? "connecting" : "";
    return `
    <div class="pinpoint" data-id="${pin.id}" style="left:${pin.x}px;top:${pin.y}px;">
      <div class="header ${connecting}">
        <span>${pin.name}</span>
        <img src="/assets/MdiTransitConnectionVariant.svg" alt="" class="btn-connect btn"  data-id="${pin.id}"
        />
        <img src="/assets/MdiTrashCanOutline.svg" alt="" class="btn-delete btn" data-id="${pin.id}" />
      </div>
      <div class="marker-div">
        <img src="/assets/MaterialSymbolsLocationOn.svg" alt="" class="marker" />
      </div>
    </div>    
    `;
  }

  renderPins() {
    let html = ``;
    this.pins.forEach((pin) => (html += this.pinHtml(pin)));
    this.pinpointsLayer.innerHTML = html;
  }

  render() {
    this.renderPins();
    this.renderLines();
    this.apply();
  }

  deletePin(id) {
    this.pins = this.pins.filter((pin) => pin.id != id);
    this.connections = this.connections.filter((conn) => conn.from != id);
    this.save();
    this.render();
  }
  cancelConnect() {
    this.connectFrom = null;
    this.connectTo = null;
    this.render();
  }

  startConnect(id) {
    this.connectFrom = this.connectFrom == id ? null : id;
    this.render();
  }

  submitConnect(distance, mode) {
    console.log({
      f: this.connectFrom,
      t: this.connectTo,
    });
    let isExist;
    this.connections.forEach((conn, index) => {
      if (conn.from == this.connectFrom && conn.to == this.connectTo)
        isExist = conn;
      if (conn.to == this.connectFrom && conn.from == this.connectTo)
        isExist = conn;
    });
    if (isExist) {
      const transportasi = isExist.transportasi;
      let ada;
      transportasi.forEach((tran) => {
        if (tran.mode == mode) {
          alert("udah ad abre, cari lagi mode lain");
          ada = true;
          return;
        }
      });
      if (!ada) transportasi.push({ distance: distance, mode: mode });
    } else {
      this.connections.push({
        id: Date.now(),
        from: this.connectFrom,
        to: this.connectTo,
        transportasi: [{ distance: distance, mode: mode }],
      });
    }
    this.cancelConnect();
    this.save();
    this.render();
  }

  findPin(id) {
    return this.pins.find((pin) => pin.id == id);
  }

  renderLines() {
    this.canvas.width = App.LEBAR_MAP;
    this.canvas.height = App.TINGGI_MAP;

    this.connections.forEach((conn, index) => {
      const from = this.findPin(conn.from);
      const to = this.findPin(conn.to);
      const transportasi = conn.transportasi;
      transportasi.forEach((tran, index) => {
        const off = this.offset(from, to, index, transportasi.length);
        const x1 = from.x + off.x;
        const x2 = to.x + off.x;
        const y1 = from.y + off.y;
        const y2 = to.y + off.y;

        if (this.selectedLine == conn.id) {
          this.ctx.shadowColor = "rgb(219, 229, 17)";
          this.ctx.shadowBlur = 6;
          this.ctx.lineWidth = 4;
        } else {
          this.ctx.shadowBlur = 1;
          this.ctx.shadowColor = "transparent";
          this.ctx.lineWidth = 2;
        }

        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.strokeStyle = App.Transports[tran.mode].color;
        this.ctx.stroke();

        this.ctx.shadowBlur = 1;
        this.ctx.shadowColor = "transparent";
        this.ctx.lineWidth = 2;

        this.ctx.font = "bold 12px sans-serif";
        this.ctx.fillColor = App.Transports[tran.mode].color;
        this.ctx.textAlign = "center";
        this.ctx.fillText(tran.distance, (x1 + x2) / 2, (y1 + y2) / 2);
      });
    });
  }

  offset(from, to, index, total) {
    if (total <= 0) return { x: 0, y: 0 };
    const s = -(total - 1) * 3 + index * 6;
    const dx = Math.abs(from.x - to.x);
    const dy = Math.abs(from.y - to.y);
    if (dx > dy) {
      return { x: 0, y: s };
    } else {
      return { x: s, y: 0 };
    }
  }

  deleteLine() {
    this.connections = this.connections.filter(
      (conn) => conn.id != this.selectedLine,
    );
    this.save();
    this.render();
  }

  findClickedLine(e) {
    const posisiMap = this.toMap(e.clientX, e.clientY);
    for (let i = 0; i < this.connections.length; i++) {
      const conn = this.connections[i];
      const transportasi = conn.transportasi;
      const from = this.findPin(conn.from);
      const to = this.findPin(conn.to);
      for (let j = 0; j < transportasi.length; j++) {
        this.ctx.beginPath();
        this.ctx.moveTo(from.x, from.y);
        this.ctx.lineTo(to.x, to.y);
        this.ctx.lineWidth = 8 / this.scale;

        if (this.ctx.isPointInStroke(posisiMap.x, posisiMap.y)) {
          return conn.id;
        }
      }
    }
    return null;
  }

  addPin(data) {
    this.pins.push({
      id: Date.now(),
      name: data.name,
      x: data.x,
      y: data.y,
    });
    this.save();
    this.render();
  }

  findByName(name) {
    return this.pins.find((pin) => pin.name == name.trim());
  }

  checkRoute() {
    let from = this.findByName(this.inputFrom.value);
    let to = this.findByName(this.inputTo.value);
    if (!from || !to) return;
    this.btnSearch.disabled = !(from != to);
  }

  searchRoute() {
    const from = this.findByName(this.inputFrom.value);
    const to = this.findByName(this.inputTo.value);
    this.routes = [];
    const visited = {};
    visited[from.id] = true;

    const dfs = (current, path) => {
      if (current == to.id) {
        let duration = 0,
          cost = 0;
        let steps = [];

        path.forEach((p, index) => {
          const conn = p.conn;
          const tranportasi = conn.transportasi;
          let fromName = this.findPin(conn.from).name;
          let toName = this.findPin(conn.to).name;

          let best = tranportasi[0];
          let bestValue = Infinity;
          tranportasi.forEach((tran) => {
            const config = App.Transports[tran.mode];
            let value =
              this.sortMode == "fastest"
                ? tran.distance / config.speed
                : tran.distance * config.cost;

            if (value < bestValue) {
              bestValue = value;
              best = tran;
            }
          });
          const config = App.Transports[best.mode];
          duration += best.distance / config.speed;
          cost += best.distance * config.cost;
          steps.push(
            `(${fromName}) -> (${toName}) duration:${duration}|cost:${cost}`,
          );
        });
        this.routes.push({
          duration: duration,
          cost: cost,
          steps: steps,
        });
      }
      this.connections.forEach((conn) => {
        let next;
        if (conn.from == current) next = conn.to;
        if (conn.to == current) next = conn.from;

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
      });
    };

    dfs(from.id, []);
    this.routeResults.classList.remove("hidden");
    this.showRoute();
  }

  showRoute() {
    let sorted = this.routes.sort((a, b) => {
      if (this.sortMode == "fastest") {
        return a.duration - b.duration;
      } else {
        return a.cost - b.cost;
      }
    });
    let html = ``;

    sorted.forEach((data) => {
      html += `
    <div>
      <div>
        ${data.steps.map((step) => `<p>${step}</p>`)}
      </div>
      <div class="info">
        <span>duration: ${data.duration}</span>
        <span>cost: ${data.cost}</span>
      </div>
    </div>        
        `;
    });

    this.routeResults.innerHTML = html;
  }

  pop(element, e) {
    element.style.left = e.clientX + 10 + "px";
    element.style.top = e.clientY - 10 + "px";
    element.classList.remove("hidden");
  }

  hide(element) {
    element.classList.add("hidden");
  }

  setup() {
    const self = this;
    document.addEventListener(
      "wheel",
      function (e) {
        if (!e.ctrlKey) return;
        e.preventDefault(); // bene rbenr pentig bagnet
        self.zoom(e.clientX, e.clientY, e.deltaY < 0 ? 1.15 : 0.85);
      },
      { passive: false },
    );

    document.addEventListener("keydown", function (e) {
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
    });

    self.mapArea.addEventListener("dblclick", function (e) {
      if (e.target.closest(".pinpoint")) e.preventDefault();
      self.posisiMap = self.toMap(e.clientX, e.clientY);
      self.pop(self.popAdd, e);
      self.inputName.value = "";
      self.inputName.focus();
    });

    self.mapArea.addEventListener("mousedown", function (e) {
      if (e.button) return;
      self.isGrabbing = true;
      self.soy = self.oy;
      self.sox = self.ox;
      self.dragX = e.clientX;
      self.dragY = e.clientY;
    });

    document.addEventListener("mousemove", function (e) {
      if (!self.isGrabbing) return;
      self.mapArea.classList.add("grabbing");
      self.ox = self.sox + (e.clientX - self.dragX);
      self.oy = self.soy + (e.clientY - self.dragY);
      self.apply();
    });

    document.addEventListener("mouseup", function (e) {
      self.mapArea.classList.remove("grabbing");
      self.isGrabbing = false;
    });

    self.pinpointsLayer.addEventListener("click", function (e) {
      e.stopPropagation();
      const buttonDelete = e.target.closest(".btn-delete");
      // console.log('masuk')
      // console.log(buttonDelete)
      if (buttonDelete) {
        // console.log('masuk')
        self.deletePin(buttonDelete.dataset.id);
        return;
      }

      const buttonConnect = e.target.closest(".btn-connect");
      if (buttonConnect) {
        // console.log('sada')
        self.startConnect(buttonConnect.dataset.id);
        return;
      }

      const pinHeader = e.target.closest(".pinpoint");
      if (
        pinHeader &&
        self.connectFrom &&
        pinHeader.dataset.id != self.connectFrom
      ) {
        self.pop(self.popConnect, e);
        self.connectTo = pinHeader.dataset.id;

        self.inputDistance.value = "";
        self.inputMode.value = "";
        self.inputDistance.focus();
      }
    });

    document.addEventListener("keydown", function (e) {
      const input = e.target.closest("input,select");

      if (
        (!input && self.selectedLine && e.key == "Delete") ||
        e.key == "Backspace"
      ) {
        self.deleteLine();
        return;
      }

      if (e.key == "Escape") {
        self.hide(self.popAdd);
        self.hide(self.popConnect);
        self.cancelConnect();
        self.render();
      }
    });

    document.addEventListener("click", function (e) {
      // INI INI IN PENITNGG BANGET YA JADI KALO GA PAKE ENGENEKAKN INI TUH NNAY
      // KETIKA KITA KLIK BTN SUBMIT CONENCT AMAH GA BSIA DAN CKOSONG SI CONECT FROM DAN TONYA
      // KARNA KETIAK DI KLIK SINI DIA AKNA LANSUGN OTOMATIS CANCEL CONNECT
      // JADI APS KIT AKLIK BTN CONENCT MALAH CNACEL COONT -> YANGNGAPUSIN SEMUA COONNECT
      if (e.target.closest(".pinpoint,.popup")) return;

      const lineId = self.findClickedLine(e);
      if (lineId) {
        self.selectedLine = lineId;
        self.render();
        return;
      }

      if (self.selectedLine) {
        self.selectedLine = null;
        self.render();
      }

      if (self.connectFrom) {
        self.cancelConnect();
      }
    });

    self.closeAdd.onclick = function (e) {
      self.hide(self.popAdd);
    };
    self.closeConnect.onclick = function (e) {
      self.hide(self.popConnect);
    };

    document.getElementById("btn-route").onclick = () =>
      this.routePanel.classList.toggle("hidden");

    self.formAdd.onsubmit = function (e) {
      e.preventDefault();
      const name = self.inputName.value.trim();
      if (name) {
        self.addPin({
          name: name,
          x: self.posisiMap.x,
          y: self.posisiMap.y,
        });
      }
      self.hide(self.popAdd);
    };

    self.formConnect.onsubmit = function (e) {
      e.preventDefault();
      console.log({
        f: self.connectFrom,
        t: self.connectTo,
      });
      const distance = self.inputDistance.value.trim();
      const mode = self.inputMode.value.trim();
      if (mode && distance) {
        self.submitConnect(distance, mode);
        self.hide(self.popConnect);
      }
    };

    self.inputFrom.onchange = () => this.checkRoute();
    self.inputTo.onchange = () => this.checkRoute();
    // self.btnSearch.onclick = () => this.searchRoute();
    self.search.onsubmit = function (e) {
      e.preventDefault();
      self.searchRoute();
    };

    const buttons = document.querySelectorAll(".btn-sort");
    if (buttons) {
      buttons.forEach((button) => {
        button.onclick = () => {
          buttons.forEach((btn) => btn.classList.remove("active"));
          button.classList.add("active");
          this.sortMode = button.getAttribute("data-sort");
          this.searchRoute();
        };
      });
    }
  }
}

window.onload = () => new App();
