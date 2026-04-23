export class Viewport {
  constructor() {
    this.scale = 1;
    this.ox = 0;
    this.oy = 0;
  }

  // Hitung zoom mempertahankan titik kursor
  zoom(mx, my, factor) {
    let px = (mx - this.ox) / this.scale;
    let py = (my - this.oy) / this.scale;

    this.scale = Math.max(0.3, Math.min(15, this.scale * factor));

    this.ox = mx - px * this.scale;
    this.oy = my - py * this.scale;
  }

  // Konversi dari kursor (Layar) ke koordinat Peta Asli
  toMap(cx, cy, rect) {
    return {
      x: (cx - rect.left - this.ox) / this.scale,
      y: (cy - rect.top - this.oy) / this.scale,
    };
  }
}
