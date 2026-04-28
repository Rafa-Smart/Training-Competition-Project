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
    this.isDragging = false;
    this.dragX = 0;
    this.dragY = 0;
    this.scale = 1;

    // tahap kedua
    this.pins = [];
    this.connection = [];
    this.connectFrom = null;
    this.connectTo = null;
    this.selectedLine = null;
    this.posisiMap = {};

    // tahap ketiga

    const $ = (id) => document.getElementById(id);

    this.mapArea = $("map-area");
    this.mapContainer = $("map-container");
    this.mapImg = $("map-img");
    this.canvas = $("lines-layer");
    this.ctx = this.canvas.getContext("2d");
    this.pinpointsLayer = $("pinpoints-layer");

    // tahap kedua

    this.popAdd = $("popup-add");
    this.formAdd = $("form-add");
    this.closeAdd = $("close-add");
    this.inputName = $("input-name");

    // tahap ketiga
    this.popConnect = $("popup-connect");
    this.formConnect = $("form-connect");
    this.inputMode = $("input-mode");
    this.closeConnect = $('close-connect')
    this.inputDistance = $("input-distance");
    this.btnSubmitConnect = $("submit-connect");

    this.load();
    this.fit();
    this.apply();
    this.render();
    this.setup();
  }

  startConnect(id) {
    this.connectFrom = this.connectFrom == id ? null : id;
    this.render();
  }

  selectLine(id) {
    this.selectedLine = this.selectedLine == id ? null : id;
    this.render();
  }

  submitConnect(distance, mode) {
    if (!this.connectFrom || !this.connectTo) return;

    let isExistingLine;
    this.connection.forEach((conn, index) => {
      if (
        (conn.fromId == this.connectFrom && conn.toId == this.connectTo) ||
        (conn.fromId == this.connectTo && conn.toId == this.connectFrom)
      ) {
        isExistingLine = conn;
      }
    });

    if (isExistingLine) {
      const transports = isExistingLine.transportasi;
      transports.forEach((tran, index) => {
        if (tran.mode == mode) {
          alert("Connection already exists");
          return;
        }
      });
      transports.push({ mode: mode, distance: distance });
    } else {
        // console.log('masukkk')
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

  cancelConnect() {
    this.connectFrom = null;
    this.connectTo = null;
    this.render();
  }

  deleteLine() {
    this.connection = this.connection.filter((c) => c.id != this.selectedLine);
    this.selectedLine = null;
    this.save();
    this.render();
  }

  load() {
    this.pins = JSON.parse(localStorage.getItem("pins")) ?? [];
    this.connection = JSON.parse(localStorage.getItem("connection")) ?? [];
  }

  save() {
    localStorage.setItem("pins", JSON.stringify(this.pins));
    localStorage.setItem("connection", JSON.stringify(this.connection));
  }

  apply() {
    this.mapContainer.style.transform = `translate(${this.ox}px, ${this.oy}px) scale(${this.scale})`;
  }

  fit() {
    const widthArea = this.mapArea.clientWidth;
    const heightArea = this.mapArea.clientHeight;

    this.scale = Math.max(
      widthArea / App.LEBAR_MAP,
      heightArea / App.TINGGI_MAP,
    );

    this.ox = (widthArea - App.LEBAR_MAP * this.scale) / 2;
    this.oy = (heightArea - App.TINGGI_MAP * this.scale) / 2;
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

  pinHtml(pin) {
    let connecting = this.connectFrom == pin.id ? "connecting" : "";
    return `
    <div class="pinpoint" style="left: ${pin.x}px;top: ${pin.y}px;" data-id="${pin.id}">
        <div class="pinpoint-header ${connecting}" data-id="${pin.id}">
            <span>${pin.name}</span>
            <img src="/assets/MdiTransitConnectionVariant.svg" alt="" class="btn-connect btn" data-id="${pin.id}">
            <img src="/assets/MdiTrashCanOutline.svg" alt="" class="btn-delete btn" data-id="${pin.id}">
        </div>
        <div class="marker-div">
            <img src="/assets/MaterialSymbolsLocationOn.svg" alt="" class="marker">
        </div>
    </div>   
    `;
  }

  checkSearch(){
    const name = this.inputFrom.value.toLowerCase().trim()

    this.connection.forEach((conn, index) => {
        let pinFrom = this.findPinByName(name);
        let pinTo;
        
    })
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
    this.pins = this.pins.filter((p) => p.id != id);
    this.connection = this.connection.filter(
      (c) => c.fromId != id && c.toId != id,
    );
    this.save();
    this.render();
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

  findPinByName(name) {
    return this.pins.find((p) => p.name.toLowerCase().trim() == name.toLowerCase().trim());
  }

  findPin(id) {
    return this.pins.find((p) => p.id == id);
  }

  toMap(clientX, clientY) {
    const relative = this.mapArea.getBoundingClientRect();
    return {
      x: (clientX - relative.left - this.ox) / this.scale,
      y: (clientY - relative.top - this.oy) / this.scale,
    };
  }

  showPop(element, e) {
    element.style.left = e.clientX + 10 + "px";
    element.style.top = e.clientY + 10 + "px";
    element.classList.remove("hidden");
  }

  hidePop(element) {
    element.classList.add("hidden");
  }

  renderLines() {
    this.canvas.width = App.LEBAR_MAP;
    this.canvas.height = App.TINGGI_MAP;

    this.connection.forEach((conn, index) => {
      const pinFrom = this.findPin(conn.fromId);
    //   console.log(pinFrom)
      const pinTo = this.findPin(conn.toId);
      const transports = conn.transportasi;
      transports.forEach((tran, i) => {
        const off = this.offset(pinFrom, pinTo, i, transports.length);
        // console.log(off)
        const x1 = pinFrom.x + off.x;
        const x2 = pinTo.x + off.x;
        const y1 = pinFrom.y + off.y;
        const y2 = pinTo.y + off.y;

        if (this.selectedLine == conn.id) {
          this.ctx.lineWidth = 6;
          this.ctx.shadowColor = "rgb(226, 226, 9)";
          this.ctx.shadowBlur = 6;
        } else {
          this.ctx.lineWidth = 2;
          this.ctx.shadowBlur = 0;
          this.ctx.shadowColor = "transparent";
        }

        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        // console.log(tran)
        // console.log(App.Transports)
        this.ctx.strokeStyle = App.Transports[tran.mode].color;
        this.ctx.stroke();

        this.ctx.shadowBlur = 1;
        this.ctx.shadowColor = "transparent";
        this.ctx.fillStyle = App.Transports[tran.mode].color;
        this.ctx.font = "bold 12px sans-serif";
        this.ctx.textAlign = "center";
        this.ctx.fillText(tran.distance, (x1 + x2) / 2, (y1 + y2) / 2);
      });
    });
  }

  offset(pinForm, pinTo, index, total) {
    if (total <= 1) return{x:0,y:0};
    const s = -(total - 1) * 3 + index * 6;

    const dx = Math.abs(pinForm.x - pinTo.x);
    const dy = Math.abs(pinForm.y - pinTo.y);
    if (dx > dy) {
      return { x: 0, y: s };
    } else {
      return { x: s, y: 0 };
    }
  }

  findClickedLine(e) {
    const posisiMap = this.toMap(e.clientX, e.clientY);
    for (let i = 0; i < this.connection.length; i++) {
        let conn = this.connection[i]
      const pinFrom = this.findPin(conn.fromId);
      const pinTo = this.findPin(conn.toId);
      this.ctx.lineWidth = 8 / this.scale;
      this.ctx.beginPath();
      this.ctx.moveTo(pinFrom.x, pinFrom.y);
      this.ctx.lineTo(pinTo.x, pinTo.y);

      if (this.ctx.isPointInStroke(posisiMap.x, posisiMap.y)) {
        return conn.id;
      }
    }
    return null;
  }

  setup() {
    const self = this;

    self.mapArea.addEventListener("wheel", function (e) {
      if (!e.ctrlKey) return;
      e.preventDefault();
      self.zoom(e.clientX, e.clientY, e.deltaY < 0 ? 1.15 : 0.85);
    });

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
          (relative.left + relative.width) / 2,
          (relative.top + relative.height) / 2,
          0.85,
        );
      }
    });

    self.mapArea.addEventListener("mousedown", function (e) {
      self.isDragging = true;
      self.soy = self.oy;
      self.sox = self.ox;
      self.dragX = e.clientX;
      self.dragY = e.clientY;
    });

    self.mapArea.addEventListener("mousemove", function (e) {
      if (!self.isDragging) return;
      self.mapArea.style.cursor = "grabbing";
      self.ox = self.sox + (e.clientX - self.dragX);
      self.oy = self.soy + (e.clientY - self.dragY);
      self.apply();
    });

    self.mapArea.addEventListener("mouseup", function (e) {
      self.isDragging = false;
      self.mapArea.style.cursor = "grab";
    });

    self.mapArea.addEventListener("dblclick", function (e) {
      e.preventDefault();
      self.posisiMap = self.toMap(e.clientX, e.clientY);
      self.showPop(self.popAdd, e);
      self.inputName.value = "";
      self.inputName.focus();
    });

    self.closeAdd.onclick = () => self.hidePop(self.popAdd);
    self.closeConnect.onclick = () => self.hidePop(self.popConnect);

    self.formAdd.onsubmit = function (e) {
      e.preventDefault();
      const name = self.inputName.value.trim();
      if (name) {
        self.addPin(name, self.posisiMap.x, self.posisiMap.y);
        self.hidePop(self.popAdd);
      }
    };

    self.formConnect.onsubmit = function(e){
        e.preventDefault();
        const inputDistance = self.inputDistance.value.trim();
        const inputMode = self.inputMode.value.trim();
        if(inputDistance && inputMode){
            self.submitConnect(inputDistance, inputMode);
            self.hidePop(self.popConnect)
        }
    }

    self.pinpointsLayer.addEventListener("click", function (e) {
      e.stopPropagation();
      const buttonDelete = e.target.closest(".btn-delete");
      if (buttonDelete) {
        self.deletePin(buttonDelete.dataset.id);
        return;
      }
      //   untuk klik conect
      const buttonConnect = e.target.closest(".btn-connect");
      if (buttonConnect) {
        self.startConnect(buttonConnect.dataset.id);
        return;
      }

      // untuk nyambungin connect

      const pin = e.target.closest(".pinpoint");
      if (pin && self.connectFrom && self.connectFrom != pin.dataset.id) {
        self.connectTo = pin.dataset.id;
        self.showPop(self.popConnect, e);
        self.inputDistance.value = "";
        self.inputMode.value = "";
        self.inputDistance.focus();
      }
    });

    document.addEventListener("click", function (e) {
        if(e.target.closest('.popup,.pinpoint'))return
      const lineId = self.findClickedLine(e);
      if (lineId) {
        self.selectLine(lineId);
        return;
      }

      if (self.connectFrom) self.cancelConnect();
      if (self.selectedLine) {
        self.selectedLine = null;
        self.render();
      }
    });

    // jika klik delete dan escape

    document.addEventListener("keydown", function (e) {
      const input = e.target.closest(".input,select");
      if (
        !input &&
        (e.key == "Delete" || e.key == "Backspace") &&
        self.selectedLine
      ) {
        e.preventDefault();
        self.deleteLine();
        return;
      }

      if (e.key == "Escape") {
        self.hidePop(self.popAdd);
        self.hidePop(self.popConnect);
        self.cancelConnect();
        self.render();
      }
    });
  }
}

window.onload = () => new App();
