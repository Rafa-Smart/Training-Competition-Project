import { AppConfig } from './Config.js';

export class Renderer {
  constructor(canvas, pinsContainer, resultsContainer) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.pinsContainer = pinsContainer;
    this.resultsContainer = resultsContainer;
  }

  // --- LOGIKA CANVAS (Garis Paralel) ---
  renderLines(conns, pins, scale, selectedLineId) {
    this.canvas.width = AppConfig.MW;
    this.canvas.height = AppConfig.MH;
    
    conns.forEach(c => {
      let a = pins.find(p => p.id === c.fromId);
      let b = pins.find(p => p.id === c.toId);
      if (!a || !b) return;

      let n = c.transports.length;
      for (let j = 0; j < n; j++) {
        let t = c.transports[j];
        let off = this.calculateOffset(a, b, j, n);
        
        let x1 = a.x + off.x;
        let y1 = a.y + off.y;
        let x2 = b.x + off.x;
        let y2 = b.y + off.y;

        if (selectedLineId === c.id) {
          this.ctx.shadowColor = "rgba(255, 255, 0, 0.8)";
          this.ctx.shadowBlur = 6;
          this.ctx.lineWidth = 5;
        } else {
          this.ctx.shadowColor = "transparent";
          this.ctx.shadowBlur = 0;
          this.ctx.lineWidth = 3;
        }

        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.strokeStyle = AppConfig.TR[t.mode].color;
        this.ctx.stroke();

        this.ctx.shadowColor = "transparent";
        this.ctx.fillStyle = AppConfig.TR[t.mode].color;
        this.ctx.font = "bold 11px sans-serif";
        this.ctx.textAlign = "center";
        this.ctx.fillText(t.distance, (x1 + x2) / 2, (y1 + y2) / 2 - 5);
      }
    });
  }

  calculateOffset(a, b, i, n) {
    if (n <= 1) return { x: 0, y: 0 };
    let s = -(n - 1) * 3 + i * 6;
    let dx = Math.abs(b.x - a.x);
    let dy = Math.abs(b.y - a.y);
    return dx >= dy ? { x: 0, y: s } : { x: s, y: 0 };
  }

  findClickedLine(mouseX, mouseY, conns, pins, scale) {
    for (let i = 0; i < conns.length; i++) {
      let c = conns[i];
      let a = pins.find(p => p.id === c.fromId);
      let b = pins.find(p => p.id === c.toId);
      if (!a || !b) continue;

      this.ctx.lineWidth = 8 / scale;
      this.ctx.beginPath();
      this.ctx.moveTo(a.x, a.y);
      this.ctx.lineTo(b.x, b.y);

      if (this.ctx.isPointInStroke(mouseX, mouseY)) return c.id;
    }
    return null;
  }

  // --- LOGIKA DOM PINS ---
  renderPins(pins, connectFromId) {
    let html = "";
    pins.forEach(p => {
      let cls = connectFromId === p.id ? " connecting" : "";
      html += `
        <div class="pinpoint" style="left:${p.x}px;top:${p.y}px" data-id="${p.id}">
          <div class="pinpoint-label${cls}">
            <span>${p.name}</span>
            <img src="assets/MdiTransitConnectionVariant.svg" class="btn-icon btn-connect" data-id="${p.id}" title="Connect">
            <img src="assets/MdiTrashCanOutline.svg" class="btn-icon btn-delete" data-id="${p.id}" title="Delete">
          </div>
          <div class="pinpoint-marker">
            <svg viewBox="0 0 24 24"><path fill="#E53935" d="M12 12q.825 0 1.413-.587T14 10t-.587-1.412T12 8t-1.412.588T10 10t.588 1.413T12 12m0 10q-4.025-3.425-6.012-6.362T4 10.2q0-3.75 2.413-5.975T12 2t5.588 2.225T20 10.2q0 2.5-1.987 5.438T12 22"/></svg>
          </div>
        </div>`;
    });
    this.pinsContainer.innerHTML = html;
  }

  // --- LOGIKA CETAK HASIL DFS ---
  displayResults(routes) {
    if (!routes.length) {
      this.resultsContainer.innerHTML = '<p style="color:#999">No routes found</p>';
      return;
    }

    let html = "";
    routes.forEach(r => {
      let hh = Math.floor(r.dur);
      let mm = Math.round((r.dur - hh) * 60);
      let waktu = hh ? `${hh}h ${mm}min` : `${mm}min`;

      html += `
        <div class="route-card">
          <div class="steps">
              ${r.steps.map((step, j) => `<div>${j + 1}. ${step}</div>`).join("")}
          </div>
          <div class="info">
              <span>${waktu}</span>
              <span>Rp${r.cost.toLocaleString("id-ID")}</span>
          </div>
        </div>`;
    });
    this.resultsContainer.innerHTML = html;
  }
}
