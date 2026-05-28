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
    this.scale = 1;
    this.routes = [];
    this.connectFrom = null;
    this.connectTo = null;
    this.isGrabbing = false;
    this.connections = [];
    this.pins = [];
    this.sortMode = "fastest";
    this.posisiMap = {};
    this.selectedLine = null;

    const $ = (id) => document.getElementById(id);
    this.mapArea = $("map-area");
    this.mapContainer = $("map-container");
    this.canvas = $("lines-layer");
    this.pinpointsLayer = $("pinpoints-layer");
    this.ctx = this.canvas.getContext("2d");

    this.inputName = $("inputName");
    this.formAdd = $("formAdd");
    this.popAdd = $("popAdd");
    this.closeAdd = $("closeAdd");

    this.inputDistance = $("inputDistance");
    this.inputMode = $("inputMode");
    this.formConnect = $("formConnect");
    this.popConnect = $("popConnect");
    this.closeConnect = $("closeConnect");

    this.inputFrom = $("inputFrom");
    this.inputTo = $("inputTo");
    this.routeList = $("routeList");
    this.btnRoute = $("btnRoute");
    this.panelRoute = $("panelRoute");
    this.btnSearch = $("btnSearch");

    this.load();
    this.fit();
    this.apply();
    this.render();
    this.setup();
  }

  save() {
    localStorage.setItem("pins", JSON.stringify(this.pins));
    localStorage.setItem("connections", JSON.stringify(this.connections));
  }

  load() {
    this.pins = JSON.parse(localStorage.getItem("pins")) || [];
    this.connections = JSON.parse(localStorage.getItem("connections")) || [];
  }

  pinHtml(pin) {
    const connecting = this.connectFrom == pin.id ? "connecting" : "";
    return `
        <div class="pinpoint" data-id="${pin.id}" style="left:${pin.x}px; top:${pin.y}px">
            <div class="header-pinpoint ${connecting}">
                <span>${pin.name}</span>
                <img src="./assets/MdiTransitConnectionVariant.svg" alt="" class="btn btn-connect" data-id="${pin.id}">
                <img src="./assets/BiXLg.svg" alt="" class="btn btn-delete" data-id="${pin.id}">
            </div>
            <div>
                <img src="./assets/MaterialSymbolsLocationOn.svg" alt="" class="marker">
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
      const pinFrom = this.findPin(conn.from);
      const pinTo = this.findPin(conn.to);
      if (!pinFrom || !pinTo) return;
      const transportasi = conn.transportasi;
      transportasi.forEach((tran, index) => {
        const off = this.offset(pinFrom, pinTo, index, transportasi.length);
        const x1 = pinFrom.x - off.x;
        const y1 = pinFrom.y - off.y;
        const x2 = pinTo.x - off.x;
        const y2 = pinTo.y - off.y;

        if (this.selectedLine == conn.id) {
          this.ctx.shadowBlur = 6;
          this.ctx.shadowColor = "rgb(203, 203, 3)";
          this.ctx.lineWidth = 5;
        } else {
          this.ctx.shadowBlur = 1;
          this.ctx.shadowColor = "transparent";
          this.ctx.lineWidth = 2;
        }

        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.shadowBlur = 1;
        this.ctx.shadowColor = "transparent";
        this.ctx.strokeStyle = App.Transports[tran.mode].color;
        this.ctx.stroke();

        this.ctx.font = "12px bold sans-serif";
        this.ctx.textAlign = "center";
        this.ctx.fillStyle = App.Transports[tran.mode].color;
        this.ctx.fillText(tran.distance, (x1 + x2) / 2, (y1 + y2) / 2);
      });
    });
  }

  offset(pinFrom, pinTo, index, total) {
    if (total <= 1) return { x: 0, y: 0 };
    const s = -(total - 1) * 3 + index * 6;
    const dx = Math.abs(pinFrom.x - pinTo.x);
    const dy = Math.abs(pinFrom.y - pinTo.y);
    if (dx > dy) {
      return { x: 0, y: s };
    } else {
      return { x: s, y: 0 };
    }
  }

  findClickedLine(e) {
    const posisi = this.toMap(e.clientX, e.clientY);
    for (let i = 0; i < this.connections.length; i++) {
      const conn = this.connections[i];
      const transportasi = conn.transportasi;
      let pinFrom = this.findPin(conn.from);
      let pinTo = this.findPin(conn.to);
      // INI WJIBB BANGET CONTINUE, SOALNYA KALO ENGGA, DIA KALO MISALNYA ENGA NEMU DIA AKNA LANGUSG RETURN GIUT DAN INI GA BOELH, MAKA NYA HARUS PAKE CONTINUE YA
      if (!pinFrom || !pinTo) continue;// ingat disini wajib continue ya
      for (let j = 0; j < transportasi.length; j++) {
        this.ctx.beginPath();
        this.ctx.lineWidth = 8 / this.scale;
        this.ctx.moveTo(pinFrom.x, pinFrom.y);
        this.ctx.lineTo(pinTo.x, pinTo.y);

        if (this.ctx.isPointInStroke(posisi.x, posisi.y)) {
          return conn.id;
        }
      }
    }
    return null;
  }

  findPin(id) {
    return this.pins.find((pin) => pin.id == id);
  }
  findByName(name) {
    return this.pins.find((pin) => pin.name == name.trim());
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
      // const transportasi = ada.transportasi;
      let cek = true;
      ada.transportasi.forEach((tran) => {
        if (tran.mode == mode) {
          alert("udah ada, cari lagi yang laen");
          cek = false;
          return;
        }
      });

      if (cek) {
        ada.transportasi.push({
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

  startConnect(id) {
    this.connectFrom = this.connectFrom == id ? null : id;
    this.render();
  }

  deleteLine() {
    this.connections = this.connections.filter((conn) => {
      if (conn.id != this.selectedLine) {
        return conn;
      }
    });
    this.save();
    this.render();
  }

  cancelConnect() {
    this.connectFrom = null;
    this.connectTo = null;
    this.render();
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
    this.pins = this.pins.filter((p) => p.id != id);
    this.connections = this.connections.filter(
      (c) => c.from != id && c.to != id,
    );
    this.save();
    this.render();
  }

  render() {
    this.renderPins();
    this.renderLines();
    this.apply();
  }

  apply() {
    this.mapContainer.style.transform = `translate(${this.ox}px, ${this.oy}px) scale(${this.scale})`;
  }

  fit() {
    const lebar = this.mapArea.clientWidth;
    const tinggi = this.mapArea.clientHeight;
    this.scale = Math.min(lebar / App.LEBAR_MAP, tinggi / App.TINGGI_MAP);
    this.ox = (lebar - App.LEBAR_MAP * this.scale) / 2;
    this.oy = (tinggi - App.TINGGI_MAP * this.scale) / 2;
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

  show(el, e) {
    el.style.left = e.x + 10 + "px";
    el.style.top = e.y - 10 + "px";
    el.classList.remove("hidden");
  }
  hide(el) {
    el.classList.add("hidden");
  }

  checkSearch() {
    let from, to;
    this.connections.forEach((conn) => {
      from = this.findByName(this.inputFrom.value.trim());
      to = this.findByName(this.inputTo.value.trim());
    });
    this.btnSearch.disabled = !(from && to && to != from);
  }

  searchRoutes() {
    this.routes = [];
    const visited = {};
    let from = this.findByName(this.inputFrom.value.trim());
    let to = this.findByName(this.inputTo.value.trim());
    if (!from || !to) return;
    visited[from.id] = true;

    const dfs = (current, path) => {
      if (current == to.id) {
        let duration = 0;
        let cost = 0;
        let steps = [];

        // jaid path kan banyak ya pasti untuk mencapai ini tuh
        path.forEach((p, index) => {
          let conn = p.conn;
          let transportasi = conn.transportasi;
          let fromName = this.findByName(this.inputFrom.value).name;
          let toName = this.findByName(this.inputTo.value).name;
          if (!fromName || !toName) return;
          let best = transportasi[0];
          let bestValue = Infinity;
          transportasi.forEach((tran, i) => {
            let config = App.Transports[tran.mode];
            let value =
              this.sortMode == "fastest"
                ? tran.distance / config.speed
                : tran.distance * config.cost;

            if (value < bestValue) {
              best = tran;
              bestValue = value;
            }
          });

          let config = App.Transports[best.mode];
          duration += best.distance / config.speed;
          cost += best.distance * config.cost;
          steps.push(`${fromName} -> ${toName} | ${best.mode}`);
        });

        this.routes.push({
          duration: duration,
          cost: cost,
          steps: steps,
        });
      }

      this.connections.forEach((conn, index) => {
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
    this.routeList.classList.remove("hidden");
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
      .slice(0, 1);

    let html = ``;
    sorted.map((data, index) => {
      let jam = Math.floor(data.duration);
      let menit = Math.round((data.duration - jam) * 60);

      html += `
                ${data.steps
                  .map(
                    (step, i) => `<div class="item-list">
                    <p>${i + 1} ${step}</p>
                </div>`,
                  )
                  .join("")}
                <div class="item-info">
                    <p>duration: ${jam}:${menit}</p>
                    <p>cost: ${data.cost}</p>
                </div> 
        `;
    });
    this.routeList.classList.remove("hidden");
    this.routeList.innerHTML = "";
    this.routeList.innerHTML = html;
  }

  setup() {
    const self = this;
    self.mapArea.addEventListener(
      "wheel",
      function (e) {
        e.preventDefault();
        if (!e.ctrlKey) return;
        self.zoom(e.clientX, e.clientY, e.deltaY < 0 ? 1.15 : 0.85);
      },
      { passive: false },
    );

    document.addEventListener("keydown", function (e) {
      if (!e.ctrlKey) return;
      const relative = self.mapArea.getBoundingClientRect();
      if (e.key == "=" || e.key == "+") {
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

    self.mapArea.addEventListener("mousedown", function (e) {
      if (e.button) return;
      self.isGrabbing = true;
      self.mapArea.classList.add("grabbing");
      self.sox = self.ox;
      self.soy = self.oy;
      self.dragX = e.clientX;
      self.dragY = e.clientY;
    });

    document.addEventListener("mousemove", function (e) {
      if (!self.isGrabbing) return;

      self.ox = self.sox + (e.clientX - self.dragX);
      self.oy = self.soy + (e.clientY - self.dragY);
      self.apply();
    });
    document.addEventListener("mouseup", function (e) {
      self.isGrabbing = false;
      self.mapArea.classList.remove("grabbing");
    });

    self.mapArea.addEventListener("dblclick", function (e) {
      if (e.target.closest(".popup,input,button")) return;
      e.preventDefault();
      self.posisiMap = self.toMap(e.clientX, e.clientY);
      self.inputName.value = "";
      self.inputName.focus();
      self.show(self.popAdd, self.posisiMap);
    });

    self.formAdd.addEventListener("submit", function (e) {
      e.preventDefault();
      const name = self.inputName.value.trim();
      if (name) {
        self.addPin({
          name,
          x: self.posisiMap.x,
          y: self.posisiMap.y,
        });
      }
      self.hide(self.popAdd);
    });

    self.formConnect.addEventListener("submit", function (e) {
      e.preventDefault();
      const distance = self.inputDistance.value.trim();
      // console.log(distance)
      const mode = self.inputMode.value.trim();
      if (mode && distance) {
        self.submitConnect(distance, mode);
        self.hide(self.popConnect);
      }
    });

    self.closeAdd.addEventListener("click", function (e) {
      self.hide(self.popAdd);
    });
    self.closeConnect.addEventListener("click", function (e) {
      self.hide(self.popConnect);
    });

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
        self.connectFrom &&
        self.connectFrom != pinpoint.dataset.id
      ) {
        self.inputDistance.value = "";
        self.inputMode.value = "";
        self.connectTo = pinpoint.dataset.id;
        self.inputDistance.focus();
        self.show(self.popConnect, e);
      }
    });
    document.addEventListener("keydown", function (e) {
      const inputan = e.target.closest("input,textarea,select");

      if (
        (e.key == "Delete" || e.key == "Backspace") &&
        !inputan &&
        self.selectedLine
      ) {
        e.preventDefault();
        self.deleteLine();
        return;
      }

      if (e.key == "Escape") {
        self.hide(self.popAdd);
        self.selectedLine = null;
        self.hide(self.popConnect);
        self.cancelConnect();
        self.render();
      }
    });

    self.mapArea.addEventListener("click", function (e) {
      if (e.target.closest(".pinpoint, .popup")) return;

    //   ini harus taruh di paling atass
      const id = self.findClickedLine(e);
      if (id) {
        self.selectedLine = id;
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

    self.btnRoute.onclick = () => self.panelRoute.classList.toggle("hidden");

    self.inputFrom.oninput = () => {
      console.log("masuk from");
      self.checkSearch();
    };
    self.inputTo.oninput = () => {
      console.log("masuk to");
      self.checkSearch();
    };
    self.btnSearch.onclick = () => self.searchRoutes();

    const btns = document.querySelectorAll(".btn-sort");
    if (btns) {
      btns.forEach((btn) => {
        btn.onclick = () => {
          btns.forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");
          this.sortMode = btn.getAttribute("data-sort");
          this.searchRoutes();
        };
      });
    }
  }
}

window.onload = () => new App();
