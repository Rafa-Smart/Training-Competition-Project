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
    this.scale = 1;
    this.isGrabbing = false;

    this.connectFrom = null;
    this.connectTo = null;
    this.routes = [];
    this.posisiMap = {};
    this.pins = [];
    this.connections = [];
    this.selectedLine = null;

    const $ = (id) => document.getElementById(id);
    this.mapArea = $("map-area");
    this.mapContainer = $("map-container");
    this.canvas = $("lines-layer");
    this.pinpointsLayer = $("pinpoints-layer");
    this.ctx = this.canvas.getContext("2d");

    this.formAdd = $("formAdd");
    this.popAdd = $("popAdd");
    this.inputName = $("input-name");
    this.closeAdd = $("closeAdd");

    this.popConnect = $("popConnect");
    this.closeConnect = $("closeConnect");
    this.formConnect = $("formConnect");
    this.inputDistance = $("input-distance");
    this.inputMode = $("input-mode");

    this.inputFrom = $("input-from");
    this.inputTo = $("input-to");
    this.btnRoute = $("btn-route");
    this.sortMode = "fastest";
    this.routeList = $("route-list");
    this.formSearch = $("form-search");
    this.searchNya = $("search-nya");

    this.load();
    this.fit();
    this.render();
    this.apply();
    this.setup();
  }

  load() {
    this.pins = JSON.parse(localStorage.getItem("pins")) || [];
    this.connections = JSON.parse(localStorage.getItem("connections"));
  }

  save() {
    localStorage.setItem("pins", JSON.stringify(this.pins));
    localStorage.setItem("connections", JSON.stringify(this.connections));
  }
  apply() {
    this.mapContainer.style.transform = `translate(${this.ox}px, ${this.oy}px) scale(${this.scale})`;
  }

  render() {
    this.renderPins();
    this.renderLines();
    this.apply();
  }
  pinHtml(pin) {
    let connection = this.connectFrom == pin.id ? "connecting" : "";
    return `
    <div class="pinpoint" data-id='${pin.id}' style="left: ${pin.x}px; top: ${pin.y}px;">
      <div class="header-pinpoint ${connection}">
        <span>${pin.name}</span>
        <img
          src="/assets/MdiTransitConnectionVariant.svg"
          alt=""
          data-id='${pin.id}'
          class="btn-connect btn"
        />
        <img src="/assets/MdiTrashCanOutline.svg" data-id='${pin.id}' alt="" class="btn-delete btn" />
      </div>
      <div>
        <img src="/assets/MaterialSymbolsLocationOn.svg" alt="" class="marker">
      </div>
    </div>   
    `;
  }

  renderPins() {
    let html = ``;
    this.pins.forEach((pin) => (html += this.pinHtml(pin)));
    this.pinpointsLayer.innerHTML = html;
  }

  findPin(id) {
    return this.pins.find((pin) => {
      if (pin.id == id) {
        return pin;
      }
    });
  }

  renderLines() {
    this.canvas.width = App.LEBAR_MAP;
    this.canvas.height = App.TINGGI_MAP;
    this.connections.forEach((conn) => {
      const transportasi = conn.transportasi;
      let from = this.findPin(conn.from);
      let to = this.findPin(conn.to);

      transportasi.forEach((tran, index) => {
        const off = this.offset(from, to, index, transportasi.length);
        const x1 = from.x + off.x;
        const x2 = to.x + off.x;
        const y1 = from.y + off.y;
        const y2 = to.y + off.y;

        if (this.selectedLine == conn.id) {
          this.ctx.shadowColor = "rgb(212, 198, 54)";
          this.ctx.shadowBlur = 6;
          this.ctx.lineWidth = 3;
        } else {
          this.ctx.shadowColor = "transparent";
          this.ctx.shadowBlur = 1;
          this.ctx.lineWidth = 2;
        }

        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.strokeStyle = App.Transports[tran.mode].color;
        this.ctx.stroke();
        this.ctx.shadowColor = "transparent";
        this.ctx.shadowBlur = 1;
        this.ctx.lineWidth = 1;

        this.ctx.font = "bold 12px sans-serif";
        this.ctx.fillColor = App.Transports[tran.mode].color;
        this.ctx.textAlign = "center";
        this.ctx.fillText(tran.distance, (x1 + x2) / 2, (y1 + y2) / 2);
      });
    });
  }

  submitConnect(distance, mode) {
    let ada;
    this.connections.forEach((conn) => {
      if (conn.from == this.connectFrom && conn.to == this.connectTo)
        ada = conn;
      if (conn.to == this.connectFrom && conn.from == this.connectTo)
        ada = conn;
    });
    if (ada) {
      const transportasi = ada.transportasi;
      const cek = true;
      transportasi.forEach((tran) => {
        if (tran == mode) {
          alert("udha ada, ganti!");
          cek = false;
          return;
        }
      });
      if (cek) transportasi.push({ distance: distance, mode: mode });
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

  selectLine(id) {
    (this.selectedLine == this.selectedLine) == id ? id : null;
    this.render();
  }

  finfdClickedLine(e) {
    const posisiMap = this.toMap(e);
    for (let i = 0; i < this.connections.length; i++) {
      const conn = this.connections[i];
      const transportasi = conn.transportasi;
      let from = this.findPin(conn.from);
      let to = this.findPin(conn.to);
      //   console.log(from)
      for (let j = 0; j < transportasi.length; j++) {
        this.ctx.beginPath();
        this.ctx.lineWidth = 8 / this.scale;
        this.ctx.moveTo(from.x, from.y);
        this.ctx.lineTo(to.x, to.y);

        if (this.ctx.isPointInStroke(posisiMap.x, posisiMap.y)) {
          return conn.id;
        }
      }
      return null;
    }
  }

  startConnect(id) {
    this.connectFrom = this.connectFrom == id ? null : id;
    this.render();
  }

  deleteLine() {
    this.connections = this.connections.filter((conn) => {
      return conn.from != this.connectFrom && conn.to != this.connectTo;
    });
    this.save();
    this.render();
  }

  cancelConnect() {
    this.connectFrom = null;
    this.connectTo = null;
    this.render();
  }

  offset(from, to, index, total) {
    if (total <= 0) return { x: 0, y: 0 };
    const s = -(total - 1) * 3 + index * 6;
    const dx = Math.abs(from.x - to.x);
    const dy = Math.abs(from.y - to.y);
    if (dx < dy) {
      return { x: 0, y: s };
    } else {
      return { x: s, y: 0 };
    }
  }
  fit() {
    const lebarMap = this.mapArea.clientWidth;
    const tinggiMap = this.mapArea.clientHeight;
    this.scale = Math.max(lebarMap / App.LEBAR_MAP, tinggiMap / App.TINGGI_MAP);
    this.ox = (lebarMap - App.LEBAR_MAP * this.ox) / 2;
    this.oy = (tinggiMap - App.TINGGI_MAP * this.oy) / 2;
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

  deletePin(id) {
    this.pins = this.pins.filter((pin) => pin.id != id);
    this.connections = this.connections.filter((conn) => conn.from != id);
    this.save();
    this.render();
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

  toMap(e) {
    const relative = this.mapArea.getBoundingClientRect();
    return {
      x: (e.clientX - relative.left - this.ox) / this.scale,
      y: (e.clientY - relative.top - this.oy) / this.scale,
    };
  }

  findByName(name) {
    return this.pins.filter((pin) => pin.name == name.trim());
  }

  checkSearch() {
    let from;
    let to;
    this.connections.forEach((conn) => {
      from = this.findByName(this.inputFrom);
      to = this.findByName(this.inputTo);
    });
    this.searchNya.disabled = !(from && to && from != to);
  }

  searchRoute() {
    this.routes = [];
    let from = this.findByName(this.inputName);
    let to = this.findByName(this.inputTo);
    let visited = {};
    visited[from.id] = true;
    const dfs = (current, path) => {
      if (current == to.id) {
        let duration = 0;
        let steps = [];
        let cost = 0;

        path.forEach((p) => {
          const transportasi = p.conn.transportasi;
          let from = this.findPin(p.conn.from).name;
          let to = this.findPin(p.conn.to).name;
          let best = tran[0];
          let bestValue = Infinity;
          transportasi.forEach((tran) => {
            const config = App.Transports[tran.mode];
            const value =
              this.sortMode == "fastest"
                ? tran.distace / config.speed
                : tran.distance * condig.cost;
            if (best < bestValue) {
              bestValue = value;
              best = tran;
            }
          });
          let config = App.Transports[best.mode];
          duration += best.distance * config.cost;
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
        return;
      }

      this.connections.forEach((conn) => {
        let next;
        if (conn.from == current) next = conn;
        if (conn.to == current) next = conn;

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
    this.routeList.classList.remove("hidden");
    this.showRoute();
  }

  showRoute() {
    let sorted = this.routes
      .sort((a, b) => {
        if (this.sortMode == "fastest") {
          a.duration - b.duration;
        } else {
          a.cost - b.cost;
        }
      })
      .slice(0, 10);

    let html = ``;
    sorted.forEach((data) => {
      html += `<div>
            <div>${data.steps.map((s) => `<p>${e}</p>`.join(""))}</div>
            <div>
                <span>duration: ${data.duration}</span>
                <span>cost: ${data.cost}</span>
            </div>
        </div>`;
    });
    this.routeList.innerHTML = html;
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
        e.preventDefault();
        self.zoom(e.clientX, e.clientY, e.deltaY < 0 ? 1.15 : 0.85);
      },
      { passive: false },
    );
    document.addEventListener("keydown", function (e) {
      if (!e.ctrl) return;
      const relative = self.mapArea.getBoundingClientRect();
      if (e.key == "+" || e.key == "=") {
        self.zoom(
          (relative.left + relative.width) / 2,
          (relative.top + relative.height) / 2,
          1.15,
        );
      }

      if (e.key == "-" || e.key == "_") {
        self.zoom(
          (relative.left + relative.width) / 2,
          (relative.top + relative.height) / 2,
          0.85,
        );
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
      self.mapContainer.classList.add("grabbing");
      if (!self.isGrabbing) return;
      self.ox = self.sox + (e.clientX - self.dragX);
      self.oy = self.soy + (e.clientY - self.dragY);
      self.apply();
    });
    document.addEventListener("mouseup", function (e) {
      self.mapContainer.classList.remove("grabbing");
      self.isGrabbing = false;
    });

    self.mapArea.addEventListener("dblclick", function (e) {
      e.preventDefault();
      self.inputName.value = "";
      self.inputName.focus();
      self.posisiMap = self.toMap(e);
      self.pop(self.popAdd, e);
    });

    document.addEventListener("keydown", function (e) {
      const input = e.target.closest("input,select");
      if (
        !input &&
        this.selectedLine &&
        (e.key == "Backspace" || e.key == "Delete")
      ) {
        e.preventDefault();
        self.deleteLine();
        return;
      }

      if (e.ley == "Escape") {
        self.hide(self.popAdd);
        self.hide(self.popConnect);
        self.cancelConnect();
      }
    });

    self.formAdd.onsubmit = function (e) {
      e.preventDefault();
      const name = self.inputName.value.trim();
      if (name) {
        self.addPin({
          name: name,
          x: self.posisiMap.x,
          y: self.posisiMap.y,
        });
        self.hide(self.popAdd);
      }
    };

    self.formConnect.onsubmit = function (e) {
      e.preventDefault();
      const distance = self.inputDistance.value.trim();
      const mode = self.inputMode.value.trim();
      if (distance && mode) {
        self.submitConnect(distance, mode);
        self.hide(self.popConnect);
      }
    };
    self.closeAdd.onclick = function (e) {
      self.hide(self.popAdd);
    };
    self.closeConnect.onclick = function (e) {
      self.hide(self.popConnect);
    };

    document.addEventListener("click", function (e) {});

    self.pinpointsLayer.addEventListener("click", function (e) {
      e.stopPropagation();
      const buttonDelete = e.target.closest(".btn-delete");
      if (buttonDelete) {
        self.deletePin(buttonDelete.dataset.id);
        return;
      }
      const buttonConnect = e.target.closest(".btn-connect");
      if (buttonConnect) {
        self.startConnect(buttonConnect.dataset.id);
        return;
      }
      const pinpoint = e.target.closest(".pinpoint");
      if (
        pinpoint &&
        self.connectFrom != pinpoint.dataset.id &&
        self.connectFrom
      ) {
        self.inputDistance.value = "";
        self.inputMode.value = "";
        self.inputDistance.focus();
        self.connectTo = pinpoint.dataset.id;
        self.pop(self.popConnect, e);
      }
    });

    document.addEventListener("click", function (e) {
      if (e.target.closest(".pinpoint,popup")) return;

      const lineId = self.finfdClickedLine(e);

      console.log(lineId);
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
      }
    });

    const buttons = document.querySelectorAll('.sort-btn');
    if(buttons){
        buttons.forEach((button) => {
            button.onclick = (e) =>{
                buttons.forEach(b => b.classList.remove('active'));
                button.classList.add('active');
                this.sortMode = button.getAttribute('data-id');;
                this.searchRoute()
            }
        })
    }
  }
}

window.onload = () => new App();
