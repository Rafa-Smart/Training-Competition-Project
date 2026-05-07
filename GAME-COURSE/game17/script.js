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
    this.soy = 0;
    this.sox = 0;
    this.scale = 1;
    this.grabX = 0;
    this.grabY = 0;

    // tahpa kedua
    this.posisiMap = {};
    this.connectFrom = null;
    this.connectTo = null;
    this.selectedLine = null;
    this.pins = [];
    this.connections = [];
    this.routes = [];
    this.modeSearch = "fastest";

    const $ = (id) => document.getElementById(id);
    this.mapArea = $("map-area");
    this.mapContainer = $("map-container");
    this.canvas = $("lines-layer");
    this.pinpointsLayer = $("pinpoints-layer");
    this.ctx = this.canvas.getContext("2d");

    // tahap kedua;
    this.popAdd = $("popup-add");
    this.btnCloseAdd = $("close-add"); // kekna ga perlu deh
    this.formAdd = $("form-add");
    this.inputName = $("input-name");

    // tahap ketiga
    this.popConnect = $("popup-connect");
    this.btnCloseConnect = $("close-connect"); // keknya ga perlu deh
    this.formConnect = $("form-connect");
    this.inputDistance = $("input-distance");
    this.inputMode = $("input-mode");

    // thaap keempat
    this.routePanel = $("route-panel");
    this.inputFrom = $("input-from");
    this.inputTo = $("input-to");
    this.btnSearch = $("btn-search");
    this.routeResults = $("route-results");
    // this.btnClosePanel = $('btn-close-panel')

    this.btnRoute = $('btn-route')

    this.load();
    this.fit();

    this.apply();
    this.render();
    this.setup();
  }

  load() {
    this.connections = JSON.parse(localStorage.getItem("connection")) || [];
    this.pins = JSON.parse(localStorage.getItem("pins")) || [];
  }

  save() {
    localStorage.setItem("pins", JSON.stringify(this.pins));
    localStorage.setItem("connection", JSON.stringify(this.connections));
  }

  apply() {
    this.mapContainer.style.transform = `translate(${this.ox}px, ${this.oy}px) scale(${this.scale})`;
  }

  fit() {
    const lebarArea = this.mapArea.clientWidth;
    const tinggiArea = this.mapArea.clientHeight;
    this.scale = Math.max(
      lebarArea / App.LEBAR_MAP,
      tinggiArea / App.TINGGI_MAP,
    );
    this.ox = (lebarArea - App.LEBAR_MAP * this.scale) / 2;
    this.oy = (tinggiArea - App.TINGGI_MAP * this.scale) / 2;
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
    const connecting = this.connectFrom == pin.id ? "connecting" : "";
    return `
     <div class="pinpoint" data-id="${pin.id}" style="left:${pin.x}px;top:${pin.y}px;">
        <div class="header ${connecting}">
            <span>${pin.name}</span>
            <img src="/assets/MdiTransitConnectionVariant.svg" alt="" class="btn btn-connect"  data-id="${pin.id}">
            <img src="/assets/MdiTrashCanOutline.svg"  data-id="${pin.id}" alt="" class="btn btn-delete">
        </div>
        <div class="marker-div">
            <img src="/assets/MaterialSymbolsLocationOn.svg" class="marker" data-id="${pin.id}" alt="">
        </div>
    </div>   
    `;
  }

  renderPins() {
    let html = ``;

    this.pins.forEach((pin) => (html += this.pinHtml(pin)));
    this.pinpointsLayer.innerHTML = html;
  }

  renderLines() {
    this.canvas.width = App.LEBAR_MAP;
    this.canvas.height = App.TINGGI_MAP;
    this.connections.forEach((conn) => {
      const from = this.findPin(conn.from);
      const to = this.findPin(conn.to);
      const transports = conn.transportasi;
      transports.forEach((tran, index) => {
        const off = this.offset(from, to, index, transports.length);
        const x1 = from.x + off.x;
        const x2 = to.x + off.x;
        const y1 = from.y + off.y;
        const y2 = to.y + off.y;

        if (this.selectedLine == conn.id) {
          this.ctx.lineWidth = 6;
          this.ctx.shadowBlur = 6;
          this.shadowColor = "rgb(233, 218, 16";
        } else {
          this.ctx.lineWidth = 2;
          this.ctx.shadowBlur = 2;
          this.shadowColor = "transparent";
        }

        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.strokeStyle = App.Transports[tran.mode].color;
        this.ctx.stroke();

        // buat textnya
        this.ctx.shadowBlur = 0;
        this.ctx.shadowColor = "transparent";
        this.ctx.font = "bold 12px sans-serif";
        this.ctx.fillColor = App.Transports[tran.mode].color;
        this.ctx.textAlign = "center";

        this.ctx.fillText(tran.distance, (x1 + x2) / 2, (y1 + y2) / 2);
      });
    });
  }

  offset(pinFrom, pinTo, index, total) {
    if (total <= 0) return { x: 0, y: 0 };
    const s = -(total - 1) * 3 + index * 6;
    const dx = Math.abs(pinFrom.x - pinTo.x);
    const dy = Math.abs(pinFrom.y - pinTo.y);
    if (dx > dy) {
      return { x: 0, y: s };
    } else {
      return { x: s, y: 0 };
    }
  }

  findPin(id) {
    return this.pins.find((pin) => pin.id == id);
  }

  findClickedLine(e) {
    const posisiMapCuy = this.toMap(e.clientX, e.clientY);
    for (let i = 0; i < this.connections.length; i++) {
      const conn = this.connections[i];
      const from = this.findPin(conn.from);
      const to = this.findPin(conn.to);
      const tranports = conn.transportasi;
      for (let j = 0; j < tranports.length; j++) {
        this.ctx.beginPath();
        this.ctx.lineWidth = 8 / this.scale;
        this.ctx.moveTo(from.x, from.y);
        this.ctx.lineTo(to.x, to.y);

        if (this.ctx.isPointInStroke(posisiMapCuy.x, posisiMapCuy.y)) {
          return conn.id;
        }
      }
    }
    return null;
  }

  render() {
    this.renderPins();
    this.renderLines();
    this.apply();
  }

  addPin(pin) {
    this.pins.push({
      id: Date.now(),
      name: pin.name,
      x: pin.x,
      y: pin.y,
    });
    this.save();
    this.render();
  }

  startConnect(id) {
    this.connectFrom = this.connectFrom == id ? null : id;
    this.render();
  }

  selectLine(id) {
    this.selectedLine = this.selectedLine == id ? null : id;
    this.render();
  }

  cancelConnect() {
    this.connectFrom = null;
    this.connectTo = null;
    this.render();
  }

  submitConnect(distance, mode) {
    let isConnecting;
    this.connections.forEach((pin) => {
      if (pin.from == this.connectFrom && pin.to == this.connectTo)
        isConnecting = pin;
      if (pin.from == this.connectTo && pin.to == this.connectFrom)
        isConnecting = pin;
    });

    if (isConnecting) {
      const transports = isConnecting.transportasi;
      if (transports) {
        transports.forEach((tran) => {
          if (tran.mode == mode) {
            alert("sduah ada, pilih yang laen");
            return;
          }
        });
        transports.push({ distance: distance, mode: mode });
      }
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

  deleteLine() {
    this.connections = this.connections.filter(
      (conn) => conn.id != this.selectedLine,
    );
    this.selectedLine = null;
    this.save();
    this.render();
  }
  deletePin(id) {
    this.pins = this.pins.filter((pin) => pin.id != id);
    this.save();
    this.render();
  }

  findByName(name) {
    return this.pins.find((pin) => pin.name.trim() == name.trim());
  }

  checkSearch() {
    let from;
    let to;
    this.pins.forEach((pin) => {
      from = this.findByName(pin.name);
      to = this.findByName(pin.name);
    });

    this.btnSearch.disabled = from.id != to.id && from && to;
  }

  searchRoutes() {
    const from = this.findByName(this.inputFrom.value.trim());
    const to = this.findByName(this.inputTo.value.trim());
    this.routes = [];
    const visited = {};
    visited[to.id];

    const dfs = (current, path) => {
      if (current == to.id) {
        let duration = 0;
        let cost = 0;
        let steps = [];

        path.forEach((p) => {
          const conn = p.conn;
          const from = this.findPin(p.from).name;
          const to = this.findPin(p.to).name;
          const transportasi = conn.transportasi;
          let bestValue = transportasi[0];
          let best = Infinity;

          if (!to || !from) return;

          transportasi.forEach((tran) => {
            const config = App.Transports[tran.mode];
            const value =
              this.modeSearch == "fastest"
                ? tran.distance / config.speed
                : tran.distance * config.cost;

            if (value < best) {
              best = value;
              bestValue = tran;
            }
          });
          const config = App.Transports[bestValue.mode];
          duration += best.distance / config.speed;
          cost += best.distance * config.cost;
          steps.push(`
            (${from}) -> (${to}) duration:${duration}|cost:${cost}
            `);
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

        if ((next, !visited[next])) {
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

    dfs(to, []);
    this.routeResults.classList.remove("hidden");
    this.showRoutes();
  }

  showRoutes() {
    let sorted = this.routes
      .sort((a, b) => {
        if (this.modeSearch == "fastest") {
          a.duration - b.duration;
        } else {
          a.cost - b.cost;
        }
      })
      .slice(0, 10);

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

    this.routeResults.innerHTML = html;
  }

  showPop(element, e) {
    element.style.left = e.clientX + 10 + "px";
    element.style.top = e.clientY + 10 + "px";
    element.classList.remove("hidden");
  }

  hidePop(element) {
    element.classList.add("hidden");
  }

  setup() {
    const self = this;

    self.mapArea.addEventListener(
      "wheel",
      function (e) {
        e.preventDefault();
        if (!e.ctrlKey) return;
        self.zoom(e.clientX, e.clientY, e.deltaY > 0 ? 0.85 : 1.15);
      },
      { passive: false },
    );

    document.addEventListener("keydown", function (e) {
      const relative = self.mapArea.getBoundingClientRect();
      if (e.ctrlKey) {
        if (e.key == "=" || e.key == "+") {
          e.preventDefault();
          self.zoom(
            (relative.left + relative.width) / 2,
            (relative.top + relative.height) / 2,
            1.15,
          );
        }
        if (e.key == "-" || e.key == "_") {
          e.preventDefault();
          zoom(
            (relative.left + relative.width) / 2,
            (relative.top + relative.height) / 2,
            0.85,
          );
        }
      }
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
      e.preventDefault();
      if (!self.isGrabbing) return;
      self.mapContainer.classList.add("grabbing");
      self.ox = self.sox + (e.clientX - self.dragX);
      self.oy = self.soy + (e.clientY - self.dragY);
      self.apply();
    });

    document.addEventListener("mouseup", function (e) {
      self.isGrabbing = false;
      self.mapContainer.classList.remove("grabbing");
    });

    self.mapArea.addEventListener("dblclick", function (e) {
      e.preventDefault();
      self.posisiMap = self.toMap(e.clientX, e.clientY);
      self.inputName.value = "";
      self.showPop(self.popAdd, e);
      self.inputName.focus();
    });

    self.formAdd.onsubmit = function (e) {
      e.preventDefault();
      const name = self.inputName.value.trim();
      if (name) {
        self.addPin({ name: name, x: self.posisiMap.x, y: self.posisiMap.y });
        // console.log(self.posisiMap)
        // console.log(self.pins)
        self.hidePop(self.popAdd);
      }
    };

    self.formConnect.onsubmit = function (e) {
      e.preventDefault();
      const distance = self.inputDistance.value.trim();
      const mode = self.inputMode.value;
      if (mode && distance) {
        self.submitConnect(distance, mode);
        self.hidePop(self.popConnect);
      }
    };

    self.pinpointsLayer.addEventListener("click", function (e) {
      if (!e.target.closest(".pinpoint")) return;
      e.stopPropagation();

      const buttonDelete = e.target.closest(".btn-delete");

      if (buttonDelete) {
        self.deletePin(buttonDelete.dataset.id);
        return;
      }

      const connectButton = e.target.closest(".btn-connect");
      if (connectButton) {
        self.startConnect(connectButton.dataset.id);
        return;
      }

      //   ini untuk connect
      const pinHeader = e.target.closest(".pinpoint");

      if (
        self.connectFrom &&
        pinHeader &&
        pinHeader.dataset.id != self.connectFrom
      ) {
        self.showPop(self.popConnect, e);
        self.connectTo = pinHeader.dataset.id;
        self.inputDistance.value = "";
        self.inputMode.value = "";
        self.inputDistance.focus();
      }
    });

    self.mapArea.addEventListener("click", function (e) {
      if (e.target.closest(".pinpoint")) return;

      if (self.selectedLine) {
        self.selectedLine = null;
        self.render();
      }

      if (self.connectFrom) {
        self.cancelConnect();
        self.render();
      }

      const lineId = self.findClickedLine(e);
      if (lineId) {
        self.selectedLine = lineId;
        self.render();
        return;
      }
    });

    document.addEventListener("keydown", function (e) {
      const input = e.target.closest("input,select");

      if (
        !input &&
        self.selectedLine &&
        (e.key == "Backspace" || e.key == "Delete")
      ) {
        e.preventDefault();
        self.deleteLine();
        return;
      }

      if (e.key == "Escape") {
        self.hidePop(self.popAdd);
        self.hidePop(self.popConnect);
        self.selectedLine = null;
        self.cancelConnect();
        self.render();
      }
    });

    self.btnCloseAdd.onclick = () => self.hidePop(self.popAdd);
    self.btnCloseConnect.onclick = () => self.hidePop(self.popConnect);

    self.inputFrom.onchange = function (e) {
      self.checkSearch();
    };

    self.inputTo.onchange = function (e) {
      self.checkSearch();
    };

    self.btnSearch.onclick = function (e) {
      self.searchRoutes();
    };

    const buttons = document.querySelectorAll(".btn-sort");
    if (buttons) {
      buttons.forEach((button) => {
        button.onclick = () => {
          buttons.forEach((b) => {
            b.classList.remove("active");
          });
          button.classList.add("active");
          this.modeSearch = button.getAttribute("data-sort");
          this.searchRoutes();
        };
      });
    }


self.btnRoute.onclick = () => {
    self.routePanel.classList.toggle('hidden')
}

  }
}

window.onload = () => new App();
