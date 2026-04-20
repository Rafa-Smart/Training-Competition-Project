// App — Controller utama: data, event, UI, dan pencarian rute

const W = 982, H = 450; // Ukuran SVG peta

const TR = {
    train:    { color: '#33E339', speed: 120, cost: 500,  label: 'Train' },
    bus:      { color: '#A83BE8', speed: 80,  cost: 100,  label: 'Bus' },
    airplane: { color: '#000000', speed: 800, cost: 1000, label: 'Airplane' }
};

class App {
    constructor() {
        this.pins = [];          // [{ id, name, x, y }]
        this.conns = [];         // [{ id, fromId, toId, transports: [{ mode, distance }] }]
        this.connFrom = null;    // ID pinpoint asal (mode connect)
        this.connTo = null;      // ID pinpoint tujuan
        this.selLine = null;     // ID koneksi yang dipilih
        this.sortMode = 'fastest';
        this.routes = [];
        this.clickPos = { x: 0, y: 0 };

        // DOM
        this.d = {
            popupAdd:  document.getElementById('popup-add'),
            popupConn: document.getElementById('popup-connect'),
            name:      document.getElementById('input-name'),
            dist:      document.getElementById('input-distance'),
            mode:      document.getElementById('input-mode'),
            from:      document.getElementById('input-from'),
            to:        document.getElementById('input-to'),
            search:    document.getElementById('btn-search'),
            sortCtrl:  document.getElementById('sort-controls'),
            results:   document.getElementById('route-results')
        };

        this.map = new MapView(
            document.getElementById('map-area'),
            document.getElementById('map-container'),
            document.getElementById('lines-layer'),
            document.getElementById('pinpoints-layer')
        );

        this.load();
        this.map.fitToScreen(W, H);
        this.render();
        this.events();
    }

    // === DATA ===
    save() {
        localStorage.setItem('pins', JSON.stringify(this.pins));
        localStorage.setItem('conns', JSON.stringify(this.conns));
    }

    load() {
        this.pins = JSON.parse(localStorage.getItem('pins') || '[]');
        this.conns = JSON.parse(localStorage.getItem('conns') || '[]');
    }

    // === RENDER ===
    render() {
        this.map.renderPins(this.pins, {
            connectingId: this.connFrom,
            onConnect: id => this.startConn(id),
            onDelete: id => this.delPin(id),
            onTarget: (id, e) => {
                if (this.connFrom && this.connFrom !== id) {
                    this.connTo = id;
                    this.popup(this.d.popupConn, e);
                    this.d.dist.value = ''; this.d.mode.value = '';
                    this.d.dist.focus();
                }
            }
        });
        this.map.renderLines(this.conns, this.pins, TR, this.selLine);
        this.map.applyTransform(W, H);
    }

    // === PINPOINT ===
    addPin(name, x, y) {
        this.pins.push({ id: 'p' + Date.now(), name, x, y });
        this.save(); this.render(); this.checkSearch();
    }

    delPin(id) {
        this.pins = this.pins.filter(p => p.id !== id);
        this.conns = this.conns.filter(c => c.fromId !== id && c.toId !== id);
        this.save(); this.render(); this.checkSearch();
    }

    // === CONNECT ===
    startConn(id) {
        if (this.connFrom === id) { this.cancelConn(); return; }
        this.connFrom = id;
        this.render();
    }

    cancelConn() {
        this.connFrom = null; this.connTo = null;
        this.render();
    }

    submitConn(distance, mode) {
        let c = this.conns.find(c =>
            (c.fromId === this.connFrom && c.toId === this.connTo) ||
            (c.fromId === this.connTo && c.toId === this.connFrom)
        );
        if (c) {
            if (c.transports.find(t => t.mode === mode)) { alert(mode + ' sudah ada!'); return; }
            c.transports.push({ mode, distance });
        } else {
            this.conns.push({
                id: 'c' + Date.now(), fromId: this.connFrom, toId: this.connTo,
                transports: [{ mode, distance }]
            });
        }
        this.hide(this.d.popupConn); this.cancelConn();
        this.save(); this.render();
    }

