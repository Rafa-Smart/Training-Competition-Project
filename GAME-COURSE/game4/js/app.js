// PETA INTERAKTIF — Fullscreen + Route sebagai Popup
// Semua dalam 1 file, simple, semua fitur lengkap

var MW = 982, MH = 450;
var TR = {
    train: { color: '#33E339', speed: 120, cost: 500, label: 'Train' },
    bus: { color: '#A83BE8', speed: 80, cost: 100, label: 'Bus' },
    airplane: { color: '#000000', speed: 800, cost: 1000, label: 'Airplane' }
};

// State
var pins = [], conns = [];
var scale = 1, ox = 0, oy = 0;
var dragging = false, dragX, dragY, sox, soy;
var connectFrom = null, connectTo = null, selectedLine = null;
var clickPos = {}, sortMode = 'fastest', routes = [];

// DOM
var $ = function (id) { return document.getElementById(id); };
var area = $('map-area'), container = $('map-container');
var svg = $('lines-layer'), pinsEl = $('pinpoints-layer');
var popAdd = $('popup-add'), popConn = $('popup-connect'), popRoute = $('popup-route');
var inName = $('input-name'), inDist = $('input-distance'), inMode = $('input-mode');
var inFrom = $('input-from'), inTo = $('input-to'), btnSearch = $('btn-search');
var sortCtrl = $('sort-controls'), results = $('route-results');

// === SAVE / LOAD ===
function save() {
    localStorage.setItem('pins', JSON.stringify(pins));
    localStorage.setItem('conns', JSON.stringify(conns));
}
function load() {
    pins = JSON.parse(localStorage.getItem('pins') || '[]');
    conns = JSON.parse(localStorage.getItem('conns') || '[]');
}

// === TRANSFORM ===
function apply() {
    container.style.transform = 'translate(' + ox + 'px,' + oy + 'px) scale(' + scale + ')';
    svg.setAttribute('width', MW);
    svg.setAttribute('height', MH);
}

function fit() {
    var w = area.clientWidth, h = area.clientHeight;
    scale = Math.max(w / MW, h / MH);
    ox = (w - MW * scale) / 2;
    oy = (h - MH * scale) / 2;
}

function zoom(cx, cy, f) {
    var r = area.getBoundingClientRect();
    var mx = cx - r.left, my = cy - r.top;
    var px = (mx - ox) / scale, py = (my - oy) / scale;
    scale = Math.max(0.3, Math.min(15, scale * f));
    ox = mx - px * scale;
    oy = my - py * scale;
    apply();
}

function toMap(cx, cy) {
    var r = area.getBoundingClientRect();
    return { x: (cx - r.left - ox) / scale, y: (cy - r.top - oy) / scale };
}

// === RENDER ===
function render() {
    renderPins();
    renderLines();
    apply();
}

function renderPins() {
    pinsEl.innerHTML = '';
    for (var i = 0; i < pins.length; i++) {
        var p = pins[i], el = document.createElement('div');
        el.className = 'pinpoint';
        el.style.left = p.x + 'px';
        el.style.top = p.y + 'px';

        var lbl = document.createElement('div');
        lbl.className = 'pinpoint-label' + (connectFrom === p.id ? ' connecting' : '');
        lbl.innerHTML = '<span>' + p.name + '</span>' +
            '<img src="assets/MdiTransitConnectionVariant.svg" class="btn-icon" title="Connect">' +
            '<img src="assets/MdiTrashCanOutline.svg" class="btn-icon" title="Delete">';

        var btns = lbl.querySelectorAll('.btn-icon');
        btns[0].setAttribute('data-id', p.id);
        btns[0].onclick = function (e) { e.stopPropagation(); startConnect(this.getAttribute('data-id')); };
        btns[1].setAttribute('data-id', p.id);
        btns[1].onclick = function (e) { e.stopPropagation(); deletePin(this.getAttribute('data-id')); };
        el.appendChild(lbl);

        var mk = document.createElement('div');
        mk.className = 'pinpoint-marker';
        mk.innerHTML = '<svg viewBox="0 0 24 24"><path fill="#E53935" d="M12 12q.825 0 1.413-.587T14 10t-.587-1.412T12 8t-1.412.588T10 10t.588 1.413T12 12m0 10q-4.025-3.425-6.012-6.362T4 10.2q0-3.75 2.413-5.975T12 2t5.588 2.225T20 10.2q0 2.5-1.987 5.438T12 22"/></svg>';
        el.appendChild(mk);

        el.setAttribute('data-id', p.id);
        el.onclick = function (e) {
            e.stopPropagation();
            var id = this.getAttribute('data-id');
            if (connectFrom && connectFrom !== id) {
                connectTo = id;
                showPop(popConn, e);
                inDist.value = ''; inMode.value = ''; inDist.focus();
            }
        };
        pinsEl.appendChild(el);
    }
}

