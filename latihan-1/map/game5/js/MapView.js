class View {
  constructor({ area, container, linesEl, pinsEl }) {
    this.area = area;
    this.container = container;
    this.linesEl = linesEl;
    this.pinsEl = pinsEl;

    this.scale = 1;
    this.ox = 0;
    this.oy = 0;
    this.dragging = false;
  }

  // hitung scale awal supaya map memenuhi layar
  fitToLayer(w, h) {
    const aw = this.area.clientWidth;
    const ah = this.area.clientHeight;

    // pilih scale yang paling besar agar layar penuh
    this.scale = Math.max(aw / w, ah / h);

    // center map setelah diskalakan
    this.ox = (aw - w * this.scale) / 2;
    this.oy = (ah - h * this.scale) / 2;
  }

  // terapkan transform ke container
  applyTransform(w, h) {
    this.container.style.transform =
      `translate(${this.ox}px, ${this.oy}px) scale(${this.scale})`;

    // SVG harus punya ukuran yang sama dengan ukuran asli map
    this.linesEl.setAttribute("width", w);
    this.linesEl.setAttribute("height", h);
    this.linesEl.setAttribute("viewBox", `0 0 ${w} ${h}`);
  }

  // zoom mengikuti posisi cursor
  zoomAt(cursorX, cursorY, factor, w, h) {
    const rect = this.area.getBoundingClientRect();

    // posisi cursor relatif ke area map fullscreen
    const mx = cursorX - rect.left;
    const my = cursorY - rect.top;

    // titik map yang sedang ditunjuk cursor sebelum zoom
    const px = (mx - this.ox) / this.scale;
    const py = (my - this.oy) / this.scale;

    // update zoom dengan batas aman
    this.scale = Math.max(0.3, Math.min(15, this.scale * factor));

    // hitung offset baru agar titik yang sama tetap di bawah cursor
    this.ox = mx - px * this.scale;
    this.oy = my - py * this.scale;

    this.applyTransform(w, h);
  }

  zoomCenter(factor, w, h) {
    const rect = this.area.getBoundingClientRect();
    this.zoomAt(rect.left + rect.width / 2, rect.top + rect.height / 2, factor, w, h);
  }

  screenToMap(cx, cy) {
    const rect = this.area.getBoundingClientRect();
    return {
      x: (cx - rect.left - this.ox) / this.scale,
      y: (cy - rect.top - this.oy) / this.scale
    };
  }

  startDrag(e) {
    this.dragging = true;
    this._dx = e.clientX;
    this._dy = e.clientY;
    this._sox = this.ox;
    this._soy = this.oy;
    this.area.classList.add("dragging");
  }

  moveDrag(e, w, h) {
    if (!this.dragging) return;

    this.ox = this._sox + (e.clientX - this._dx);
    this.oy = this._soy + (e.clientY - this._dy);

    this.applyTransform(w, h);
  }

  stopDrag() {
    this.dragging = false;
    this.area.classList.remove("dragging");
  }

  renderPins(pins, { connectingId, onConnect, onDelete, onTarget }) {
    this.pinsEl.innerHTML = "";

    pins.forEach(pin => {
      const el = document.createElement("div");
      el.className = "pinpoint";
      el.style.position = "absolute";
      el.style.left = pin.x + "px";
      el.style.top = pin.y + "px";
      el.style.transform = "translate(-50%, -100%)";
      el.style.pointerEvents = "auto";

      const label = document.createElement("div");
      label.className = "pinpoint-label";
      if (connectingId === pin.id) label.classList.add("connecting");

      label.innerHTML = `
        <span>${pin.name}</span>
        <img src="assets/MdiTransitConnectionVariant.svg" class="btn-icon" title="Connect">
        <img src="assets/MdiTrashCanOutline.svg" class="btn-icon" title="Delete">
      `;

      const btns = label.querySelectorAll(".btn-icon");
      btns[0].onclick = e => {
        e.stopPropagation();
        onConnect(pin.id);
      };
      btns[1].onclick = e => {
        e.stopPropagation();
        onDelete(pin.id);
      };

      el.appendChild(label);

      const marker = document.createElement("div");
      marker.className = "pinpoint-marker";
      marker.innerHTML = `
        <svg viewBox="0 0 24 24" width="36" height="36">
          <path fill="#E53935" d="M12 12q.825 0 1.413-.587T14 10t-.587-1.412T12 8t-1.412.588T10 10t.588 1.413T12 12m0 10q-4.025-3.425-6.012-6.362T4 10.2q0-3.75 2.413-5.975T12 2t5.588 2.225T20 10.2q0 2.5-1.987 5.438T12 22"/>
        </svg>
      `;
      el.appendChild(marker);

      el.onclick = e => {
        e.stopPropagation();
        onTarget(pin.id, e);
      };

      this.pinsEl.appendChild(el);
    });
  }

  renderLines(conns, pins, TR, selectedId) {
    this.linesEl.innerHTML = "";

    conns.forEach(conn => {
      const a = pins.find(p => p.id === conn.fromId);
      const b = pins.find(p => p.id === conn.toId);
      if (!a || !b) return;

      const n = conn.transports.length;

      conn.transports.forEach((t, i) => {
        const off = this._offset(a, b, i, n);

        const x1 = a.x + off.x;
        const y1 = a.y + off.y;
        const x2 = b.x + off.x;
        const y2 = b.y + off.y;

        const line = this._svgLine(x1, y1, x2, y2);
        line.setAttribute("stroke", TR[t.mode].color);
        line.classList.add("line-visible");
        if (selectedId === conn.id) line.classList.add("selected");
        this.linesEl.appendChild(line);

        const txt = document.createElementNS("http://www.w3.org/2000/svg", "text");
        txt.setAttribute("x", (x1 + x2) / 2);
        txt.setAttribute("y", (y1 + y2) / 2 - 5);
        txt.setAttribute("text-anchor", "middle");
        txt.setAttribute("fill", TR[t.mode].color);
        txt.textContent = t.distance;
        this.linesEl.appendChild(txt);
      });
    });
  }

  _svgLine(x1, y1, x2, y2) {
    const l = document.createElementNS("http://www.w3.org/2000/svg", "line");
    l.setAttribute("x1", x1);
    l.setAttribute("y1", y1);
    l.setAttribute("x2", x2);
    l.setAttribute("y2", y2);
    return l;
  }

  _offset(a, b, i, n) {
    if (n <= 1) return { x: 0, y: 0 };

    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;

    const s = -(n - 1) * 3 + i * 6;
    return {
      x: (-dy / len) * s,
      y: (dx / len) * s
    };
  }
}