    // === LINE SELECT & DELETE ===
    selectLine(id) { this.selLine = this.selLine === id ? null : id; this.render(); }

    delLine() {
        if (!this.selLine) return;
        this.conns = this.conns.filter(c => c.id !== this.selLine);
        this.selLine = null;
        this.save(); this.render();
    }

    // Deteksi apakah klik dekat garis (hitung jarak titik ke segmen)
    clickedLine(e) {
        const pos = this.map.screenToMap(e.clientX, e.clientY);
        const thr = 8 / this.map.scale;
        for (const c of this.conns) {
            const a = this.pins.find(p => p.id === c.fromId);
            const b = this.pins.find(p => p.id === c.toId);
            if (!a || !b) continue;
            const dx = b.x - a.x, dy = b.y - a.y, lSq = dx * dx + dy * dy;
            if (lSq === 0) continue;
            const t = Math.max(0, Math.min(1, ((pos.x - a.x) * dx + (pos.y - a.y) * dy) / lSq));
            if (Math.sqrt((pos.x - a.x - t * dx) ** 2 + (pos.y - a.y - t * dy) ** 2) < thr) return c.id;
        }
        return null;
    }

    // === ROUTE SEARCH (DFS + Kombinasi) ===
    checkSearch() {
        const f = this.d.from.value.trim(), t = this.d.to.value.trim();
        this.d.search.disabled = !(f !== t && this.pins.some(p => p.name === f) && this.pins.some(p => p.name === t));
    }

    search() {
        const from = this.pins.find(p => p.name === this.d.from.value.trim());
        const to = this.pins.find(p => p.name === this.d.to.value.trim());
        if (!from || !to) return;

        // DFS: cari semua jalur
        const paths = [], visited = new Set([from.id]);
        const dfs = (cur, path) => {
            if (cur === to.id) { paths.push([...path]); return; }
            for (const c of this.conns) {
                const nid = c.fromId === cur ? c.toId : c.toId === cur ? c.fromId : null;
                if (nid && !visited.has(nid)) {
                    visited.add(nid);
                    path.push({ from: cur, to: nid, conn: c });
                    dfs(nid, path);
                    path.pop(); visited.delete(nid);
                }
            }
        };
        dfs(from.id, []);

        // Generate kombinasi transport
        this.routes = [];
        const combo = (path, i, cur) => {
            if (i === path.length) {
                let dur = 0, cost = 0;
                const steps = cur.map(s => {
                    const cfg = TR[s.mode];
                    dur += s.dist / cfg.speed;
                    cost += s.dist * cfg.cost;
                    return { from: this.pins.find(p => p.id === s.from).name,
                             to: this.pins.find(p => p.id === s.to).name, label: cfg.label };
                });
                this.routes.push({ name: steps[0].from + ' - ' + steps[steps.length - 1].to, steps, dur, cost });
                return;
            }
            for (const t of path[i].conn.transports)
                combo(path, i + 1, [...cur, { from: path[i].from, to: path[i].to, mode: t.mode, dist: t.distance }]);
        };
        paths.forEach(p => combo(p, 0, []));

        this.d.sortCtrl.classList.remove('hidden');
        this.display();
    }

    display() {
        const sorted = [...this.routes]
            .sort((a, b) => this.sortMode === 'fastest' ? a.dur - b.dur : a.cost - b.cost)
            .slice(0, 10);

        this.d.results.innerHTML = sorted.length === 0 ? '<p style="color:#999">No routes found</p>'
            : sorted.map(r => `<div class="route-card"><h3>${r.name}</h3>
                <div class="steps">${r.steps.map((s, i) => `<div>${i + 1}. ${s.from} → ${s.to} (${s.label})</div>`).join('')}</div>
                <div class="info"><span>${this._dur(r.dur)}</span><span>Rp${r.cost.toLocaleString('id-ID')}</span></div></div>`).join('');
    }