function renderLines() {
    svg.innerHTML = '';
    for (var i = 0; i < conns.length; i++) {
        var c = conns[i], a = findPin(c.fromId), b = findPin(c.toId);
        if (!a || !b) continue;
        var n = c.transports.length;
        for (var j = 0; j < n; j++) {
            var t = c.transports[j], off = offset(a, b, j, n);
            var x1 = a.x + off.x, y1 = a.y + off.y, x2 = b.x + off.x, y2 = b.y + off.y;

            var line = svgLine(x1, y1, x2, y2);
            line.setAttribute('stroke', TR[t.mode].color);
            line.classList.add('line-visible');
            if (selectedLine === c.id) line.classList.add('selected');
            svg.appendChild(line);

            var txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            txt.setAttribute('x', (x1 + x2) / 2);
            txt.setAttribute('y', (y1 + y2) / 2 - 5);
            txt.setAttribute('text-anchor', 'middle');
            txt.setAttribute('fill', TR[t.mode].color);
            txt.textContent = t.distance;
            svg.appendChild(txt);
        }
    }
}

function svgLine(x1, y1, x2, y2) {
    var l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    l.setAttribute('x1', x1); l.setAttribute('y1', y1);
    l.setAttribute('x2', x2); l.setAttribute('y2', y2);
    return l;
}

function offset(a, b, i, n) {
    if (n <= 1) return { x: 0, y: 0 };
    var dx = b.x - a.x, dy = b.y - a.y, len = Math.sqrt(dx * dx + dy * dy) || 1;
    var s = -(n - 1) * 3 + i * 6;
    return { x: (-dy / len) * s, y: (dx / len) * s };
}

function findPin(id) {
    for (var i = 0; i < pins.length; i++) if (pins[i].id === id) return pins[i];
    return null;
}

// === PINPOINT ===
function addPin(name, x, y) {
    pins.push({ id: 'p' + Date.now(), name: name, x: x, y: y });
    save(); render(); checkSearch();
}

function deletePin(id) {
    pins = pins.filter(function (p) { return p.id !== id; });
    conns = conns.filter(function (c) { return c.fromId !== id && c.toId !== id; });
    save(); render(); checkSearch();
}

// === KONEKSI ===
function startConnect(id) {
    connectFrom = connectFrom === id ? null : id;
    render();
}

function cancelConnect() { connectFrom = null; connectTo = null; render(); }

function submitConnect(dist, mode) {
    var ex = null;
    for (var i = 0; i < conns.length; i++) {
        var c = conns[i];
        if ((c.fromId === connectFrom && c.toId === connectTo) ||
            (c.fromId === connectTo && c.toId === connectFrom)) { ex = c; break; }
    }
    if (ex) {
        for (var j = 0; j < ex.transports.length; j++)
            if (ex.transports[j].mode === mode) { alert(mode + ' sudah ada!'); return; }
        ex.transports.push({ mode: mode, distance: dist });
    } else {
        conns.push({
            id: 'c' + Date.now(), fromId: connectFrom, toId: connectTo,
            transports: [{ mode: mode, distance: dist }]
        });
    }
    hidePop(popConn); cancelConnect(); save(); render();
}

// === GARIS ===
function selectLine(id) { selectedLine = selectedLine === id ? null : id; render(); }

function deleteLine() {
    if (!selectedLine) return;
    conns = conns.filter(function (c) { return c.id !== selectedLine; });
    selectedLine = null; save(); render();
}

