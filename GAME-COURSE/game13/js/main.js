class App {
  static LEBAR_MAP = 982;
  static TINGGI_MAP = 450;

  static Transports = {
    Train: { color: "#33E339", speed: 120, cost: 500, label: "Train" },
    Bus: { color: "#A83BE8", speed: 80, cost: 100, label: "Bus" },
    Airplane: { color: "#000000", speed: 800, cost: 1000, label: "Airplane" },
  };

  constructor() {
    this.oy = 0;
    this.ox = 0;
    this.soy = 0;
    this.sox = 0;
    this.dragX = 0;
    this.dragY = 0;
    this.isDragging = false;
    this.scale = 1;

    // thaap 2
    this.connectFrom = null;
    this.connectTo = null;
    this.pins = [];
    this.connction = [];
    this.posisiMap = {};
    this.routes = [];

    const $ = (id) => document.getElementById(id);

    this.mapArea = $("map-area");
    this.mapContainer = $("map-container");
    this.canvas = $("lines-layer");
    this.ctx = this.canvas.getContext("2d");
    this.pinpointsLayer = $("pinpoints-layer");

    // tahap 2
    this.popAdd = $("popup-add");
    this.formAdd = $("form-add");
    this.inputName = $("input-name");

    // tahap ke tiga
    this.popConnect = $("popup-connect");
    this.formConnect = $("form-connect");
    this.inputDistance = $("input-distance");
    this.inputMode = $("input-mode");
    this.selectedLine = null;
    this.connectFrom = null;
    this.connectTo = null;

    this.load();
    this.fit();
    this.render();
    this.apply();
    this.setup();
  }

  save() {
    localStorage.setItem("pins", JSON.stringify(this.pins));
    localStorage.setItem("conenction", JSON.stringify(this.connction));
  }

  load() {
    this.pins = JSON.parse(localStorage.getItem("pins")) ?? [];
    this.connection = JSON.parse(localStorage.getItem("connection")) ?? [];
  }

  apply() {
    this.mapContainer.style.transform = `translate(${this.ox}px, ${this.oy}px) scale(${this.scale})`;
  }

  fit() {
    const widthArea = this.mapArea.clientWidth;
    const heigthArea = this.mapArea.clientHeight;
    this.scale = Math.max(
      widthArea / App.LEBAR_MAP,
      heigthArea / App.TINGGI_MAP,
    );
    this.ox = (widthArea - App.LEBAR_MAP * this.scale) / 2;
    this.oy = (heigthArea - App.TINGGI_MAP * this.scale) / 2;
  }

  zoom(clientX, clientY, factor) {
    const relative = this.mapArea.getBoundingClientRect();
    let mx = clientX - relative.left;
    let my = clientY - relative.top;
    let px = (mx - this.ox) / this.scale;
    let py = (my - this.oy) / this.scale;

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
    let connecting = this.connectFrom == pin.id ? "connecting" : "";
    return `
    <div class="pinpoint" data-id="${pin.id}" style="left:${pin.x}px;top:${pin.y}px;">
        <div class="header ${connecting}">
            <span>${pin.name}</span>
            <img src="/assets/MdiTransitConnectionVariant.svg" data-id="${pin.id}" alt="btn connect" class="btn-connect btn" title="connect pinpoint">
            <img src="/assets/MdiTrashCanOutline.svg" data-id="${pin.id}" alt="btn-close" class="btn-delete btn" title="delete pinpoint">
        </div>
    <div>
        <img src="/assets/MaterialSymbolsLocationOn.svg" alt="icon" class="marker">
    </div>       
    </div>   
    `;
  }

  renderPins() {
    let html = ``;
    this.pins.forEach((pin, index) => {
      html += this.pinHtml(pin);
    });
    this.pinpointsLayer.innerHTML = html;
  }

  renderLines() {
    this.canvas.width = App.LEBAR_MAP;
    this.canvas.height = App.TINGGI_MAP;

    this.connction.forEach((conn, index) => {
      let transports = conn.transportasi;
      let pinFrom = this.findPin(conn.fromId);
      let pinTo = this.findPin(conn.toId);
      if (!pinTo || !pinFrom) return;
      transports.forEach((tran, i) => {
        let off = this.offset(pinFrom, pinTo, i, transports.length);
        let x1 = pinFrom.x + off.x;
        let x2 = pinTo.x + off.x;
        let y1 = pinFrom.y + off.y;
        let y2 = pinTo.y + off.y;

        if (this.selectLine == conn.id) {
          this.ctx.lineWidth = 6;
          this.ctx.shadowColor = "rgb(215, 222, 11)";
          this.ctx.shadowBlur = 6;
        } else {
          this.ctx.lineWidth = 2;
          this.ctx.shadowBlur = 0;
          this.ctx.shadowColor = 1;
        }

        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.strokeStyle = App.Transports[tran.mode].color;
        this.ctx.stroke();
        this.font = "bold 11px sans-serif";
        this.ctx.fillStyle = App.Transports[tran.mode].color;
        this.ctx.textAlign = "center";
        this.ctx.fillText(tran.distance, (x1 + x2) / 2, (y1 + y2) / 2);
      });
    });
  }

  offset(pinFrom, pinTo, index, total) {
    if (total <= 1) return;
    let s = -(total - 1) + index * 6;
    let dx = Math.abs(pinFrom.x - pinTo.x);
    let dy = Math.abs(pinFrom.y - pinTo.y);
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

  startConnect(id) {
    this.connectFrom = this.connectFrom == id ? null : id;
    this.render();
  }

  cancelConnect() {
    this.connectFrom = null;
    this.connectTo = null;
    this.render();
  }

  submitConnect(distance, mode) {
    let isExisting;

    this.connction.forEach((conn, index) => {
      if (conn.fromId == this.connectFrom && conn.toId == this.connectTo)
        isExisting = conn;
      if (conn.toId == this.connectFrom && conn.fromId == this.connectTo)
        isExisting = conn;
    });

    if (isExisting) {
      isExisting.transportasi.forEach((tran, index) => {
        if (tran.mode == mode) {
          alert("sudah ada tranportasi ini cari lagi yang lain");
          return;
        }
      });

      isExisting.transportasi.push({
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

  selectLine(id) {
    this.selectedLine = this.selectedLine == id ? null : id;
    this.render();
  }

  deleteLine() {
    this.connction = this.connection.filter((conn, index) => {
      return conn.id !== this.selectedLine;
    });
    this.selectedLine = null;
    this.save();
    this.render();
  }

  render() {
    this.renderPins();
    this.renderLines();
    this.apply();
  }

  findClickedLine(e) {
    const posisiMap = this.toMap(e.clientX, e.clientY);
    let pinFrom;
    let pinTo;

    for (let i = 0; i < this.connection.length; i++) {
      let conn = this.connection[i];
      pinFrom = this.findPin(conn.fromId);
      pinTo = this.findPin(conn.toId);
      if (!pinFrom || !pinTo) return;

      this.ctx.beginPath();
      this.ctx.moveTo(pinFrom.x, pinFrom.y);
      this.ctx.lineTo(pinTo.x, pinTo.y);

      if (this.ctx.isPointInStroke(posisiMap.x, posisiMap.y)) {
        return conn.id;
      }
    }
    return null;
  }

  addPin(name, x, y) {
    this.pins.push({
      id: Date.now(),
      name: name,
      x: x,
      y: y,
    });
    console.log(this.pins);
    this.save();
    this.render();
  }

  deletePin(id) {
    this.pins = this.pins.filter((pin, index) => pin.id != id);
    this.conection = this.connction.filter((pin, index) => {
      return pin.fromId != id && pin.toId != id;
    });
    this.save();
    this.render();
  }

  findPin(id) {
    return this.pins.find((pin) => pin.id == id);
  }

  findPinName(name) {
    return this.pins.find((pin) => pin.name == name);
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

    self.mapArea.addEventListener(
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
      let relative = self.mapArea.getBoundingClientRect();
      if (e.key == "+" || e.key == "=") {
        e.preventDefault();
        self.zoom(
          (relative.width + relative.left) / 2,
          (relative.height + relative.top) / 2,
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
      if (e.button && e.target.closest(".pinpoint,popup")) return;
      self.isDragging = true;
      self.sox = self.ox;
      self.soy = self.oy;
      self.dragX = e.clientX;
      self.dragY = e.clientY;
    });

    document.addEventListener("mousemove", function (e) {
      if (!self.isDragging) return;
      self.ox = self.sox + (e.clientX - self.dragX);
      self.oy = self.soy + (e.clientY - self.dragY);
      self.mapArea.classList.add("grabbing");
      self.apply();
    });

    document.addEventListener("mouseup", function (e) {
      self.isDragging = false;
      self.mapArea.classList.remove("grabbing");
    });

    self.mapArea.addEventListener("dblclick", function (e) {
      if (e.target.closest(".pinpoint,popup")) return;
      self.posisiMap = self.toMap(e.clientX, e.clientY);
      self.showPop(self.popAdd, e);

      self.inputName.value = "";
      self.inputName.focus();
    });

    self.formAdd.onsubmit = function (e) {
      e.preventDefault();

      const name = self.inputName.value.trim();
      console.log("ini namenya", name);
      if (name) {
        self.addPin(name, self.posisiMap.x, self.posisiMap.y);
        self.hidePop(self.popAdd);
      }
      // self.render() gausha soalnya udah di addPin
    };

    self.formConnect.oninput = function (e) {
      let distance = self.inputDistance.value.trim();
      let mode = self.inputMode.value.trim();
      if (mode && distance) {
        self.submitConnect(distance, mode);
        self.hidePop(self.popConnect);
      }
    };

    self.pinpointsLayer.addEventListener("click", function (e) {
      e.stopPropagation(); // ini wajib ya
      let buttonDelete = e.target.closest(".btn-delete");
      if (buttonDelete) {
        self.deletePin(buttonDelete.dataset.id);
        return;
      }

      let buttonConnect = e.target.closest(".btn-connect");
      if (buttonConnect) {
        self.startConnect(buttonConnect.dataset.id);
        return;
      }

      //   ini keitk klik pinpoint tapi setelah klik connectFrom ya
      let gasConnect = e.target.closest(".pinpoint");
      if (gasConnect) {
        self.connectTo = gasConnect.dataset.id;
        self.showPop(self.popConnect, e);
        self.inputDistance.value = "";
        self.inputMode.value = "";
        self.inputDistance.focus();
      }
    });

    // INI ADALHA YANG ALO DI KLIK MAKA ILANG YA
    // ini buat ketika klik escape / delete ya
    document.addEventListener("keydown", function (e) {
      const input = e.target.closest("input,textarea,select");
      if (!input) {
      }

      if (e.key == "Escape") {
        self.hidePop(self.popAdd);
        self.hidePop(self.popConnect);
        self.cancelConnect();
        self.selectedLine = null;
        self.render();
      }
      if (
        (e.key == "Delete" || e.key == "Backspace") &&
        !Input &&
        self.selectedLine
      ) {
        e.preventDefault();
        self.deleteLine();
      }
    });

    // ini klik apapun biar ialng
    // ini buat hapus selected line / pas conect
    self.mapArea.addEventListener("click", function (e) {
      if (e.target.closest(".pinpoint,popup")) return;
      const linePilihId = self.findClickedLine(e);
      if (linePilihId) {
        self.selectLine(linePilihId);
        return;
      }
      if (self.connectFrom) self.cancelConnect();
      if (self.selectedLine) {
        self.selectedLine = null;
        self.render();
      }
    });

    // INI BATASAN YANG TAS YANG IALNG TADI

    document
      .querySelector(".close-add")
      .addEventListener("click", function (e) {
        self.hidePop(self.popAdd);
      });

    document
      .querySelector("#connect-close")
      .addEventListener("click", function (e) {
        self.hidePop(self.popConnect);
        self.cancelConnect();
      });
  }
}

window.onload = () => new App();