    _dur(h) { const hr = Math.floor(h), m = Math.round((h - hr) * 60); return hr ? (m ? hr + 'h ' + m + 'min' : hr + 'h') : m + 'min'; }

    // === POPUP ===
    popup(el, e) { el.style.left = (e.clientX + 10) + 'px'; el.style.top = (e.clientY - 10) + 'px'; el.classList.remove('hidden'); }
    hide(el) { el.classList.add('hidden'); }

    // === EVENTS ===
    events() {
        const area = this.map.area;

        // Zoom: CTRL+Scroll
        area.addEventListener('wheel', e => {
            if (!e.ctrlKey) return; e.preventDefault();
            this.map.zoomAt(e.clientX, e.clientY, e.deltaY < 0 ? 1.15 : 0.85, W, H);
        }, { passive: false });

        // Zoom: CTRL +/-
        document.addEventListener('keydown', e => {
            if (!e.ctrlKey) return;
            if (e.key === '+' || e.key === '=') { e.preventDefault(); this.map.zoomCenter(1.15, W, H); }
            if (e.key === '-') { e.preventDefault(); this.map.zoomCenter(0.85, W, H); }
        });

        // Pan
        area.addEventListener('mousedown', e => {
            if (e.target.closest('.pinpoint,.popup') || e.button !== 0) return;
            this.map.startDrag(e);
        });
        document.addEventListener('mousemove', e => this.map.moveDrag(e, W, H));
        document.addEventListener('mouseup', () => this.map.stopDrag());

        // Double-click: tambah pinpoint
        area.addEventListener('dblclick', e => {
            if (e.target.closest('.pinpoint,.popup,#route-panel')) return;
            this.clickPos = this.map.screenToMap(e.clientX, e.clientY);
            this.popup(this.d.popupAdd, e);
            this.d.name.value = ''; this.d.name.focus();
        });

        // Form: add pinpoint
        document.getElementById('form-add').onsubmit = e => {
            e.preventDefault();
            const n = this.d.name.value.trim(); if (!n) return;
            this.addPin(n, this.clickPos.x, this.clickPos.y);
            this.hide(this.d.popupAdd);
        };

        // Form: connect
        document.getElementById('form-connect').onsubmit = e => {
            e.preventDefault();
            const dist = parseInt(this.d.dist.value), mode = this.d.mode.value;
            if (dist && mode) this.submitConn(dist, mode);
        };

        // Close popup
        document.getElementById('close-add').onclick = () => this.hide(this.d.popupAdd);
        document.getElementById('close-connect').onclick = () => { this.hide(this.d.popupConn); this.cancelConn(); };

        // Delete line & Escape
        document.addEventListener('keydown', e => {
            if ((e.key === 'Delete' || e.key === 'Backspace') && this.selLine && !e.target.matches('input,select,textarea')) { e.preventDefault(); this.delLine(); }
            if (e.key === 'Escape') { this.hide(this.d.popupAdd); this.hide(this.d.popupConn); this.cancelConn(); this.selLine = null; this.render(); }
        });

        // Klik peta: pilih garis atau cancel
        area.addEventListener('click', e => {
            if (e.target.closest('.pinpoint,.popup')) return;
            const lid = this.clickedLine(e);
            if (lid) { this.selectLine(lid); return; }
            if (this.connFrom) this.cancelConn();
            if (this.selLine) { this.selLine = null; this.render(); }
        });

        // Route
        this.d.from.oninput = () => this.checkSearch();
        this.d.to.oninput = () => this.checkSearch();
        this.d.search.onclick = () => this.search();

        // Sort
        document.querySelectorAll('.sort-btn').forEach(btn => {
            btn.onclick = () => {
                document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.sortMode = btn.dataset.sort;
                this.display();
            };
        });
    }
}

window.addEventListener('load', () => new App());
