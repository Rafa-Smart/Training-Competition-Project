var T = 50,
  C = 15,
  R = 12,
  I = {};
var DIRS = {
  ArrowLeft: [-1, 0, "left"],
  ArrowRight: [1, 0, "right"],
  ArrowUp: [0, -1, "up"],
  ArrowDown: [0, 1, "down"],
  a: [-1, 0, "left"],
  d: [1, 0, "right"],
  w: [0, -1, "up"],
  s: [0, 1, "down"],
};
var STONES = (() => {
  let s = [];
  for (let c = 0; c < C; c++) {
    s.push([0, c], [R - 1, c]);
  }
  for (let r = 1; r < R - 1; r++) {
    s.push([r, 0], [r, C - 1]);
  }
  for (let r = 2; r < R - 1; r += 2)
    for (let c = 2; c < C - 1; c += 2) s.push([r, c]);
  return s;
})();

function $(i) {
  return document.getElementById(i);
}
function tog(i, v) {
  $(i).classList.toggle("hidden", !v);
}
function img(k, x, y, s = T, t = T) {
  I[k] && G.ctx.drawImage(I[k], x, y, s, t);
}
function rc() {
  return Math.round;
}
function fmtT(ms) {
  let s = Math.floor(ms / 1000),
    m = Math.floor(s / 60);
  s %= 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function loadImgs(cb) {
  let n = 0,
    list = [
      "background",
      "bomb",
      "char_down",
      "char_left",
      "char_right",
      "char_up",
      "dog_down",
      "dog_left",
      "dog_right",
      "dog_up",
      "explosion",
      "heart",
      "heart_indicator",
      "ice",
      "tnt",
      "wall",
    ];
  list.forEach((k) => {
    let im = new Image();
    im.onload = im.onerror = () => {
      if (++n === list.length) cb();
    };
    im.src = `assets/${k}.png`;
    I[k] = im;
  });
}

class Entity {
  constructor(c, r) {
    this.col = c;
    this.row = r;
    this.px = c * T;
    this.py = r * T;
    this.alive = true;
  }
  hits(e) {
    return Math.abs(this.px - e.px) < T - 8 && Math.abs(this.py - e.py) < T - 8;
  }
  snap() {
    this.col = Math.round(this.px / T);
    this.row = Math.round(this.py / T);
  }
  move(dx, dy) {
    if (dx < 0) this.dir = "left";
    if (dx > 0) this.dir = "right";
    if (dy < 0) this.dir = "up";
    if (dy > 0) this.dir = "down";
    if (!G.blocked(this.px + dx, this.py)) this.px += dx;
    if (!G.blocked(this.px, this.py + dy)) this.py += dy;
    this.snap();
    if (dx || dy) {
      this.ft = (this.ft || 0) + 16;
      if (this.ft > 250) {
        this.frame ^= 1;
        this.ft = 0;
      }
    }
  }
}

class Player extends Entity {
  constructor() {
    super(1, 1);
    this.dir = "down";
    this.frame = 0;
    this.ft = 0;
    this.hearts = 3;
    this.frozen = 0;
    this.inv = 0;
    this.range = 1;
    this.badges = [];
  }
  update(dt) {
    if (this.frozen > 0) {
      this.frozen -= dt;
      return;
    }
    if (this.inv > 0) this.inv -= dt;
    for (let k in G.keys) {
      let d = DIRS[k];
      if (d) {
        this.move(d[0] * 3, d[1] * 3);
        break;
      }
    }
  }
  draw() {
    if (this.inv > 0 && Math.floor(this.inv / 100) % 2 === 0) return;
    img("char_" + this.dir, this.px, this.py);
    this.badges.forEach((b, i) =>
      img(b, this.px + i * 18, this.py - 14, 16, 16),
    );
  }
}

class Dog extends Entity {
  constructor(c, r) {
    super(c, r);
    this.dir = "down";
    this.frame = 0;
    this.ft = 0;
    this.pt = 0;
    this.path = [];
  }
  update(dt) {
    if (!this.alive) return;
    this.pt += dt;
    if (this.pt > 800) {
      this.path = this.bfs();
      this.pt = 0;
    }
    if (this.path.length) {
      let [nc, nr] = this.path[0],
        tx = nc * T,
        ty = nr * T,
        sp = 1.5;
      if (Math.abs(this.px - tx) < sp + 1 && Math.abs(this.py - ty) < sp + 1) {
        this.px = tx;
        this.py = ty;
        this.path.shift();
      } else {
        let dx = tx > this.px ? sp : tx < this.px ? -sp : 0,
          dy = ty > this.py ? sp : ty < this.py ? -sp : 0;
        this.move(dx || 0, dy || 0);
      }
    } else {
      let d = [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ][(Math.random() * 4) | 0];
      this.move(d[0] * 1.5, d[1] * 1.5);
    }
  }
  bfs() {
    let sc = Math.round(this.px / T),
      sr = Math.round(this.py / T),
      { col: tc, row: tr } = G.player;
    let vis = { [sc + "," + sr]: 1 },
      q = [[sc, sr, []]];
    while (q.length) {
      let [cc, cr, p] = q.shift();
      if (cc === tc && cr === tr) return p;
      if (p.length > 15) continue;
      for (let [nc, nr] of [
        [cc + 1, cr],
        [cc - 1, cr],
        [cc, cr + 1],
        [cc, cr - 1],
      ]) {
        let k = nc + "," + nr;
        if (!vis[k] && !G.solid(nc, nr)) {
          vis[k] = 1;
          q.push([nc, nr, [...p, [nc, nr]]]);
        }
      }
    }
    return [];
  }
  draw() {
    if (this.alive) img("dog_" + this.dir, this.px, this.py);
  }
}

var G = {
  keys: {},
  map: [],
  player: null,
  dogs: [],
  bombs: [],
  exps: [],
  items: [],
  paused: false,
  over: false,
  elapsed: 0,
  walls: 0,
  tnt: 0,
  ice: 0,
  _score: null,

  solid(c, r) {
    return (
      c < 0 ||
      r < 0 ||
      c >= C ||
      r >= R ||
      this.map[r][c] !== 0 ||
      this.bombs.some((b) => !b.exp && b.col === c && b.row === r)
    );
  },
  blocked(px, py) {
    let m = 4,
      p = [
        [px + m, py + m],
        [px + T - m, py + m],
        [px + m, py + T - m],
        [px + T - m, py + T - m],
      ];
    return p.some(([x, y]) => this.solid((x / T) | 0, (y / T) | 0));
  },

  init(user, level) {
    Object.assign(this, {
      username: user,
      level,
      walls: 0,
      tnt: 0,
      ice: 0,
      elapsed: 0,
      bombs: [],
      exps: [],
      items: [],
      dogs: [],
      paused: false,
      over: false,
      _score: null,
    });
    this.map = Array.from({ length: R }, (_, r) =>
      Array.from({ length: C }, (_, c) => {
        if (STONES.some(([sr, sc]) => sr === r && sc === c)) return 1;
        if (!(r <= 2 && c <= 2) && Math.random() < 0.45) return 2;
        return 0;
      }),
    );
    this.player = new Player();
    let dc = { easy: 1, medium: 2, hard: 3 }[level];
    for (let i = 0; i < dc; i++) {
      let [c, r] = this.rEmpty(3);
      this.dogs.push(new Dog(c, r));
    }
    document.onkeydown = (e) => {
      this.keys[e.key] = true;
      if (e.key === " " && !this._sp) {
        this._sp = 1;
        this.bomb();
      }
      if (e.key === "Escape") this.pause();
      e.preventDefault();
    };
    document.onkeyup = (e) => {
      this.keys[e.key] = false;
      if (e.key === " ") this._sp = 0;
    };
    this.lastT = null;
    requestAnimationFrame((ts) => this.loop(ts));
  },

  rEmpty(d) {
    for (let i = 0; i < 200; i++) {
      let c = (1 + Math.random() * (C - 2)) | 0,
        r = (1 + Math.random() * (R - 2)) | 0;
      if (!this.map[r][c] && c + r > d) return [c, r];
    }
    return [C - 2, R - 2];
  },

  bomb() {
    if (this.paused || this.over || this.player.frozen > 0) return;
    let c = Math.round(this.player.px / T),
      r = Math.round(this.player.py / T);
    if (!this.bombs.some((b) => b.col === c && b.row === r))
      this.bombs.push({
        col: c,
        row: r,
        t: 5000,
        range: this.player.range,
        exp: false,
        et: 0,
        alive: true,
      });
  },

  pause() {
    if (!this.over) {
      this.paused = !this.paused;
      tog("pauseModal", this.paused);
    }
  },

  explode(b) {
    [
      [0, 0],
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ].forEach(([dc, dr]) => {
      for (let i = 0; i <= b.range; i++) {
        let c = b.col + dc * i,
          r = b.row + dr * i;
        if (c < 0 || r < 0 || c >= C || r >= R || this.map[r][c] === 1) break;
        this.exps.push({ col: c, row: r, t: 600 });
        if (this.map[r][c] === 2) {
          this.map[r][c] = 0;
          this.walls++;
          let t = Math.random(),
            tp = t < 0.2 ? "broken" : t < 0.4 ? "tnt" : t < 0.55 ? "ice" : null;
          if (tp) this.items.push({ col: c, row: r, type: tp });
          break;
        }
      }
    });
  },

  loop(ts) {
    if (!this.lastT) this.lastT = ts;
    let dt = ts - this.lastT;
    this.lastT = ts;
    if (!this.paused && !this.over) {
      this.elapsed += dt;
      this.update(dt);
      this.render();
      this.hud();
    }
    if (!this.over) requestAnimationFrame((ts) => this.loop(ts));
  },

  update(dt) {
    this.player.update(dt);
    this.dogs.forEach((d) => d.update(dt));
    this.bombs.forEach((b) => {
      b.t -= dt;
      if (b.t <= 0 && !b.exp) {
        b.exp = true;
        b.et = 600;
        this.explode(b);
      }
      if (b.exp) {
        b.et -= dt;
        if (b.et <= 0) b.alive = false;
      }
    });
    this.bombs = this.bombs.filter((b) => b.alive);
    this.exps = this.exps.filter((e) => {
      e.t -= dt;
      return e.t > 0;
    });
    let { player: p } = this,
      pc = Math.round(p.px / T),
      pr = Math.round(p.py / T);
    if (p.inv <= 0) {
      let hit =
        this.exps.some((e) => e.col === pc && e.row === pr) ||
        this.dogs.some((d) => d.alive && d.hits(p));
      if (hit) {
        p.hearts--;
        p.inv = 2000;
        if (p.hearts <= 0) this.end();
      }
    }
    this.dogs.forEach((d) => {
      if (d.alive && this.exps.some((e) => e.col === d.col && e.row === d.row))
        d.alive = false;
    });
    this.items = this.items.filter((it) => {
      if (it.col !== pc || it.row !== pr) return true;
      if (it.type === "broken") {
        p.hearts--;
        p.badges.push("heart_indicator");
        if (p.hearts <= 0) this.end();
      }
      if (it.type === "tnt") {
        p.range *= 2;
        this.tnt++;
        p.badges.push("tnt");
      }
      if (it.type === "ice") {
        p.frozen = 5000;
        this.ice++;
        p.badges.push("ice");
      }
      return false;
    });
  },

  render() {
    let { ctx, map } = this;
    for (let r = 0; r < R; r++)
      for (let c = 0; c < C; c++) {
        if (map[r][c] === 1) img("background", c * T, r * T);
        else {
          ctx.fillStyle = "#3a7d44";
          ctx.fillRect(c * T, r * T, T, T);
        }
        if (map[r][c] === 2) img("wall", c * T, r * T);
      }
    this.items.forEach((it) =>
      img(
        { broken: "heart_indicator", tnt: "tnt", ice: "ice" }[it.type],
        it.col * T + 8,
        it.row * T + 8,
        T - 16,
        T - 16,
      ),
    );
    this.bombs.forEach((b) => {
      if (!b.exp) img("bomb", b.col * T, b.row * T);
    });
    this.exps.forEach((e) => img("explosion", e.col * T, e.row * T));
    this.dogs.forEach((d) => d.draw());
    this.player.draw();
  },

  hud() {
    let p = this.player;
    $("sidePlayer").textContent = "Player: " + this.username;
    $("sideTime").textContent = "Time: " + fmtT(this.elapsed);
    $("sideHearts").innerHTML = Array.from(
      { length: 3 },
      (_, i) =>
        `<img src="assets/heart${i < p.hearts ? "" : "_indicator"}.png">`,
    ).join("");
    $("scoreWalls").textContent = this.walls;
    $("scoreTnt").textContent = this.tnt;
    $("scoreIce").textContent = this.ice;
  },

  end() {
    this.over = true;
    document.onkeydown = document.onkeyup = null;
    let t = fmtT(this.elapsed);
    $("goMsg").textContent = `Good job ${this.username}! Time: ${t}`;
    $("goStats").innerHTML =
      `<img src="assets/explosion.png" class="icon"> = ${this.walls} <img src="assets/tnt.png" class="icon"> = ${this.tnt} <img src="assets/ice.png" class="icon"> = ${this.ice}`;
    tog("gameOverModal", true);
    this._score = {
      name: this.username,
      time: t,
      walls: this.walls,
      tnt: this.tnt,
      ice: this.ice,
    };
  },
};

loadImgs(() => {
  let u = $("username"),
    lv = $("level"),
    bp = $("btnPlay");
  u.oninput = lv.onchange = () => (bp.disabled = !(u.value.trim() && lv.value));
  bp.onclick = () => {
    hide("welcome");
    tog("countdown", true);
    let n = 3,
      el = $("countNum");
    el.textContent = n;
    let iv = setInterval(() => {
      if (--n > 0) el.textContent = n;
      else {
        clearInterval(iv);
        tog("countdown", false);
        tog("gameWrap", true);
        G.init(u.value.trim(), lv.value);
      }
    }, 1000);
  };
  function hide(id) {
    tog(id, false);
  }
  $("btnInstruction").onclick = () => tog("instructionModal", true);
  $("closeInstruction").onclick = () => tog("instructionModal", false);
  $("btnContinue").onclick = () => {
    tog("pauseModal", false);
    G.paused = false;
  };
  $("btnSave").onclick = () => {
    if (!G._score) return;
    let s = JSON.parse(localStorage.getItem("bomskuy") || "[]");
    s.push(G._score);
    localStorage.setItem("bomskuy", JSON.stringify(s));
    $("btnSave").textContent = "Saved!";
    $("btnSave").disabled = true;
  };
  $("btnLeaderboard").onclick = $("btnReset").onclick = function () {
    if (this.id === "btnReset") localStorage.removeItem("bomskuy");
    let s = JSON.parse(localStorage.getItem("bomskuy") || "[]").sort(
      (a, b) => b.walls - a.walls || b.tnt - a.tnt || b.ice - a.ice,
    );
    $("leaderBody").innerHTML = s
      .map(
        (r) =>
          `<tr><td>${r.name}</td><td>${r.time}</td><td>${r.walls}</td><td>${r.tnt}</td><td>${r.ice}</td></tr>`,
      )
      .join("");
    tog("gameOverModal", false);
    tog("leaderModal", true);
  };
  $("btnPlayAgain").onclick = () => {
    tog("leaderModal", false);
    tog("gameWrap", false);
    tog("welcome", true);
    u.value = "";
    lv.value = "";
    bp.disabled = true;
  };
});