function findClickedLine(e) {
    var pos = toMap(e.clientX, e.clientY), th = 8 / scale;
    for (var i = 0; i < conns.length; i++) {
        var c = conns[i], a = findPin(c.fromId), b = findPin(c.toId);
        if (!a || !b) continue;
        var dx = b.x - a.x, dy = b.y - a.y, sq = dx * dx + dy * dy;
        if (!sq) continue;
        var t = Math.max(0, Math.min(1, ((pos.x - a.x) * dx + (pos.y - a.y) * dy) / sq));
        var ex = pos.x - (a.x + t * dx), ey = pos.y - (a.y + t * dy);
        if (Math.sqrt(ex * ex + ey * ey) < th) return c.id;
    }
    return null;
}

// === CARI RUTE ===
function checkSearch() {
    var f = inFrom.value.trim(), t = inTo.value.trim(), fOk = false, tOk = false;
    for (var i = 0; i < pins.length; i++) {
        if (pins[i].name === f) fOk = true;
        if (pins[i].name === t) tOk = true;
    }
    btnSearch.disabled = !(f !== t && fOk && tOk);
}

function searchRoutes() {
    var fp = null, tp = null;
    for (var i = 0; i < pins.length; i++) {
        if (pins[i].name === inFrom.value.trim()) fp = pins[i];
        if (pins[i].name === inTo.value.trim()) tp = pins[i];
    }
    if (!fp || !tp) return;

    var paths = [], vis = {};
    vis[fp.id] = true;

    function dfs(cur, path) {
        if (cur === tp.id) { paths.push(path.slice()); return; }
        for (var i = 0; i < conns.length; i++) {
            var c = conns[i], next = null;
            if (c.fromId === cur) next = c.toId;
            else if (c.toId === cur) next = c.fromId;
            if (next && !vis[next]) {
                vis[next] = true;
                path.push({ from: cur, to: next, conn: c });
                dfs(next, path);
                path.pop();
                delete vis[next];
            }
        }
    }
    dfs(fp.id, []);

    routes = [];
    function combine(path, si, cur) {
        if (si === path.length) {
            var dur = 0, cost = 0, steps = [];
            for (var k = 0; k < cur.length; k++) {
                var s = cur[k], cfg = TR[s.mode];
                dur += s.dist / cfg.speed;
                cost += s.dist * cfg.cost;
                steps.push({ from: findPin(s.from).name, to: findPin(s.to).name, label: cfg.label });
            }
            routes.push({ name: steps[0].from + ' - ' + steps[steps.length - 1].to, steps: steps, dur: dur, cost: cost });
            return;
        }
        var step = path[si];
        for (var j = 0; j < step.conn.transports.length; j++) {
            var tr = step.conn.transports[j], next = cur.slice();
            next.push({ from: step.from, to: step.to, mode: tr.mode, dist: tr.distance });
            combine(path, si + 1, next);
        }
    }
    for (var p = 0; p < paths.length; p++) combine(paths[p], 0, []);

    sortCtrl.classList.remove('hidden');
    showRoutes();
}

function showRoutes() {
    var sorted = routes.slice().sort(function (a, b) {
        return sortMode === 'fastest' ? a.dur - b.dur : a.cost - b.cost;
    }).slice(0, 10);

    if (!sorted.length) { results.innerHTML = '<p style="color:#999">No routes found</p>'; return; }

    var h = '';
    for (var i = 0; i < sorted.length; i++) {
        var r = sorted[i];
        h += '<div class="route-card"><h3>' + r.name + '</h3><div class="steps">';
        for (var j = 0; j < r.steps.length; j++) {
            var s = r.steps[j];
            h += '<div>' + (j + 1) + '. ' + s.from + ' → ' + s.to + ' (' + s.label + ')</div>';
        }
        h += '</div><div class="info"><span>' + fmtDur(r.dur) + '</span>';
        h += '<span>Rp' + r.cost.toLocaleString('id-ID') + '</span></div></div>';
    }
    results.innerHTML = h;
}

function fmtDur(hr) {
    var h = Math.floor(hr), m = Math.round((hr - h) * 60);
    return (h && m) ? h + 'h ' + m + 'min' : h ? h + 'h' : m + 'min';
}

