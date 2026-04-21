// MapView — Mengatur tampilan peta: zoom, pan, render

class MapView {
    constructor(area, container, linesEl, pinsEl) {
        this.area = area;
        this.container = container;
        this.linesEl = linesEl;
        this.pinsEl = pinsEl;
        this.scale = 1;
        this.ox = 0;
        this.oy = 0;
        this.dragging = false;
    }

    // Zoom awal agar peta penuh layar
    fitToScreen(w, h) {
        const aw = this.area.clientWidth, ah = this.area.clientHeight;
        this.scale = Math.max(aw / w, ah / h);
        this.ox = (aw - w * this.scale) / 2;
        this.oy = (ah - h * this.scale) / 2;
    }

    // Terapkan posisi & zoom ke CSS
    applyTransform(w, h) {
        this.container.style.transform = `translate(${this.ox}px,${this.oy}px) scale(${this.scale})`;
        this.linesEl.setAttribute('width', w);
        this.linesEl.setAttribute('height', h);
    }

    // Zoom mengikuti posisi cursor
    zoomAt(cx, cy, factor, w, h) {
        const r = this.area.getBoundingClientRect();
        const mx = cx - r.left, my = cy - r.top;
        const px = (mx - this.ox) / this.scale, py = (my - this.oy) / this.scale;
        this.scale = Math.max(0.3, Math.min(15, this.scale * factor));
        this.ox = mx - px * this.scale;
        this.oy = my - py * this.scale;
        this.applyTransform(w, h);
    }

    // Zoom dari tengah layar
    zoomCenter(factor, w, h) {
        const r = this.area.getBoundingClientRect();
        this.zoomAt(r.left + r.width / 2, r.top + r.height / 2, factor, w, h);
    }

    // Konversi posisi layar → koordinat peta
    screenToMap(cx, cy) {
        const r = this.area.getBoundingClientRect();
        return { x: (cx - r.left - this.ox) / this.scale, y: (cy - r.top - this.oy) / this.scale };
    }

    // Pan: mulai, gerak, selesai
    startDrag(e) {
        this.dragging = true;
        this._dx = e.clientX; this._dy = e.clientY;
        this._sox = this.ox; this._soy = this.oy;
    }

    moveDrag(e, w, h) {
        if (!this.dragging) return;
        this.ox = this._sox + (e.clientX - this._dx);
        this.oy = this._soy + (e.clientY - this._dy);
        this.applyTransform(w, h);
    }

    stopDrag() { this.dragging = false; }

    // Gambar semua pinpoint
    renderPins(pins, { connectingId, onConnect, onDelete, onTarget }) {
        this.pinsEl.innerHTML = '';
        pins.forEach(pin => {
            const el = document.createElement('div');
            el.className = 'pinpoint';
            el.style.left = pin.x + 'px';
            el.style.top = pin.y + 'px';

            const label = document.createElement('div');
            label.className = 'pinpoint-label' + (connectingId === pin.id ? ' connecting' : '');
            label.innerHTML = `<span>${pin.name}</span>
                <img src="assets/MdiTransitConnectionVariant.svg" class="btn-icon" title="Connect">
                <img src="assets/MdiTrashCanOutline.svg" class="btn-icon" title="Delete">`;

            const btns = label.querySelectorAll('.btn-icon');
            btns[0].onclick = e => { e.stopPropagation(); onConnect(pin.id); };
            btns[1].onclick = e => { e.stopPropagation(); onDelete(pin.id); };
            el.appendChild(label);

            const marker = document.createElement('div');
            marker.className = 'pinpoint-marker';
            marker.innerHTML = '<svg viewBox="0 0 24 24"><path fill="#E53935" d="M12 12q.825 0 1.413-.587T14 10t-.587-1.412T12 8t-1.412.588T10 10t.588 1.413T12 12m0 10q-4.025-3.425-6.012-6.362T4 10.2q0-3.75 2.413-5.975T12 2t5.588 2.225T20 10.2q0 2.5-1.987 5.438T12 22"/></svg>';
            el.appendChild(marker);

            el.onclick = e => { e.stopPropagation(); onTarget(pin.id, e); };
            this.pinsEl.appendChild(el);
        });
    }

    // Gambar semua garis koneksi
    renderLines(conns, pins, TR, selectedId) {
        this.linesEl.innerHTML = '';
        conns.forEach(conn => {
            const a = pins.find(p => p.id === conn.fromId);
            const b = pins.find(p => p.id === conn.toId);
            if (!a || !b) return;

            const n = conn.transports.length;
            conn.transports.forEach((t, i) => {
                const off = this._offset(a, b, i, n);
                const x1 = a.x + off.x, y1 = a.y + off.y;
                const x2 = b.x + off.x, y2 = b.y + off.y;

                const line = this._svgLine(x1, y1, x2, y2);
                line.setAttribute('stroke', TR[t.mode].color);
                line.classList.add('line-visible');
                if (selectedId === conn.id) line.classList.add('selected');
                this.linesEl.appendChild(line);

                const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                txt.setAttribute('x', (x1 + x2) / 2);
                txt.setAttribute('y', (y1 + y2) / 2 - 5);
                txt.setAttribute('text-anchor', 'middle');
                txt.setAttribute('fill', TR[t.mode].color);
                txt.textContent = t.distance;
                this.linesEl.appendChild(txt);
            });
        });
    }

    _svgLine(x1, y1, x2, y2) {
        const l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        l.setAttribute('x1', x1); l.setAttribute('y1', y1);
        l.setAttribute('x2', x2); l.setAttribute('y2', y2);
        return l;
    }

    _offset(a, b, i, n) {
        if (n <= 1) return { x: 0, y: 0 };
        const dx = b.x - a.x, dy = b.y - a.y;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        const s = -(n - 1) * 3 + i * 6;
        return { x: (-dy / len) * s, y: (dx / len) * s };
    }
}
