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
    this.dragX = 0;
    this.dragY = 0;
    this.isDragging = false;
    this.pins = [];
    this.connection = [];
    this.connectFrom = null;
    this.connectTo = null;
    this.selectedLine = null;
    this.posisiMap = {};
    this.routes = [];

    const $ = (id) => document.getElementById(id);

    this.mapArea = $("map-area");
    this.mapContainer = $("map-container");
    this.canvas = $("lines-layer");
    this.pinpointsLayer = $("pinpoints-layer");

    // tahap kedua
    this.inputName = $("input-name");
    this.formAdd = $("form-add");
    this.popupAdd = $("popup-add");
    this.btnCloseAdd = $("close-add");

    // tahap ketiga
    this.inputDistance = $("input-distance");
    this.inputMode = $("input-mode");
    this.btnCloseConnect = $("close-connect");
    this.formConnect = $("form-connect");
    this.popupConnect = $("popup-connect");

    // tahap keempat
    this.btnRoute = $("btn-route");
    this.sortMode = "fastest";
    this.panelRoute = $("panel-route");
    this.search = $("btn-search");
    this.inputFrom = $("input-from");
    this.inputTo = $("input-to");
    this.results = $("results-route");

    this.ctx = this.canvas.getContext("2d");
    this.load();
    this.fit();
    this.apply();
    this.render();
    this.setup();
    console.log("masuk constructor");
  }

  save() {
    localStorage.setItem("pins", JSON.stringify(this.pins));
    localStorage.setItem("connection", JSON.stringify(this.connection));
  }

  load() {
    this.pins = JSON.parse(localStorage.getItem("pins")) ?? [];
    this.connection = JSON.parse(localStorage.getItem("connection")) ?? [];
  }

  apply() {
    this.mapContainer.style.transform = `translate(${this.ox}px, ${this.oy}px) scale(${this.scale})`;
  }

  fit() {
    console.log("masuk fit");
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
    const connection = this.connectFrom == pin.id ? "connecting" : "";
    return `
    <div class="pinpoint" style="left: ${pin.x}px; top: ${pin.y}px;" data-id="${pin.id}">
      <div class="pinpoint-header ${connection}">
        <span>${pin.name}</span>
        <img
          src="/assets/MdiTransitConnectionVariant.svg"
          alt="btn conect"
          data-id="${pin.id}"
          class="btn-connect btn"
        />
        <img
          src="/assets/MdiTrashCanOutline.svg"
          alt="btn-close"
          class="btn-delete btn"
          data-id="${pin.id}"
        />
      </div>
      <div id="pin-marker">
        <img src="/assets/MaterialSymbolsLocationOn.svg" alt="pin" class="marker">
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
    return this.pins.find((pin) => pin.id == id);
  }

  renderLines() {
    this.canvas.width = App.LEBAR_MAP;
    this.canvas.height = App.TINGGI_MAP;
    let pinFrom;
    let pinTo;

    this.connection.forEach((conn, index) => {
      pinFrom = this.findPin(conn.fromId);
      pinTo = this.findPin(conn.toId);
      let transports = conn.transportasi;
      transports.forEach((tran, i) => {
        let off = this.offset(pinFrom, pinTo, i, transports.length);
        let x1 = pinFrom.x + off.x;
        let x2 = pinTo.x + off.x;
        let y1 = pinFrom.y + off.y;
        let y2 = pinTo.y + off.y;

        if (this.selectedLine == conn.id) {
          this.ctx.shadowColor = "rgb(228, 228, 13)";
          this.ctx.shadowBlur = 6;
          this.ctx.lineWidth = 6;
        } else {
          this.ctx.shadowBlur = 0;
          this.ctx.shadowColor = "transparent";
          this.ctx.lineWidth = 2;
        }

        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.strokeStyle = App.Transports[tran.mode].color;
        this.ctx.stroke();

        this.ctx.shadowBlur = 0;
        this.ctx.shadowColor = "transparent";
        this.ctx.font = `bold 12px sans-serif`;
        this.ctx.fillColor = App.Transports[tran.mode].color;
        this.ctx.textAlign = "center";
        this.ctx.fillText(tran.distance, (x1 + x2) / 2, (y1 + y2) / 2);
      });
    });
  }

  findClickedLine(e) {
    const posisiMap = this.toMap(e.clientX, e.clientY);
    for (let i = 0; i < this.connection.length; i++) {
      let conn = this.connection[i];
      let transports = conn.transportasi;
      let pinFrom = this.findPin(conn.fromId);
      let pinTo = this.findPin(conn.toId);

      for (let j = 0; j < transports.length; j++) {
        this.ctx.beginPath();
        this.ctx.lineWidth = 8 / this.scale;
        this.ctx.moveTo(pinFrom.x, pinFrom.y);
        this.ctx.lineTo(pinTo.x, pinTo.y);

        if (this.ctx.isPointInStroke(posisiMap.x, posisiMap.y)) {
          return conn.id;
        }
      }
    }
    return null;
  }

  offset(pinFrom, pinTo, index, total) {
    if (total <= 1) return { x: 0, y: 0 };

    let s = -(total - 1) * 3 + index * 6;
    const dx = Math.abs(pinFrom.x - pinTo.x);
    const dy = Math.abs(pinFrom.y - pinTo.y);

    if (dx > dy) {
      return { x: 0, y: s };
    } else {
      return { y: 0, x: s };
    }
  }

  render() {
    this.renderPins();
    this.renderLines();
    this.apply();
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
    this.pins = this.pins.filter((pin) => pin.id != id);
    this.save();
    this.render();
  }

  startConnect(id) {
    this.connectFrom = this.connectFrom == id ? null : id;
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

  deleteLine() {
    this.connection = this.connection.filter(
      (connect) => connect.id != this.selectedLine,
    );
    this.selectedLine = null;
    this.save();
    this.render();
  }

  submitConnect(distance, mode) {
    let isExistingConn;

    this.connection.forEach((pin, index) => {
      if (pin.fromId == this.connectFrom && pin.toId == this.connectTo)
        isExistingConn = pin;
      if (pin.toId == this.connectFrom && pin.fromId == this.connectTo)
        isExistingConn = pin;
    });

    if (isExistingConn) {
      let transportasi = isExistingConn.transportasi;
      transportasi.forEach((tran, i) => {
        if (tran.mode == mode) {
          alert("sdah da, pilihyang lain");
        }
        return;
      });
      isExistingConn.transportasi.push({
        mode: mode,
        distance: distance,
      });
    } else {
      this.connection.push({
        id: Date.now(),
        fromId: this.connectFrom,
        toId: this.connectTo,
        transportasi: [{ mode: mode, distance: distance }],
      });
    }
    this.cancelConnect();
    this.save();
    this.render();
  }

  findByName(name) {
    return this.pins.find(
      (pin) => pin.name.toLowerCase().trim() == name.toLowerCase().trim(),
    );
  }

  chechSearch() {
    let pinFrom;
    let pinTo;

    this.pins.forEach((pin, index) => {
      pinFrom = this.findByName(this.inputFrom.value);
      pinTo = this.findByName(this.inputTo.value);
    });

    this.search.disabled = !(pinFrom != pinTo && pinFrom && pinTo);
  }

  searchRoutes() {
    let pinFrom = this.findByName(this.inputFrom.value);
    let pinTo = this.findByName(this.inputTo.value);

    if (!pinFrom || !pinTo) return;

    this.routes = [];

    let visited = {};
    visited[pinFrom.id] = true;

    const dfs = (current, path) => {
      if (current == pinTo.id) {
        let duration = 0;
        let cost = 0;
        let steps = [];

        path.forEach((ph, index) => {
            let conn = ph.conn
          let transports = conn.transportasi;
          let from = this.findPin(conn.fromId).name;
          let to = this.findPin(conn.toId).name;

          if (!from || !to) return;

          let best = transports[0];
          let bestValue = Infinity;

          transports.forEach((tran, i) => {
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
            `(${from}) -> (${to}) duration:${duration} | cost:${cost}`,
          );
        });

        this.routes.push({
          duration: duration,
          cost: cost,
          steps: steps,
        });

        return;
      }

      this.connection.forEach((conn, index) => {
        let next;
        if (conn.fromId == current) next = conn.toId;
        if (conn.toId == current) next = conn.fromId;

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

    dfs(pinFrom.id, []);
    this.results.classList.remove("hidden");
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
    element.style.left = e.clientX + 10 + "px";
    element.style.top = e.clientY - 10 + "px";
    element.classList.remove("hidden");
  }

  hidePop(element) {
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
      if (!e.ctrlKey) return;
      const relative = self.mapArea.getBoundingClientRect();
      if (e.key == "+" || e.key == "=") {
        e.preventDefault();
        self.zoom(
          (relative.width + relative.left) / 2,
          (relative.top + relative.height) / 2,
          1.15,
        );
      }

      if (e.key == "-" || e.key == "_") {
        e.preventDefault();
        self.zoom(
          (relative.width + relative.left) / 2,
          (relative.top + relative.height) / 2,
          0.85,
        );
      }
    });

    self.mapArea.addEventListener("mousedown", function (e) {
      if (e.button) return;
      self.isDragging = true;
      self.soy = self.oy;
      self.sox = self.ox;
      self.dragX = e.clientX;
      self.dragY = e.clientY;
    });

    document.addEventListener("mousemove", function (e) {
      e.preventDefault();
      self.mapContainer.classList.add("grabbing");
      if (!self.isDragging) return;
      self.ox = self.sox + (e.clientX - self.dragX);
      self.oy = self.soy + (e.clientY - self.dragY);
      self.apply();
    });

    document.addEventListener("mouseup", function (e) {
      self.isDragging = false;
      self.mapContainer.classList.remove("grabbing");
    });

    self.mapArea.addEventListener("dblclick", function (e) {
      // console.log(`dai client x:${e.clientX}\ny:${e.clientY}`)
      if (e.target.closest(".pinpoint,.popup")) return;
      self.posisiMap = self.toMap(e.clientX, e.clientY);
      self.inputName.value = "";
      self.showPop(self.popupAdd, e);
      self.inputName.focus();
    });

    self.formAdd.onsubmit = function (e) {
      e.preventDefault();
      const name = self.inputName.value.trim();
      if (name) {
        // console.log(`dri posisi x:${self.posisiMap.x}\ny:${self.posisiMap.y}`)
        // console.log(self.pins)
        self.addPin(name, self.posisiMap.x, self.posisiMap.y);
        self.hidePop(self.popupAdd);
      }
    };

    self.formConnect.onsubmit = function (e) {
      e.preventDefault();
      let distance = self.inputDistance.value.trim();
      let mode = self.inputMode.value.trim();
      if (mode && distance) {
        console.log("masuk submit");
        self.submitConnect(distance, mode);
        self.hidePop(self.popupConnect);
      }
    };

    self.btnCloseAdd.onclick = () => self.hidePop(self.popupAdd);
    self.btnCloseConnect.onclick = () => self.hidePop(self.popupConnect);
    self.btnRoute.onclick = () => self.panelRoute.classList.toggle("hidden");

    self.pinpointsLayer.addEventListener("click", function (e) {
      e.stopPropagation();
      const buttonDelete = e.target.closest(".btn-delete");
      if (buttonDelete) {
        self.deletePin(buttonDelete.dataset.id);
        return;
      }

      const buttonConnect = e.target.closest(".btn-connect");
      if (buttonConnect) {
        console.log("masuk connect");
        self.startConnect(buttonConnect.dataset.id);
        return;
      }

      const pinHeader = e.target.closest(".pinpoint");
      if (
        pinHeader &&
        self.connectFrom &&
        // self.connectFrom != self.connectFrom &&
        self.connectFrom != pinHeader.dataset.id //ini udha ya jadi kalodiaconnect mulau dia ga bsia coonnectkin ke irinys sendiri
      ) {
        self.showPop(self.popupConnect, e);
        self.connectTo = pinHeader.dataset.id;
        self.inputDistance.value = "";
        self.inputMode.value = "";
        self.inputDistance.focus();
      }
    });

    document.addEventListener("keydown", function (e) {
      let input = e.target.closest("input,select");

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
        self.hidePop(self.popupAdd);
        self.hidePop(self.popupConnect);
        self.selectedLine = null;
        self.cancelConnect();
        self.render();
      }
    });

    self.mapArea.addEventListener("click", function (e) {
      if (e.target.closest(".pinpoint,.popup")) return;

      let lineId = self.findClickedLine(e);
      if (lineId) {
        // console.log('ini dia adalah')
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

    // tahap ke empat;

    this.inputFrom.oninput = () => this.chechSearch()
    this.inputTo.oninput = () => this.chechSearch()
    this.search.onclick = () => this.searchRoutes()



    let buttons = document.querySelectorAll('.btn-sort');
    if(buttons){
        buttons.forEach((button, index) => {
            button.onclick = () => {
                buttons.forEach(btn => btn.classList.remove('active'))
                
                            button.classList.add('active');
                            this.sortMode = button.getAttribute('data-sort')
                            this.searchRoutes()
            }
        })
    }


  }
}

window.onload = () => new App();
