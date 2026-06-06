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
    this.dragX = 0;
    this.dragY = 0;
    this.isGrabbing = false;
    this.scale = 1;

    this.connectFrom = null;
    this.connectTo = null;
    this.routes = [];
    this.pins = [];
    this.connections = [];
    this.posisiMap = {};
    this.selectedLine = null;
    this.sortMode = "fastest";

    const $ = (id) => document.getElementById(id);
    this.mapArea = $("map-area");
    this.mapContainer = $("map-container");
    this.canvas = $("lines-layer");
    this.ctx = this.canvas.getContext("2d");
    this.pinpointsLayer = $("pinpoints-layer");

    this.popAdd = $("popAdd");
    this.formAdd = $("formAdd");
    this.closeAdd = $("closeAdd");
    this.inputName = $("inputName");

    this.popConnect = $("popConnect");
    this.formConnect = $("formConnect");
    this.inputDistance = $("inputDistance");
    this.inputMode = $("inputMode");
    this.closeConnect = $("closeConnect");

    this.panelRoute = $("panelRoute");
    this.inputFrom = $("inputFrom");
    this.inputTo = $("inputTo");
    this.resultsRoute = $("routeResults");
    this.btnSearch = $("btnSearch");
    this.btnRoute = $("btnRoute");

    this.load();
    this.fit();
    this.apply();
    this.render();
    this.setup();
    console.log("asda");
    // console.table(
    //     this.connections.map(c => ({
    //         id: c.id,
    //         from: c.from,
    //         to: c.to
    //     }))
    // );
  }

  save() {
    localStorage.setItem("pins", JSON.stringify(this.pins));
    localStorage.setItem("connections", JSON.stringify(this.connections));
  }

  load() {
    this.pins = JSON.parse(localStorage.getItem("pins")) || [];
    this.connections = JSON.parse(localStorage.getItem("connections")) || [];
  }

  apply() {
    this.mapContainer.style.transform = `translate(${this.ox}px, ${this.oy}px) scale(${this.scale})`;
  }
  fit() {
    const width = this.mapArea.clientWidth;
    const height = this.mapArea.clientHeight;
    this.scale = Math.max(width / App.LEBAR_MAP, height / App.TINGGI_MAP);
    this.ox = (width - App.LEBAR_MAP * this.scale) / 2;
    this.oy = (height - App.TINGGI_MAP * this.scale) / 2;
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

  pinHtml(pin) {
    const connecting = this.connectFrom == pin.id ? "connecting" : "";
    return `
        <div class="pinpoint" data-id="${pin.id}" style='left:${pin.x}px; top:${pin.y}px;'>
            <div class="pinpoint-header ${connecting}">
                <span>${pin.name}</span>
                <img src="./assets/MdiTransitConnectionVariant.svg" class="btn btn-connect" data-id="${pin.id}" alt="">
                <img src="./assets/MdiTrashCanOutline.svg" class="btn btn-delete" data-id="${pin.id}" alt="">
            </div>
            <div>
                <img src="./assets/MaterialSymbolsLocationOn.svg" class="marker" alt="">
            </div>
        </div>        
        `;
  }

  renderPins() {
    let html = "";
    this.pins.forEach((pin) => (html += this.pinHtml(pin)));
    this.pinpointsLayer.innerHTML = html;
  }

  renderLines() {
    this.canvas.width = App.LEBAR_MAP;
    this.canvas.height = App.TINGGI_MAP;
    this.connections.forEach((conn) => {
      const transportasi = conn.transportasi;
      const from = this.findPin(conn.from);
      const to = this.findPin(conn.to);
      if(!to || ! from)return
      transportasi.forEach((tran, index) => {
        const off = this.offset(from, to, index, transportasi.length);
        const x1 = from.x + off.x;
        const x2 = to.x + off.x;
        const y1 = from.y + off.y;
        const y2 = to.y + off.y;

        if (this.selectedLine == conn.id) {
          this.ctx.shadowColor = " rgb(211, 204, 8)";
          this.ctx.shadowBlur = 6;
          this.ctx.lineWidth = 4;
        } else {
          this.ctx.shadowBlur = 2;
          this.ctx.shadowColor = "transparent";
          this.ctx.lineWidth = 2;
        }

        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.strokeStyle = App.Transports[tran.mode].color;
        this.ctx.stroke();

        this.ctx.shadowBlur = 2;
        this.ctx.shadowColor = "transparent";
        this.ctx.font = "bold 12px sans-serif";
        this.ctx.fillColor = App.Transports[tran.mode].color;
        this.ctx.textAlign = "center";
        this.ctx.fillText(tran.distance, (x1 + x2) / 2, (y1 + y2) / 2);
      });
    });
  }

  render() {
    this.renderPins();
    this.renderLines();
    this.apply();
  }

  findClickedLine(e) {
    const posisimap = this.toMap(e.clientX, e.clientY);
    for (let i = 0; i < this.connections.length; i++) {
      const conn = this.connections[i];
      const transportasi = conn.transportasi;
      const from = this.findPin(conn.from);
      const to = this.findPin(conn.to);
      if (!to || !from) continue;
      // WAIJB NIH YA CONTINUE
      for (let j = 0; j < transportasi.length; j++) {
        this.ctx.beginPath();
        this.ctx.lineWidth = 8 / this.scale;
        this.ctx.moveTo(from.x, from.y);
        this.ctx.lineTo(to.x, to.y);

        if (this.ctx.isPointInStroke(posisimap.x, posisimap.y)) {
          return conn.id;
        }
      }
    }
    return null;
  }

  submitConnect(distance, mode) {
    let isExist;
    this.connections.forEach((conn) => {
      if (conn.from == this.connectFrom && conn.to == this.connectTo)
        isExist = conn;
      if (conn.to == this.connectFrom && conn.from == this.connectTo)
        isExist = conn;
    });

    if (isExist) {
      let t = true;
      isExist.transportasi.forEach((tran) => {
        if (tran.mode == mode) {
          alert("dah ada, cari lagi");
          t = false;
          return;
        }
      });

      if (t) {
        isExist.transportasi.push({
          distance: distance,
          mode: mode,
        });
      }
    } else {
      this.connections.push({
        id: Date.now(),
        from: this.connectFrom,
        to: this.connectTo,
        transportasi: [{ distance: distance, mode: mode }],
      });
    }
    this.save();
    this.cancelConnect();
    this.render();
  }
  findPin(id) {
    return this.pins.find((pin) => pin.id == id);
  }
  findByName(name) {
    return this.pins.find((pin) => pin.name == name.trim());
  }

  addPin(pin) {
    this.pins.push({
      id: Date.now(),
      name: pin.name,
      x: pin.x,
      y: pin.y,
    });
    // console.log(`dari add ${pin.y}`)
    this.save();
    this.render();
  }

  deletePin(id) {
    this.pins = this.pins.filter((pin) => pin.id != id);
    this.connections = this.connections.filter(
      (conn) => conn.from != id || conn.to != id,
    );
    this.save();
    this.render();
  }

  startConnect(id) {
    this.connectFrom = this.connectFrom == id ? null : id;
    this.render();
  }

  deleteLine() {
    this.connections = this.connections.filter(
      (conn) => conn.id != this.selectedLine,
    );
    this.save();
    this.render();
  }

  cancelConnect() {
    this.connectFrom = null;
    this.connectTo = null;
    this.render();
  }

  selectLine(id) {
    this.selectedLine = this.selectedLine == id ? null : id;
    this.render();
  }

  offset(from, to, index, total) {
    if (total <= 1) return { x: 0, y: 0 };
    const s = -(total - 1) * 3 + index * 6;
    const dx = Math.abs(from.x - to.x);
    const dy = Math.abs(from.y - to.y);
    if (dx > dy) {
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

  pop(el, clientX, clientY) {
    el.style.left = clientX + 10 + "px";
    el.style.top = clientY - 10 + "px";
    el.classList.remove("hidden");
  }

  hide(el) {
    el.classList.add("hidden");
  }

  checkSearch() {
    let from, to;
    this.connections.forEach((conn) => {
      from = this.findByName(this.inputFrom.value);
      to = this.findByName(this.inputTo.value);
    });

    this.btnSearch.disabled = !(to && from && from != to);
  }

  searchRoutes() {
    let pinFrom = this.findByName(this.inputFrom.value.trim());
    let pinTo = this.findByName(this.inputTo.value.trim());
    if (!pinFrom || !pinTo) return;
    this.routes = [];
    const visited = {};
    visited[pinFrom.id] = true;
    // console.log({pinFrom})
    // console.log({pinTo})
    const dfs = (current, path) => {
      if (current == pinTo.id) {
        let duration = 0;
        let cost = 0;
        let steps = [];

        path.forEach((p) => {
          const conn = p.conn;
          const transportasi = conn.transportasi;

          let fromName = this.findPin(conn.from).name;
          let toName = this.findPin(conn.to).name;
          let bestValue = Infinity;
          let best = transportasi[0];

          transportasi.forEach((tran) => {
            let config = App.Transports[tran.mode];
            let value =
              this.sortMode == "fastest"
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
          steps.push(
            `${fromName} -> ${toName} | dur: ${duration} | cost; ${cost}`,
          );
        });

        this.routes.push({
          duration: duration,
          cost: cost,
          steps: steps,
        });
        return;
      }

      this.connections.forEach((conn) => {
        let next;
        if (conn.from == current) next = conn.to;
        if (conn.to == current) next = conn.from;

        if (!visited[next] && next) {
          // console.log(next)
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
    this.resultsRoute.classList.remove("hidden");
    this.showRoutes();
  }

  showRoutes() {
    let sorted = this.routes
      .slice()
      .sort((a, b) => {
        if (this.sortMode == "fastest") {
          return a.duration - b.duration;
        } else {
          return a.cost - b.cost;
        }
      })
      .slice(0, 10);

    let html = ``;
    // console.log(sorted)
this.resultsRoute.innerHTML = ``;
    sorted.forEach((data, index) => {
      html += `
                    <div class="routeCard">
                        <div class="routeSteps">
                            ${data.steps.map((step, index) => `<div>${index + 1} ${step}</div>`).join("")}
                        </div>
                        <div class="routeInfo">
                            <span>duration:${data.duration}</span>
                            <span>cost:${data.cost}</span>
                        </div>
                    </div>
      `;
      // this.resultsRoute.innerHTML = html;
    });
    this.resultsRoute.innerHTML = html;
    console.log(this.resultsRoute.innerHTML);
  }

  setup() {
    const self = this;

    document.addEventListener(
      "wheel",
      function (e) {
        if (!e.ctrlKey) return;
        e.preventDefault();
        self.zoom(e.clientX, e.clientY, e.deltaY < 0 ? 1.15 : 0.85);
      },
      { passive: false },
    );

    document.addEventListener("keydown", function (e) {
      if (!e.ctrlKey) return;
      const relative = self.mapArea.getBoundingClientRect();
      if (e.key == "+" || e.key == "=") {
        e.preventDefault();
        self.zoom(
          (relative.left + relative.width) / 2,
          (relative.top + relative.height) / 2,
          1.15,
        );
      }
      if (e.key == "_" || e.key == "-") {
        e.preventDefault();
        self.zoom(
          (relative.left + relative.width) / 2,
          (relative.top + relative.height) / 2,
          0.85,
        );
      }
    });

    document.addEventListener("mousedown", function (e) {
      if (e.button) return;
      self.isGrabbing = true;
      self.sox = self.ox;
      self.soy = self.oy;
      self.dragX = e.clientX;
      self.dragY = e.clientY;
    });

    document.addEventListener("mousemove", function (e) {
      e.preventDefault();
      if (!self.isGrabbing) return;
      self.mapArea.classList.add("grabbing");
      self.ox = self.sox + (e.clientX - self.dragX);
      self.oy = self.soy + (e.clientY - self.dragY);
      self.apply();
    });
    document.addEventListener("mouseup", function (e) {
      self.isGrabbing = false;
      self.mapArea.classList.remove("grabbing");
    });

    self.closeAdd.onclick = function (e) {
      e.preventDefault();
      self.hide(self.popAdd);
    };
    self.closeConnect.onclick = function (e) {
      e.preventDefault();
      self.hide(self.popConnect);
    };
    self.formAdd.onsubmit = function (e) {
      e.preventDefault();
      const name = self.inputName.value.trim();
      if (name) {
        // console.log(`dari form ${self.posisiMap.y}`)
        self.addPin({ name, x: self.posisiMap.x, y: self.posisiMap.y });
        self.hide(self.popAdd);
      }
    };

    self.formConnect.onsubmit = function (e) {
      e.preventDefault();
      const distance = self.inputDistance.value.trim();
      const mode = self.inputMode.value;
      if (mode && distance) {
        self.submitConnect(distance, mode);
        self.hide(self.popConnect);
      }
    };

    self.btnRoute.onclick = () => {
      self.panelRoute.classList.toggle("hidden");
    };

    self.mapArea.addEventListener("dblclick", function (e) {
      if (e.target.closest(".pinpoint,input,.popup")) return;
      e.preventDefault();
      self.posisiMap = self.toMap(e.clientX, e.clientY);
      self.inputName.value = "";
      self.inputName.focus();
      self.pop(self.popAdd, e.clientX, e.clientY);
    });

    self.pinpointsLayer.addEventListener("click", function (e) {
      const btnDelete = e.target.closest(".btn-delete");
      if (btnDelete) {
        self.deletePin(btnDelete.dataset.id);
        return;
      }

      const btnConnect = e.target.closest(".btn-connect");
      if (btnConnect) {
        self.startConnect(btnConnect.dataset.id);
        return;
      }

      const pinpoint = e.target.closest(".pinpoint");
      if (
        pinpoint &&
        self.connectFrom &&
        self.connectFrom != pinpoint.dataset.id
      ) {
        self.connectTo = pinpoint.dataset.id;
        self.inputDistance.value = "";
        self.inputMode.value = "";
        self.inputDistance.focus();
        self.pop(self.popConnect, e.clientX, e.clientY);
      }
    });
    document.addEventListener("click", function (e) {
      if (e.target.closest(".pinpoint, input, .popup")) return;

      const lineId = self.findClickedLine(e);
      if (lineId) {
        self.selectedLine = lineId;
        self.render();
        return;
      }

      if (self.connectFrom) {
        self.cancelConnect();
        return;
      }

      if (self.selectedLine) {
        self.selectedLine = null;
        self.render();
        return;
      }
    });
    document.addEventListener("keydown", function (e) {
      const input = e.target.closest(".input");

      if (
        (e.key == "Backspace" || e.key == "Delete") &&
        !input &&
        self.selectedLine
      ) {
        e.preventDefault();
        self.deleteLine();
        return;
      }

      if (e.key == "Escape") {
        self.hide(self.popAdd);
        self.hide(self.popConnect);
        self.selectedLine = null;
        self.cancelConnect();
        self.render();
      }
    });

    this.inputFrom.oninput = () => this.checkSearch();
    this.inputTo.oninput = () => this.checkSearch();
    this.btnSearch.onclick = () => this.searchRoutes();

    const buttons = document.querySelectorAll(".sort-btn");
    if (buttons) {
      buttons.forEach((button) => {
        button.onclick = function (e) {
          buttons.forEach((b) => b.classList.remove("active"));
          button.classList.add("active");
          self.sortMode = button.getAttribute("data-sort");
          self.searchRoutes();
        };
      });
    }
  }
}

window.onload = () => new App();
