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
    this.scale = 1;
    this.dragX = 0;
    this.dragY = 0;

    // tahap 3
    this.connectFrom = null;
    this.connectTo = null;
    this.selectedLine = null;
    this.pins = [];
    this.connection = [];
    this.posisiMap = {};

    // thaap 3

    const $ = (id) => document.getElementById(id);

    this.mapArea = $("map-area");
    this.mapContainer = $("map-container");
    this.canvas = $("lines-layer");
    this.pinpointsLayer = $("pinpoints-layer");
    this.ctx = this.canvas.getContext("2d");

    // tahap 2
    this.popAdd = $("popup-add");
    this.inputName = $("input-name");
    this.formAdd = $("form-add");
    this.closeAdd = $("close-add");

    // tahap 3

    this.popConnect = $("popup-connect");
    this.formConnect = $("form-connect");
    this.inputDistance = $("input-distance");
    this.inputMode = $("input-mode");
    this.btnSubmitConnect = $("btn-submit-connect");
    this.closeConnect = $("close-connect");

    this.load();
    this.fit();
    this.apply();
    this.render();
    this.setup();
  }

  save() {
    localStorage.setItem("pins", JSON.stringify(this.pins));
    localStorage.setItem("connection", JSON.stringify(this.connection));
  }

  load() {
    this.pins = JSON.parse(localStorage.getItem("pins")) ?? [];
    this.connection = JSON.parse(localStorage.getItem("connection")) ?? [];
  }

  pinHtml(pin) {
    let connecting = this.connectFrom == pin.id ? "connecting" : "";
    return `
    <div class="pinpoint" style="left: ${pin.x}px;top: ${pin.y}px;" data-id="${pin.id}">
        <div class="pinpoint-header ${connecting}" data-id="${pin.id}">
            <span>${pin.name}</span>
            <img src="/assets/MdiTransitConnectionVariant.svg" alt="btn-connect" data-id="${pin.id}" class="btn-connect btn">
            <img src="/assets/MdiTrashCanOutline.svg" alt="btn-delete" data-id="${pin.id}" class="btn-delete btn">
        </div>
        <div class="marker-img">
            <img src="/assets/MaterialSymbolsLocationOn.svg" alt="icon pinpoint" class="marker">
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
    this.connection.forEach((conn, index) => {
      let pinFrom = this.findPin(conn.fromId);
      let pinTo = this.findPin(conn.toId);
      let transports = conn.transportasi;
      transports.forEach((tran, i) => {
        let off = offset(pinFrom, pinTo, index);
      let x1 = pinFrom.x + off.x;
      let x2 = pinTo.x + off.x;
      let y1 = pinFrom.y + off.y;
      let y2 = pinTo.y + off.y;

      if(this.selectedLine == conn.id){
        this.ctx.lineWidth = 6;
        this.ctx.shadowColor = 'rgb(239, 239, 10)';
        this.ctx.shadowBlur = 6;
      }else {
        this.ctx.lineWitdh = 2;
        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;
      }

      this.ctx.beginPath();
      this.ctx.moveTo(x1, y1);
      this.ctx.lineTo(x2, y2);
      this.ctx.strokestyle = App.Transports[tran.mode].color;
      this.ctx.stroke();

      this.ctx.font = 'bold 12px sans-serif';
      this.ctx.fillColor = App.Transports[tran.mode].color;
      this.ctx.textAlign = 'center';
      this.ctx.fillText(tran.distance, (x1 + x2)/2, (y1+y2)/2);
      })
    });
  }

  offset(pinFrom, pinTo, index, total) {
    if (total <= 1) return { x: 0, y: 0 };

    s = -(total - 1) * 3 + index * 6;
    const dx = Math.abs(pinFrom.x - pinTo.x);
    const dy = Math.abs(pinFrom.y - pinTo.y);

    if (dx > dy) {
      return { x: 0, y: s };
    } else {
      return { x: s, y: 0 };
    }
  }


  findClickedLine(e){
    const posisiMap = this.toMap(e.clientX, e.clientY);
    for(let i = 0; i < this.connection.length; i++){
        let conn = this.connection[i];
        // let transports = conn.transportasi; gausah pake transportasi ya 
        // disni ktia ga loop si transportasi tpi langusng aja pnajang dari si titik a ke b
        // jadi biar cepet aa gitu
        let pinFrom = this.findPin(conn.fromId);
        let pinTo = this.findPin(conn.toId);
        if(!pinFrom || !pinTo)return ;

        this.ctx.beginPath();
        this.ctx.lineWidth = 8 *this.scale
        this.ctx.moveTo(pinFrom.x, pinFrom.y);
        this.ctx.lineTo(pinTo.x, pinTo.y);

        if(this.ctx.isPointInStroke(posisiMap.x, posisiMap.y)){
            return conn.id
        }
    }
    return null
  }
  findPin(id) {
    return this.pins.find((pin) => pin.id == id);
  }

  findPinByName(name) {
    return this.pins.find((pin) => pin.name == name);
  }

  render() {
    this.renderPins();
    this.renderLines();
    this.apply();
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

  startConnect(id) {
    this.connectFrom = this.connectFrom == id ? null : id;
    this.render();
  }

  deleteLine() {
    this.connection = this.connection.filter(
      (conn) => conn.id != this.selectedLine,
    );
    this.save();
    this.render();
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
    this.connection = this.connection.filter(
      (conn) => conn.fromId != this.connectFrom && conn.toId != this.connectTo,
    );
    this.save();
    this.render();
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

      // jangna di sini si prevent defaultnya ya
      // taipi dalam masing masig if nya aja

      const relative = self.mapArea.getBoundingClientRect();
      if (e.key == "=" || e.key == "+") {
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

    self.mapArea.addEventListener("mousemove", function (e) {
      if (!self.isDragging) return;
      self.mapArea.classList.add("grabbing");
      self.ox = self.sox + (e.clientX - self.dragX);
      self.oy = self.soy + (e.clientY - self.dragY);
      self.apply();
    });

    self.mapArea.addEventListener("mouseup", function (e) {
      self.isDragging = false;
      self.mapArea.classList.remove("grabbing");
    });

    self.mapArea.addEventListener("dblclick", function (e) {
      if (e.target.closest(".pinpoint,.popup")) return;
      self.posisiMap = self.toMap(e.clientX, e.clientY);
      self.showPop(self.popAdd, e);
      self.inputName.value = "";
      self.inputName.focus();
    });

    // untuk form

    self.formAdd.onsubmit = function (e) {
      e.preventDefault();
      const name = self.inputName.value.trim();
      if (name) {
        self.addPin(name, self.posisiMap.x, self.posisiMap.y);
        self.hidePop(self.popAdd);
      }
    };

    // ini click untuk klik action yang ad adi header pinpoint
    self.pinpointsLayer.addEventListener("click", function (e) {
      e.stopPropagation(); //wajib ya
      console.log("asd");
      const buttonDelete = e.target.closest(".btn-delete");
      if (buttonDelete) {
        console.log("masuk nih");
        self.deletePin(buttonDelete.dataset.id);
        return;
      }

      const buttonConnect = e.target.closest(".btn-connect");
      if (buttonConnect) {
        console.log("asdada");
        self.startConnect(buttonConnect.dataset.id);
        return;
      }

      const pinpoint = e.target.closest(".pinpoint");
      if (
        pinpoint &&
        pinpoint.dataset.id != self.connectFrom &&
        self.connectFrom
      ) {
        self.showPop(self.popConnect, e);
        self.inputDistance.value = "";
        self.inputMode.value = "";
        self.inputDistance.focus();
      }
    });

    document.addEventListener("keydown", function (e) {
      const input = e.target.closest("input,select");
      if (
        e.key == "Delete" ||
        (e.key == "Backspace" && self.selectedLine && !input)
      ) {
        e.preventDefault();
        self.deleteLine();
      }

      if (e.key == "Escape") {
        self.hidePop(self.popAdd);
        self.hidePop(self.popConnect);
        self.cancelConnect();
        self.render();
      }
    });

    // ini untuk klik asal ya dan pas klik line untuk findline
    self.mapArea.addEventListener("click", function (e) {
      if (e.target.closest(".pinpoint,popup")) return;

      if (self.selectedLine) {
        self.selectedLine = null;
        self.render();
      }

      if (self.connectFrom) self.cancelConnect();
    });

    // untuk para button
    self.closeAdd.onclick = () => self.hidePop(self.popAdd);
    self.closeConnect.onclick = () => self.hidePop(self.popConnect);
  }
}

window.onload = () => new App();
