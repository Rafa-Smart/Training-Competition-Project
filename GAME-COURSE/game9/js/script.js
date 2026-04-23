class App {
  // ini ada di aknan bawah ya untuk ukran si gambarnya coba aja buka gambarnya di vscode terus liat

  static lebarMap = 982;
  static tinggiMap = 450;
  //     . Train
  // ○ Line color: #33E339
  // ○ Speed: 120 km/h
  // ○ Cost: Rp500/km
  // LKS Nasional XXXIII Web Technologies - @webtechindonesia - Rev0 Page 3 of 8
  // 2. Bus
  // ○ Line color: #A83BE8
  // ○ Speed: 80 km/h
  // ○ Cost: Rp100/km
  // 3. Airplane
  // ○ Line color: #000000
  // ○ Speed: 800 km/h
  // ○ Cost: Rp1.000/km

  static Trasportasi = {
    Train: {
      color: "#33E339",
      speed: 120,
      cost: 500,
    },
    Bus: {
      color: "#A83BE8",
      speed: 80,
      cost: 100,
    },
    Airplane: {
      color: "#000000",
      speed: 800,
      cost: 1000,
    },
  };

  constructor() {
    this.scale = 1;
    this.dragging = false;
    this.connectFrom = null;
    this.connectTo = null;
    this.selectedLine = null;
    this.sortMode = "fastest";
    this.routes = [];
    this.clickPos = {};
    this.ox = 0;
    this.oy = 0;
    this.sox = 0;
    this.soy = 0;
    this.dragY = 0;
    this.dragX = 0;
    var $ = function (id) {
      return document.getElementById(id);
    };
    this.canvas = $("lines-layer");
    this.ctx = this.canvas.getContext("2d");
    this.mapArea = $("map-area");
    this.mapContainer = $("container-map");
    this.pinsLayer = $("pinpoints-layer");
    this.connection = [
      {
        id: "test",
        fromId: "jakarta",
        toId: "bandung",
        trasportasi: [
          // ini nanti dari inputan ya
          {
            mode: "Train",
            distance: 200,
          },
          {
            mode: "Bus",
            distance: 25, // ini nanti dari inputan ya
          },
        ],
      },
    ];
    this.pins = [
      {
        id: "jakarta",
        name: "Jakarta",
        x: 100, // ini dari peta ya
        y: 200,
      },
      {
        id: "bandung",
        name: "Bandung",
        x: 200, // ini dari peta ya
        y: 300,
      },
    ];

    this.fit();
    this.render();
  }

  save() {
    localStorage.setItem("pins", JSON.stringify(pins));
    localStorage.setItem("connection", JSON.stringify(this.connection));
  }

  load() {
    this.pins = JSON.parse(localStorage.getItem("pins"));
    this.connection = JSON.parse(localStorage.getItem("connection"));
  }

  fit() {
    console.log("test");
    var widthMapArea = this.mapArea.clientWidth;
    var heightMapArea = this.mapArea.clientHeight;

    this.scale = Math.max(
      widthMapArea / App.lebarMap,
      heightMapArea / App.tinggiMap,
    );
    this.ox = (widthMapArea - App.lebarMap * this.scale) / 2;
    this.oy = (heightMapArea - App.tinggiMap * this.scale) / 2;
  }

  apply() {
    this.mapContainer.style.transform = `translate(${this.ox}px, ${this.oy}px) scale(${this.scale})`;
  }

  zoom(clientX, clientY, factor) {
    var relative = this.mapArea.getBoundingClientRect();
    var ukuranLebarLayar = clientX - relative.left;
    const ukuranTinggiLayar = clientY - relative.top;

    // dapetin ukuran peta asli
    const petaX = (ukuranLebarLayar - this.ox) / this.scale;
    const petaY = (ukuranTinggiLayar - this.oy) / this.scale;

    // hitung lagi scalenya
    this.scale = Math.max(0.3, Math.min(15, factor * this.scale));
    this.apply();
  }

  toMap(clientX, clientY) {
    const relative = this.mapArea.getBoundingClientRect();
    const ukuranLebarLayar = clientX - relative.left;
    const ukuranTinggiLayar = clientY - relative.top;
    return {
      x: (ukuranLebarLayar - this.ox) / this.scale,
      y: (ukuranTinggiLayar - this.oy) / this.scale,
    };
  }

  generatePin(pin) {
    // jaid kalo ternyaata si pin id ini adalah id yang kita klik
    // nanti itu isi dari conenctForm adaalh pin yangkita klik tombol connectnya

    // nanti ad animasi connecting ya
    const isConnecting = this.connectFrom == pin.id ? " connecting" : "";

    // nah disini kita kaih style biar nanti tempatnya itu ad dititik yan dah di tentukan ya
    // ingat ya di class pin ini uga udha di kasih absolute
    return ` <div class="pin" style="left:${pin.x}px;top:${pin.y}px;">
      <div class="pin-action ${isConnecting}">
        <div><span>${pin.name}</span></div>
        <div> 
          <img
            data-id="${pin.id}"
            class="btn-connect-pin"
            src="/assets/MdiTransitConnectionVariant.svg"
            alt="connect"
          />
        </div>
        <div>
          <img
            class="btn-delete-pin"
            data-id="${pin.id}"
            src="/assets/MdiTrashCanOutline.svg"
            alt="delete"
          />
        </div>
      </div>
      <div class="pin-svg">
        <img
          class="pin-img"
          src="assets/MaterialSymbolsLocationOn.svg"
          alt=""
        />
      </div>
    </div>`;
  }

  render() {
    this.renderPins();
    this.renderLines();
    this.apply();
  }

  renderPins() {
    var html = "";
    for (let i = 0; i < this.pins.length; i++) {
      html += this.generatePin(this.pins[i]);
    }
    this.pinsLayer.innerHTML = html;
  }

  renderLines() {
    // kita reset canvaas ya pake cara ini
    this.canvas.width = App.lebarMap;
    this.canvas.height = App.tinggiMap;

    // nah kita loop seua koneksi

    for (let i = 0; i < this.connection.length; i++) {
      let conn = this.connection[i];
      const fromPin = this.findPin(conn.fromId);
      const toPin = this.findPin(conn.toId);
      console.log(toPin);
      if (!fromPin || !toPin) continue; // lewat aja sekarang

      const jumlahTransportasi = conn.trasportasi.length;
      for (let i = 0; i < jumlahTransportasi; i++) {
        console.log('satu kali ', i)
        let transportasiLoop = conn.trasportasi[i];

        // kita buat ofset nya
        let off = this.offset(fromPin, toPin, i, jumlahTransportasi);
        let fromPinX = fromPin.x + off.x;
        let toPinX = toPin.x + off.x;
        let fromPinY = fromPin.y + off.y;
        let toPinY = toPin.y + off.y;

        // disni kita cek duu apkaah ada satu line di sini yang lagi di seleect

        // selectline adalah id ya dan ini tuh bukan id per pin api id dari connectionnya
        if (this.selectedLine == conn.id) {
          this.ctx.shadowColor = "rgb(223, 223, 13)";
          this.ctx.shadowBlur = 6;
          this.ctx.lineWidth = 5;
        } else {
          this.ctx.shadowColor = "transparent";
          this.ctx.shadowBlur = 0;
          this.ctx.lineWidth = 3;
        }

        this.ctx.beginPath();
        this.ctx.moveTo(fromPinX, fromPinY);
        this.ctx.lineTo(toPinX, toPinY);
        this.ctx.strokeStyle = App.Trasportasi[transportasiLoop.mode].color;
        this.ctx.stroke();

        // sekalian tulis istance di tengh
        this.ctx.shadowColor = "transparent";
        this.ctx.shadowBlur = 0;
        this.ctx.fillStyle = App.Trasportasi[transportasiLoop.mode].color
        this.ctx.font = "bold 11px sans-serif"; 
        this.ctx.textAlign = "center";
        this.ctx.fillText(
          transportasiLoop.distance + "km",
          (fromPinX + toPinX) / 2,
          (toPinY+ fromPinY) / 2,
        );
      }
    }
  }

  offset(fromPin, toPin, index, jumlah) {
    if (jumlah <= 1) return { x: 0, y: 0 };
    const s = -(jumlah - 1) * 3 + index * 6;

    // ini uth cuma pengen dapetin data lebar dan tingginya ja dan ga peduli kalo dia min atau plus
    const dx = Math.abs(toPin.x - fromPin.x);
    const dy = Math.abs(toPin.y - fromPin.y);

    if (dx >= dy) {
      // ini pengecekan jika dia itu
      // horizontal
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

  findPin(id) {
    //  return this.pins.filter((pin) => {
    //     return pin.id == id
    //   });

    // jangan pake ini soalnya kan return array jadi pae ini aja
    let hasil;
    for (let i = 0; i < this.pins.length; i++) {
      if (this.pins[i].id == id) {
        hasil = this.pins[i];
      }
    }
    // console.log('inipin', hasil)
    return hasil;
  }

  addPin(x, y, name) {
    this.pins.push({
      name: name,
      id: Date.now(),
      x: x,
      y: y,
    });

    this.save();
  }
}

const game = new App();
