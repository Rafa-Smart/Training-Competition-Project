import { AppConfig } from './Config.js';

export class Graph {
  constructor(pins = [], conns = []) {
    this.pins = pins;
    this.conns = conns;
  }

  findPin(id) {
    return this.pins.find(p => p.id === id) || null;
  }

  addPin(name, x, y) {
    this.pins.push({ id: "p" + Date.now(), name, x, y });
  }

  deletePin(id) {
    this.pins = this.pins.filter(p => p.id !== id);
    this.conns = this.conns.filter(c => c.fromId !== id && c.toId !== id);
  }

  submitConnect(fromId, toId, dist, mode) {
    let ex = this.conns.find(c => 
      (c.fromId === fromId && c.toId === toId) || 
      (c.fromId === toId && c.toId === fromId)
    );

    if (ex) {
      if (ex.transports.some(t => t.mode === mode)) {
        alert(mode + " sudah ada!");
        return;
      }
      ex.transports.push({ mode: mode, distance: dist });
    } else {
      this.conns.push({
        id: "c" + Date.now(),
        fromId: fromId,
        toId: toId,
        transports: [{ mode: mode, distance: dist }],
      });
    }
  }

  deleteLine(selectedLineId) {
    this.conns = this.conns.filter(c => c.id !== selectedLineId);
  }

  // Validasi sebelum pencarian rute
  isValidRoute(fromName, toName) {
    const fOk = this.pins.some(p => p.name === fromName);
    const tOk = this.pins.some(p => p.name === toName);
    return fromName !== toName && fOk && tOk;
  }

  // ALGORITMA DFS (Versi Lengkap)
  searchRoutes(fromName, toName, sortMode) {
    let fp = this.pins.find(p => p.name === fromName);
    let tp = this.pins.find(p => p.name === toName);
    
    if (!fp || !tp) return [];

    let routes = [];
    let vis = {};
    vis[fp.id] = true;

    const dfs = (cur, path) => {
      if (cur === tp.id) {
        let dur = 0, cost = 0, steps = [];

        path.forEach(s => {
          let tr = s.conn.transports;
          let from = this.findPin(s.from).name;
          let to = this.findPin(s.to).name;

          let best = tr[0];
          let bestVal = Infinity;

          tr.forEach(t => {
            let cfg = AppConfig.TR[t.mode];
            let val = sortMode === "fastest" ? t.distance / cfg.speed : t.distance * cfg.cost;
            if (val < bestVal) {
              bestVal = val;
              best = t;
            }
          });

          let cfg = AppConfig.TR[best.mode];
          dur += best.distance / cfg.speed;
          cost += best.distance * cfg.cost;
          steps.push(`${from} → ${to} (${cfg.label}, ${best.distance}km)`);
        });

        routes.push({ dur, cost, steps });
        return;
      }

      for (let i = 0; i < this.conns.length; i++) {
        let c = this.conns[i];
        let next = null;

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
    };

    dfs(fp.id, []);

    // Return rute yang sudah disortir (max 10)
    return routes
      .sort((a, b) => sortMode === "fastest" ? a.dur - b.dur : a.cost - b.cost)
      .slice(0, 10);
  }
}