// === POPUP ===
function showPop(el, e) {
    el.style.left = (e.clientX + 10) + 'px';
    el.style.top = (e.clientY - 10) + 'px';
    el.classList.remove('hidden');
}
function hidePop(el) { el.classList.add('hidden'); }

// === EVENTS ===
function setup() {
    // Buka route popup
    $('btn-route').onclick = function (e) {
        if (popRoute.classList.contains('hidden')) {
            popRoute.style.left = '16px';
            popRoute.style.top = '70px';
            popRoute.classList.remove('hidden');
        } else {
            hidePop(popRoute);
        }
    };
    $('close-route').onclick = function () { hidePop(popRoute); };

    // Zoom: Ctrl + scroll
    area.addEventListener('wheel', function (e) {
        if (!e.ctrlKey) return;
        e.preventDefault();
        zoom(e.clientX, e.clientY, e.deltaY < 0 ? 1.15 : 0.85);
    }, { passive: false });

    // Zoom: Ctrl +/-
    document.addEventListener('keydown', function (e) {
        if (!e.ctrlKey) return;
        if (e.key === '+' || e.key === '=') { e.preventDefault(); var r = area.getBoundingClientRect(); zoom(r.left + r.width / 2, r.top + r.height / 2, 1.15); }
        if (e.key === '-') { e.preventDefault(); var r2 = area.getBoundingClientRect(); zoom(r2.left + r2.width / 2, r2.top + r2.height / 2, 0.85); }
    });

    // Pan
    area.addEventListener('mousedown', function (e) {
        if (e.target.closest('.pinpoint,.popup') || e.button !== 0) return;
        dragging = true; dragX = e.clientX; dragY = e.clientY; sox = ox; soy = oy;
    });
    document.addEventListener('mousemove', function (e) {
        if (!dragging) return;
        ox = sox + (e.clientX - dragX); oy = soy + (e.clientY - dragY); apply();
    });
    document.addEventListener('mouseup', function () { dragging = false; });

    // Double click → add pinpoint
    area.addEventListener('dblclick', function (e) {
        if (e.target.closest('.pinpoint,.popup')) return;
        clickPos = toMap(e.clientX, e.clientY);
        showPop(popAdd, e); inName.value = ''; inName.focus();
    });

    // Form: add pinpoint
    $('form-add').onsubmit = function (e) {
        e.preventDefault();
        var n = inName.value.trim();
        if (n) { addPin(n, clickPos.x, clickPos.y); hidePop(popAdd); }
    };

    // Form: connect
    $('form-connect').onsubmit = function (e) {
        e.preventDefault();
        var d = parseInt(inDist.value), m = inMode.value;
        if (d && m) submitConnect(d, m);
    };

    // Close popups
    $('close-add').onclick = function () { hidePop(popAdd); };
    $('close-connect').onclick = function () { hidePop(popConn); cancelConnect(); };

    // Keyboard
    document.addEventListener('keydown', function (e) {
        var inp = e.target.matches('input,select,textarea');
        if ((e.key === 'Delete' || e.key === 'Backspace') && selectedLine && !inp) { e.preventDefault(); deleteLine(); }
        if (e.key === 'Escape') {
            hidePop(popAdd); hidePop(popConn); hidePop(popRoute);
            cancelConnect(); selectedLine = null; render();
        }
    });

    // Click map
    area.addEventListener('click', function (e) {
        if (e.target.closest('.pinpoint,.popup')) return;
        var lid = findClickedLine(e);
        if (lid) { selectLine(lid); return; }
        if (connectFrom) cancelConnect();
        if (selectedLine) { selectedLine = null; render(); }
    });

    // Route search
    inFrom.oninput = checkSearch;
    inTo.oninput = checkSearch;
    btnSearch.onclick = searchRoutes;

    // Sort buttons
    var sBtns = document.querySelectorAll('.sort-btn');
    for (var i = 0; i < sBtns.length; i++) {
        sBtns[i].onclick = function () {
            for (var j = 0; j < sBtns.length; j++) sBtns[j].classList.remove('active');
            this.classList.add('active');
            sortMode = this.getAttribute('data-sort');
            showRoutes();
        };
    }
}

// === START ===
window.onload = function () { load(); fit(); render(); setup(); };
